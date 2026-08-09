import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n.jsx";

export function formatPickupWindow(startISO, endISO, lang) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts = { hour: "2-digit", minute: "2-digit" };
  return s.toLocaleTimeString(lang, opts) + " – " + e.toLocaleTimeString(lang, opts);
}

function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${m}min`;
}

function useCountdown(startISO, endISO, t) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  if (now >= end) return t("countdown.closed");
  if (now < start) return `${t("countdown.notOpenYet")} ${new Date(startISO).toLocaleTimeString()}`;
  return `${t("countdown.closesIn")} ${formatDuration(end - now)}`;
}

export default function BagCard({ bag, onReserve, onToggleFavorite, isFavorite, distanceKm, rating }) {
  const { lang, t } = useI18n();
  const countdown = useCountdown(bag.pickup_start, bag.pickup_end, t);

  return (
    <div className="card">
      <div className="thumb" style={bag.image_url ? { backgroundImage: `url('${bag.image_url}')` } : undefined}>
        {!bag.image_url && "🥡"}
        {bag.merchants?.logo_url && (
          <div className="merchant-logo">
            <img src={bag.merchants.logo_url} alt="" />
          </div>
        )}
        {onToggleFavorite && (
          <button
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(bag.merchant_id);
            }}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        )}
      </div>
      <div className="body">
        <div className="merchant">
          {bag.merchants?.business_name || ""}
          {rating && (
            <span className="stars" style={{ marginLeft: 6 }}>
              {"★".repeat(Math.round(rating.avg))} ({rating.count})
            </span>
          )}
        </div>
        <h3>{bag.title}</h3>
        <div className="meta">
          {t("pickupWindow")} {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)} · {bag.quantity_left} {t("left")}
          {distanceKm != null && <> · {distanceKm.toFixed(1)} km</>}
        </div>
        <div className="countdown">{countdown}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
          <button className="btn small" onClick={() => onReserve(bag)}>
            {t("reserve")}
          </button>
        </div>
      </div>
    </div>
  );
}
