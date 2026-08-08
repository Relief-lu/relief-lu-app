import { supabase } from "./supabase";

// Le nom réel de la fonction déployée dans le dashboard Supabase (peut différer
// du nom du dossier source supabase/functions/notify-new-bag si renommée au déploiement).
const NOTIFY_FUNCTION_NAME = "smart-service";

// Appelée juste après la publication d'un sachet : prévient par push les
// utilisateurs ayant mis ce commerçant en favori. Best-effort — ne doit
// jamais faire échouer la publication elle-même si la notification échoue.
export async function notifyNewBag(bag) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${NOTIFY_FUNCTION_NAME}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ type: "INSERT", record: bag }),
    });
  } catch {
    // silencieux : la publication du sachet a déjà réussi, une notif ratée n'est pas bloquante.
  }
}
