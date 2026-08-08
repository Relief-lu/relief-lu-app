import { supabase } from "./supabase";

export async function reserveBag(bagId, quantity) {
  const { data, error } = await supabase.rpc("reserve_bag", {
    p_bag_id: bagId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getMyReservations(userId) {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, bags(title, price_cents, pickup_start, pickup_end, image_url, merchant_id, merchants(business_name, city))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
