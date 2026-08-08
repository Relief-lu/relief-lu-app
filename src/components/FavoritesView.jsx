import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags } from "../lib/bags";
import { useFavorites } from "../lib/favorites";
import BagCard from "./BagCard.jsx";
import ReserveModal from "./ReserveModal.jsx";
import AuthPrompt from "./AuthPrompt.jsx";

export default function FavoritesView({ user }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null);
  const [reserving, setReserving] = useState(null);
  const { favoriteIds, toggleFavorite } = useFavorites(user);

  async function refresh() {
    setBags(await loadActiveBags());
  }

  useEffect(() => {
    refresh();
  }, []);

  const favBags = (bags || []).filter((b) => favoriteIds.has(b.merchant_id));

  return (
    <div>
      <h1 className="page-title">{t("nav.favorites")}</h1>
      {!user ? (
        <div className="panel">
          <AuthPrompt />
        </div>
      ) : bags === null ? (
        <p className="page-sub">{t("public.loading")}</p>
      ) : (
        <div className="grid">
          {!favBags.length ? (
            <div className="empty">{t("favorites.empty")}</div>
          ) : (
            favBags.map((bag) => (
              <BagCard
                key={bag.id}
                bag={bag}
                onReserve={setReserving}
                onToggleFavorite={toggleFavorite}
                isFavorite={favoriteIds.has(bag.merchant_id)}
              />
            ))
          )}
        </div>
      )}
      <ReserveModal bag={reserving} user={user} onClose={() => setReserving(null)} onReserved={refresh} />
    </div>
  );
}
