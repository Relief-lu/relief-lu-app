import { supabase } from "./supabase";

export async function loadActiveBags() {
  const { data, error } = await supabase
    .from("bags")
    .select("*, merchants(business_name, city, lat, lng)")
    .eq("status", "active")
    .gt("quantity_left", 0)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function loadMerchantBags(merchantId) {
  const { data, error } = await supabase
    .from("bags")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadBagPhoto(userId, file) {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("bag-photos").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("bag-photos").getPublicUrl(path).data.publicUrl;
}

export async function publishBag(payload) {
  const { data, error } = await supabase.from("bags").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function cancelBag(bagId) {
  const { error } = await supabase.from("bags").update({ status: "cancelled" }).eq("id", bagId);
  if (error) throw error;
}
