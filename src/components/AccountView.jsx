import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { getMyReservations } from "../lib/reservations";
import { formatPickupWindow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";

export default function AccountView({ user }) {
  const { lang, t } = useI18n();
  const [reservations, setReservations] = useState(null);

  useEffect(() => {
    if (user) getMyReservations(user.id).then(setReservations);
  }, [user]);

  return (
    <div>
      <h1 className="page-title">{t("account.title")}</h1>
      {!user ? (
        <div className="panel">
          <AuthPrompt />
        </div>
      ) : reservations === null ? (
        <p className="page-sub">{t("public.loading")}</p>
      ) : !reservations.length ? (
        <p className="page-sub">{t("account.empty")}</p>
      ) : (
        <div className="panel">
          {reservations.map((r) => (
            <div className="my-bag" key={r.id}>
              <div className="info">
                <b>{r.bags?.title}</b>
                <span>
                  {r.bags?.merchants?.business_name} · {formatPickupWindow(r.bags?.pickup_start, r.bags?.pickup_end, lang)} ·{" "}
                  {t(`status.${r.status}`)}
                </span>
              </div>
              <div className="price">{((r.bags?.price_cents || 0) / 100).toFixed(2)} €</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
