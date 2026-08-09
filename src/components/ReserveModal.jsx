import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { reserveBag } from "../lib/reservations";
import { formatPickupWindow } from "./BagCard.jsx";
import AuthPrompt from "./AuthPrompt.jsx";

export default function ReserveModal({ bag, user, onClose, onReserved }) {
  const { lang, t } = useI18n();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [pickupCode, setPickupCode] = useState(null);

  if (!bag) return null;

  async function handleConfirm() {
    setError("");
    try {
      const row = await reserveBag(bag.id, qty);
      setPickupCode(row.pickup_code);
      onReserved();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    }
  }

  return (
    <div className="overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>
          ✕
        </button>
        {!user ? (
          <AuthPrompt title={t("reserve.loginRequired")} description={t("reserve.loginDesc")} view={`reserve:${bag.id}`} />
        ) : !pickupCode ? (
          <div>
            <h2>{bag.title}</h2>
            <p className="desc">
              {(bag.price_cents / 100).toFixed(2)} € · {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}
            </p>
            <div className="field">
              <label>{t("reserve.qty")}</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)} />
            </div>
            <button className="btn" onClick={handleConfirm}>
              {t("reserve.confirm")}
            </button>
            {error && <p className="error-msg">{error}</p>}
          </div>
        ) : (
          <div>
            <h2>{t("reserve.doneTitle")}</h2>
            <p className="desc">{t("reserve.doneDesc")}</p>
            <div className="code-box">
              <div className="code">{pickupCode}</div>
              <div className="code-label">{t("reserve.codeLabel")}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
