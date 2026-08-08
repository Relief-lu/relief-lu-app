import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags } from "../lib/bags";
import { haversineKm, loadSavedPosition, locate } from "../lib/geolocation";
import BagCard from "./BagCard.jsx";
import ReserveModal from "./ReserveModal.jsx";
import FiltersBar from "./FiltersBar.jsx";
import MapView from "./MapView.jsx";

export default function PublicView({ user }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null); // null = loading
  const [reserving, setReserving] = useState(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [userPos, setUserPos] = useState(() => loadSavedPosition());
  const [geoStatus, setGeoStatus] = useState("idle");

  async function refresh() {
    setBags(await loadActiveBags());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleLocate() {
    setGeoStatus("loading");
    try {
      setUserPos(await locate());
      setGeoStatus("ok");
    } catch {
      setGeoStatus("denied");
    }
  }

  const filtered = useMemo(() => {
    if (!bags) return [];
    let list = bags.map((b) => ({
      ...b,
      distanceKm: userPos && b.merchants?.lat != null ? haversineKm(userPos.lat, userPos.lng, b.merchants.lat, b.merchants.lng) : null,
    }));

    if (category) list = list.filter((b) => b.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.merchants?.business_name?.toLowerCase().includes(q));
    }

    if (sort === "price") list = [...list].sort((a, b) => a.price_cents - b.price_cents);
    else if (sort === "distance")
      list = [...list].sort((a, b) => {
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    else list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [bags, category, search, sort, userPos]);

  return (
    <div>
      <h1 className="page-title">{t("public.title")}</h1>
      <p className="page-sub">{t("public.sub")}</p>

      {bags !== null && bags.length > 0 && (
        <FiltersBar
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          onLocate={handleLocate}
          geoStatus={geoStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {viewMode === "map" && bags && bags.length > 0 && <MapView bags={filtered} userPos={userPos} />}

      <div className="grid">
        {bags === null ? (
          <div className="empty">{t("public.loading")}</div>
        ) : !filtered.length ? (
          <div className="empty">{t("public.empty")}</div>
        ) : (
          filtered.map((bag) => <BagCard key={bag.id} bag={bag} onReserve={setReserving} distanceKm={bag.distanceKm} />)
        )}
      </div>
      <ReserveModal bag={reserving} user={user} onClose={() => setReserving(null)} onReserved={refresh} />
    </div>
  );
}
