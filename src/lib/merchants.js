import { supabase } from "./supabase";

// Ne crée plus de fiche commerçant juste en visitant "Espace commerçant" —
// n'importe quel compte client qui jetait un œil sur cette section devenait
// silencieusement commerçant, ce qui mélangeait les deux rôles. La fiche
// n'existe désormais qu'une fois le formulaire d'inscription soumis
// (voir updateMerchantProfile, qui fait l'upsert).
export async function getMerchantOrNull(userId) {
  const { data, error } = await supabase.from("merchants").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateMerchantLocation(userId, lat, lng) {
  const { error } = await supabase.from("merchants").update({ lat, lng }).eq("id", userId);
  if (error) throw error;
}

// Une inscription est considérée complète une fois l'adresse renseignée —
// avant ça, le formulaire d'inscription s'affiche à la place du dashboard.
export function isRegistrationComplete(merchant) {
  return Boolean(merchant?.address);
}

// Crée la fiche commerçant au premier enregistrement, la met à jour ensuite —
// c'est le seul endroit qui crée une ligne dans "merchants".
export async function updateMerchantProfile(userId, profile) {
  const { error } = await supabase.from("merchants").upsert({
    id: userId,
    business_name: profile.business_name,
    address: profile.address,
    city: profile.city,
    phone: profile.phone,
    registration_number: profile.registration_number,
  });
  if (error) throw error;
}

// Réutilise le bucket "bag-photos" (déjà public, déjà autorisé en écriture
// pour les commerçants connectés) plutôt que d'en créer un dédié.
export async function uploadMerchantLogo(userId, file) {
  const path = `${userId}/logo-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("bag-photos").upload(path, file);
  if (error) throw error;
  const logo_url = supabase.storage.from("bag-photos").getPublicUrl(path).data.publicUrl;
  const { error: updateError } = await supabase.from("merchants").update({ logo_url }).eq("id", userId);
  if (updateError) throw updateError;
  return logo_url;
}
