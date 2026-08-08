import { supabase } from "./supabase";

// À appeler une fois après connexion : crée la ligne merchant si elle n'existe pas encore.
export async function ensureMerchantRow(user) {
  const { data } = await supabase.from("merchants").select("id").eq("id", user.id).maybeSingle();
  if (!data) {
    await supabase.from("merchants").insert({ id: user.id, business_name: user.email.split("@")[0] });
  }
}
