import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { loadActiveBags } from "../lib/bags";
import BagCard from "./BagCard.jsx";
import ReserveModal from "./ReserveModal.jsx";

export default function PublicView({ user }) {
  const { t } = useI18n();
  const [bags, setBags] = useState(null); // null = loading
  const [reserving, setReserving] = useState(null);

  async function refresh() {
    setBags(await loadActiveBags());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <h1 className="page-title">{t("public.title")}</h1>
      <p className="page-sub">{t("public.sub")}</p>
      <div className="grid">
        {bags === null ? (
          <div className="empty">{t("public.loading")}</div>
        ) : !bags.length ? (
          <div className="empty">{t("public.empty")}</div>
        ) : (
          bags.map((bag) => <BagCard key={bag.id} bag={bag} onReserve={setReserving} />)
        )}
      </div>
      <ReserveModal bag={reserving} user={user} onClose={() => setReserving(null)} onReserved={refresh} />
    </div>
  );
}
