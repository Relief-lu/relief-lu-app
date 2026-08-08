import { useI18n } from "../lib/i18n.jsx";

export function formatPickupWindow(startISO, endISO, lang) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const opts = { hour: "2-digit", minute: "2-digit" };
  return s.toLocaleTimeString(lang, opts) + " – " + e.toLocaleTimeString(lang, opts);
}

export default function BagCard({ bag, onReserve }) {
  const { lang, t } = useI18n();
  return (
    <div className="card">
      <div className="thumb" style={bag.image_url ? { backgroundImage: `url('${bag.image_url}')` } : undefined}>
        {!bag.image_url && "🥡"}
      </div>
      <div className="body">
        <div className="merchant">{bag.merchants?.business_name || ""}</div>
        <h3>{bag.title}</h3>
        <div className="meta">
          {t("pickupWindow")} {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)} · {bag.quantity_left} {t("left")}
        </div>
        <div className="row">
          <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
          <button className="btn small" onClick={() => onReserve(bag)}>
            {t("reserve")}
          </button>
        </div>
      </div>
    </div>
  );
}
