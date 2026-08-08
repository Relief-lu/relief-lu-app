import { supabase } from "./supabase";

export async function getMerchantStats(merchantId) {
  const { data: bags, error: bagsError } = await supabase
    .from("bags")
    .select("id, price_cents, status")
    .eq("merchant_id", merchantId);
  if (bagsError) throw bagsError;

  const bagIds = bags.map((b) => b.id);
  const priceByBag = Object.fromEntries(bags.map((b) => [b.id, b.price_cents]));

  let reservations = [];
  if (bagIds.length) {
    const { data, error } = await supabase.from("reservations").select("status, quantity, bag_id").in("bag_id", bagIds);
    if (error) throw error;
    reservations = data;
  }

  const totalReservations = reservations.length;
  const noShowCount = reservations.filter((r) => r.status === "no_show").length;
  const estimatedRevenueCents = reservations
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + (priceByBag[r.bag_id] || 0) * r.quantity, 0);

  return {
    bagsPublished: bags.length,
    totalReservations,
    noShowRate: totalReservations ? Math.round((noShowCount / totalReservations) * 100) : 0,
    estimatedRevenue: estimatedRevenueCents / 100,
  };
}
