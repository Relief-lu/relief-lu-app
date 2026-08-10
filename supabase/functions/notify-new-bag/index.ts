// Supabase Edge Function — appelée par un Database Webhook sur INSERT dans `bags`.
// Notifie par Web Push les utilisateurs ayant mis le commerçant en favori.
// À déployer depuis le dashboard Supabase (Edge Functions → New function → coller ce code).

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@relief.lu";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// La lib "web-push" (pensée pour Node) plante sous Deno après l'envoi, en
// essayant de lire la réponse du service de push d'une façon incompatible —
// l'erreur survient hors de la chaîne await'ée du try/catch ci-dessous (donc
// jamais rattrapée normalement) et fait planter toute la fonction, même
// quand la notification a déjà été envoyée avec succès. On l'intercepte ici.
addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  console.error("rejet non intercepté ignoré (probable bug web-push/Deno) :", e.reason);
});

Deno.serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const payload = await req.json();
  const bag = payload.record;

  if (!bag || payload.type !== "INSERT") {
    return new Response("ignored", { status: 200 });
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("business_name")
    .eq("id", bag.merchant_id)
    .single();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("merchant_id", bag.merchant_id);

  const userIds = (favorites ?? []).map((f) => f.user_id);
  if (!userIds.length) return new Response("no favorites", { status: 200 });

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  const notification = JSON.stringify({
    title: merchant?.business_name ?? "Relief.lu",
    body: `Nouveau sachet : ${bag.title}`,
    url: "./app.html",
  });

  const staleIds: string[] = [];

  await Promise.all(
    (subs ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification
        );
      } catch (err) {
        // 404/410 = l'abonnement n'existe plus côté navigateur, on le nettoie.
        if (err.statusCode === 404 || err.statusCode === 410) staleIds.push(sub.id);
      }
    })
  );

  if (staleIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return new Response("ok", { status: 200 });
});
