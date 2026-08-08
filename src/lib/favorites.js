import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export async function getMyFavoriteMerchantIds(userId) {
  const { data, error } = await supabase.from("favorites").select("merchant_id").eq("user_id", userId);
  if (error) throw error;
  return new Set(data.map((f) => f.merchant_id));
}

export async function addFavorite(userId, merchantId) {
  const { error } = await supabase.from("favorites").insert({ user_id: userId, merchant_id: merchantId });
  if (error) throw error;
}

export async function removeFavorite(userId, merchantId) {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("merchant_id", merchantId);
  if (error) throw error;
}

// Partagé entre PublicView et FavoritesView : suit les commerçants favoris de
// l'utilisateur connecté et expose un toggle optimiste.
export function useFavorites(user) {
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    getMyFavoriteMerchantIds(user.id).then(setFavoriteIds);
  }, [user]);

  const toggleFavorite = useCallback(
    async (merchantId) => {
      if (!user) return;
      const isFav = favoriteIds.has(merchantId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(merchantId) : next.add(merchantId);
        return next;
      });
      try {
        if (isFav) await removeFavorite(user.id, merchantId);
        else await addFavorite(user.id, merchantId);
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          isFav ? next.add(merchantId) : next.delete(merchantId);
          return next;
        });
      }
    },
    [user, favoriteIds]
  );

  return { favoriteIds, toggleFavorite };
}
