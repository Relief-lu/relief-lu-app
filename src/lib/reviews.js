import { supabase } from "./supabase";

const CRITERIA = ["collecte", "qualite", "variete", "quantite"];

// Agrège toutes les notes par commerçant — même pattern que items.js dans tatuca.
export async function getMerchantRatings() {
  const { data, error } = await supabase
    .from("reviews")
    .select("merchant_id, rating, rating_collecte, rating_qualite, rating_variete, rating_quantite");
  if (error) throw error;

  const totals = {};
  for (const r of data) {
    const agg = (totals[r.merchant_id] ??= { sum: 0, count: 0, criteria: {} });
    agg.sum += r.rating;
    agg.count += 1;
    for (const key of CRITERIA) {
      const value = r[`rating_${key}`];
      if (value == null) continue;
      const c = (agg.criteria[key] ??= { sum: 0, count: 0 });
      c.sum += value;
      c.count += 1;
    }
  }

  const ratings = {};
  for (const [id, agg] of Object.entries(totals)) {
    const criteria = {};
    for (const key of CRITERIA) {
      const c = agg.criteria[key];
      if (c) criteria[key] = c.sum / c.count;
    }
    ratings[id] = { avg: agg.sum / agg.count, count: agg.count, criteria };
  }
  return ratings;
}

// `criteriaScores` (optionnel) : { collecte, qualite, variete, quantite },
// chacune une note 1-5 laissée par le client — affichées séparément sur la
// page détail du sachet, en plus de la moyenne globale `rating`.
export async function addReview(reservationId, merchantId, rating, comment, criteriaScores) {
  const { error } = await supabase.from("reviews").insert({
    reservation_id: reservationId,
    merchant_id: merchantId,
    rating,
    comment: comment || null,
    rating_collecte: criteriaScores?.collecte ?? null,
    rating_qualite: criteriaScores?.qualite ?? null,
    rating_variete: criteriaScores?.variete ?? null,
    rating_quantite: criteriaScores?.quantite ?? null,
  });
  if (error) throw error;
}
