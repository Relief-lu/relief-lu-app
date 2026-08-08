import { supabase } from "./supabase";

// À appeler une fois après connexion : crée la ligne merchant si elle n'existe pas encore.
export async function ensureMerchantRow(user) {
  const { data } = await supabase.from("merchants").select("id").eq("id", user.id).maybeSingle();
  if (!data) {
    await supabase.from("merchants").insert({ id: user.id, business_name: user.email.split("@")[0] });
  }
}

export async function getMerchant(userId) {
  const { data, error } = await supabase.from("merchants").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateMerchantLocation(userId, lat, lng) {
  const { error } = await supabase.from("merchants").update({ lat, lng }).eq("id", userId);
  if (error) throw error;
}
