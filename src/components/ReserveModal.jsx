import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import { reserveBag } from "../lib/reservations";
import { formatPickupWindow } from "./BagCard.jsx";

export default function ReserveModal({ bag, onClose, onReserved }) {
  const { lang, t } = useI18n();
  const [email, setEmail] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [pickupCode, setPickupCode] = useState(null);

  if (!bag) return null;

  async function handleConfirm() {
    setError("");
    if (!email.trim()) return;
    try {
      const row = await reserveBag(bag.id, email.trim(), qty);
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
        {!pickupCode ? (
          <div>
            <h2>{bag.title}</h2>
            <p className="desc">
              {(bag.price_cents / 100).toFixed(2)} € · {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}
            </p>
            <div className="field">
              <label>{t("reserve.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.lu" />
            </div>
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
