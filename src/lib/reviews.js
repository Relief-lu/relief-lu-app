import { supabase } from "./supabase";

// Agrège toutes les notes par commerçant — même pattern que items.js dans tatuca.
export async function getMerchantRatings() {
  const { data, error } = await supabase.from("reviews").select("merchant_id, rating");
  if (error) throw error;

  const totals = {};
  for (const r of data) {
    const agg = (totals[r.merchant_id] ??= { sum: 0, count: 0 });
    agg.sum += r.rating;
    agg.count += 1;
  }

  const ratings = {};
  for (const [id, agg] of Object.entries(totals)) {
    ratings[id] = { avg: agg.sum / agg.count, count: agg.count };
  }
  return ratings;
}

export async function addReview(reservationId, merchantId, rating, comment) {
  const { error } = await supabase.from("reviews").insert({
    reservation_id: reservationId,
    merchant_id: merchantId,
    rating,
    comment: comment || null,
  });
  if (error) throw error;
}
