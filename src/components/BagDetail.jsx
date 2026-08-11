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

// Icône de partage standard (carré + flèche vers le haut), le symbole
// reconnaissable partout aujourd'hui — plus clair qu'une simple flèche "↗".
function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

// Page détail d'un sachet, façon TGTG (grande photo, infos du commerçant,
// description, carte + itinéraire) — remplace le clic direct sur "Réserver"
// qui n'ouvrait jusqu'ici que la petite modale, sans vue d'ensemble du sachet.
// "Emballages" et "Ingrédients & Allergènes" reprennent le texte générique
// fixe de la référence — le contenu d'un panier surprise varie chaque jour,
// donc TGTG ne demande pas au commerçant de le détailler à chaque sachet.
export default function BagDetail({ bag, rating, isFavorite, onToggleFavorite, onBack, onReserve }) {
  const { lang, t } = useI18n();
  const merchant = bag.merchants;
  const hasDiscount = bag.original_price_cents && bag.original_price_cents > bag.price_cents;
  const hasCoords = merchant?.lat != null && merchant?.lng != null;
  const [scrolled, setScrolled] = useState(false);
  const [allergensOpen, setAllergensOpen] = useState(false);

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
              <ShareIcon />
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

        {rating?.criteria && Object.keys(rating.criteria).length > 0 && (
          <>
            <div className="divider" />
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <h2>{t("bagDetail.overallExperience")}</h2>
                <p className="page-sub" style={{ marginTop: -4 }}>
                  {t("bagDetail.basedOnReviewsPrefix")} {rating.count} {t("bagDetail.basedOnReviewsSuffix")}
                </p>
              </div>
              <div className="overall-rating-box">
                <span className="stars">★</span> {rating.avg.toFixed(1)}
              </div>
            </div>
            {["collecte", "qualite", "variete", "quantite"].map(
              (key) =>
                rating.criteria[key] != null && (
                  <div className="rating-bar-row" key={key}>
                    <span>
                      {t(`review.criteria.${key}`)} <b>{rating.criteria[key].toFixed(1)}</b>
                    </span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${(rating.criteria[key] / 5) * 100}%` }} />
                    </div>
                  </div>
                )
            )}
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

        <div className="divider" />
        <h2>{t("bagDetail.packaging.title")}</h2>
        <div className="packaging-cards">
          <div className="packaging-card">
            <span className="packaging-icon">📦</span>
            <b>{t("bagDetail.packaging.container")}</b>
            <span className="page-sub" style={{ margin: 0 }}>{t("bagDetail.packaging.notProvided")}</span>
          </div>
          <div className="packaging-card">
            <span className="packaging-icon">🛍️</span>
            <b>{t("bagDetail.packaging.bag")}</b>
            <span className="page-sub" style={{ margin: 0 }}>{t("bagDetail.packaging.notProvided")}</span>
          </div>
        </div>
        <div className="info-banner">ℹ️ {t("bagDetail.packaging.info")}</div>

        <div className="divider" />
        <button className="accordion-toggle" onClick={() => setAllergensOpen((v) => !v)}>
          <h2 style={{ margin: 0 }}>{t("bagDetail.allergens.title")}</h2>
          <span className={`chevron-down ${allergensOpen ? "open" : ""}`}>⌄</span>
        </button>
        {allergensOpen && <p className="page-sub" style={{ marginTop: 10 }}>{t("bagDetail.allergens.text")}</p>}
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
