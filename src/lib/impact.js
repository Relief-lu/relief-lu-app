import { supabase } from "./supabase";

// Estimation grossière et assumée comme telle (pas de mesure réelle) —
// ~2.5 kg CO2e évités par repas sauvé du gaspillage, ordre de grandeur
// couramment cité pour ce type de compteur d'impact.
const CO2_KG_PER_BAG = 2.5;

export async function getImpactStats() {
  // Fonction dédiée (voir db/schema-v3-impact.sql) : les réservations sont
  // protégées par RLS, un count() direct depuis le client ne renverrait que
  // le total de l'utilisateur courant, pas le total du site.
  const { data, error } = await supabase.rpc("get_impact_stats");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  const bagsSaved = Number(row?.bags_saved || 0);
  return { bagsSaved, co2SavedKg: Math.round(bagsSaved * CO2_KG_PER_BAG) };
}
