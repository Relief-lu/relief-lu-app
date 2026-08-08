import { supabase } from "./supabase";

export async function reserveBag(bagId, email, quantity) {
  const { data, error } = await supabase.rpc("reserve_bag", {
    p_bag_id: bagId,
    p_email: email,
    p_quantity: quantity,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}
