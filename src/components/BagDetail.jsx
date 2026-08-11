import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";
import { formatPickupWindow } from "./BagCard.jsx";
import { merchantMarkerIcon } from "../lib/leafletIcon";

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// Page détail d'un sachet, façon TGTG (grande photo, infos du commerçant,
// description, carte + itinéraire) — remplace le clic direct sur "Réserver"
// qui n'ouvrait jusqu'ici que la petite modale, sans vue d'ensemble du sachet.
// Les sections "Emballages" / "Ingrédients & Allergènes" de la référence ne
// sont pas reprises ici : relief.lu ne collecte pas encore cette donnée côté
// commerçant, mieux vaut l'omettre que d'inventer un contenu factice.
export default function BagDetail({ bag, rating, isFavorite, onToggleFavorite, onBack, onReserve }) {
  const { lang, t } = useI18n();
  const merchant = bag.merchants;
  const hasDiscount = bag.original_price_cents && bag.original_price_cents > bag.price_cents;
  const hasCoords = merchant?.lat != null && merchant?.lng != null;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".bag-detail");
    function onScroll() {
      setScrolled(el.scrollTop > 180);
    }
    el?.addEventListener("scroll", onScroll);
    return () => el?.removeEventListener("scroll", onScroll);
  }, []);

  const address = [merchant?.address, merchant?.city].filter(Boolean).join(", ");
  const directionsUrl = hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lng}` : null;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: bag.title, text: `${bag.title} — ${merchant?.business_name || ""}`, url: window.location.href }).catch(() => {});
    }
  }

  return (
    <div className="bag-detail">
      {/* En-tête compacte qui remplace la grande photo une fois qu'on a
          scrollé — même bascule que sur la référence, pour garder le nom du
          commerçant et les actions (retour/partage/favori) visibles. */}
      <div className={`bag-detail-compact-header ${scrolled ? "visible" : ""}`}>
        <button className="icon-circle" onClick={onBack} aria-label="back">
          ←
        </button>
        <b>{merchant?.business_name}</b>
        <div style={{ display: "flex", gap: 10 }}>
          {navigator.share && (
            <button className="icon-circle" onClick={handleShare} aria-label="share">
              ↗
            </button>
          )}
          {onToggleFavorite && (
            <button className={`icon-circle ${isFavorite ? "active" : ""}`} onClick={() => onToggleFavorite(bag.merchant_id)} aria-label="favorite">
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
      <div className="bag-detail-hero" style={bag.image_url ? { backgroundImage: `url('${bag.image_url}')` } : undefined}>
        {!bag.image_url && <span className="bag-detail-hero-fallback">🥡</span>}
        <div className="bag-detail-hero-top">
          <button className="icon-circle" onClick={onBack} aria-label="back">
            ←
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {navigator.share && (
              <button className="icon-circle" onClick={handleShare} aria-label="share">
                ↗
              </button>
            )}
            {onToggleFavorite && (
              <button className={`icon-circle ${isFavorite ? "active" : ""}`} onClick={() => onToggleFavorite(bag.merchant_id)} aria-label="favorite">
                {isFavorite ? "♥" : "♡"}
              </button>
            )}
          </div>
        </div>
        <div className="bag-detail-hero-bottom">
          <div className="bag-detail-hero-badges">
            <span className="badge-availability" style={{ position: "static" }}>
              {bag.quantity_left} {t("badge.available")}
            </span>
            <span className="chip-pill">{t(`merchant.category.${bag.category}`)}</span>
          </div>
          {merchant && (
            <div className="bag-detail-merchant">
              {merchant.logo_url && (
                <div className="merchant-logo" style={{ position: "static", width: 40, height: 40 }}>
                  <img src={merchant.logo_url} alt="" />
                </div>
              )}
              <b>{merchant.business_name}</b>
            </div>
          )}
        </div>
      </div>

      <div className="bag-detail-body">
        <h1>{bag.title}</h1>
        {rating && (
          <div className="bag-detail-rating">
            <span className="stars">★</span> {rating.avg.toFixed(1)} <span className="page-sub" style={{ margin: 0 }}>({rating.count})</span>
          </div>
        )}
        <div className="bag-detail-row">
          <span>🕒 {t("pickupWindow")} {formatPickupWindow(bag.pickup_start, bag.pickup_end, lang)}</span>
          {isToday(bag.pickup_start) && <span className="chip-pill-outline">{t("bagDetail.today")}</span>}
        </div>
        <div className="bag-detail-availability-banner">
          {bag.quantity_left} {t("badge.available")}
        </div>

        {address && (
          <>
            <div className="divider" />
            <a className="bag-detail-address" href={directionsUrl || "#"} target={directionsUrl ? "_blank" : undefined} rel="noreferrer">
              <span>📍 {address}</span>
              <span className="chevron">›</span>
            </a>
          </>
        )}

        {bag.description && (
          <>
            <div className="divider" />
            <h2>{t("bagDetail.about")}</h2>
            <p className="page-sub" style={{ marginBottom: 0 }}>{bag.description}</p>
          </>
        )}

        {hasCoords && (
          <>
            <div className="divider" />
            <div className="map-container" style={{ height: 160 }}>
              <MapContainer center={[merchant.lat, merchant.lng]} zoom={14} scrollWheelZoom={false} dragging={false} style={{ width: "100%", height: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[merchant.lat, merchant.lng]} icon={merchantMarkerIcon(merchant.logo_url)} />
              </MapContainer>
            </div>
            <a className="btn secondary" style={{ display: "block", textAlign: "center", marginTop: 12 }} href={directionsUrl} target="_blank" rel="noreferrer">
              {t("bagDetail.directions")}
            </a>
          </>
        )}
      </div>

      <div className="bag-detail-sticky">
        <span>
          {hasDiscount && <span className="price-original">{(bag.original_price_cents / 100).toFixed(2)} €</span>}
          <span className="price">{(bag.price_cents / 100).toFixed(2)} €</span>
        </span>
        <button className="btn" onClick={() => onReserve(bag)}>
          {t("reserve")}
        </button>
      </div>
    </div>
  );
}
