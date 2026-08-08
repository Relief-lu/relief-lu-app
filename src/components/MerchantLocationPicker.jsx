import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";
import { updateMerchantLocation } from "../lib/merchants";
import { locate } from "../lib/geolocation";

const LUXEMBOURG_CENTER = { lat: 49.75, lng: 6.15 };

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MerchantLocationPicker({ user, merchant }) {
  const { t } = useI18n();
  const [pos, setPos] = useState(
    merchant?.lat != null ? { lat: merchant.lat, lng: merchant.lng } : LUXEMBOURG_CENTER
  );
  const [msg, setMsg] = useState(null);

  async function save(newPos) {
    setPos(newPos);
    try {
      await updateMerchantLocation(user.id, newPos.lat, newPos.lng);
      setMsg({ type: "success", text: t("merchant.locationSaved") });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  async function useMyLocation() {
    try {
      const p = await locate();
      save(p);
    } catch {
      setMsg({ type: "error", text: t("merchant.locationDenied") });
    }
  }

  return (
    <div className="panel">
      <h2>{t("merchant.locationTitle")}</h2>
      <p className="page-sub">{t("merchant.locationDesc")}</p>
      <div className="map-container" style={{ height: 220 }}>
        <MapContainer center={pos} zoom={13} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={pos}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                save({ lat: p.lat, lng: p.lng });
              },
            }}
          />
          <ClickHandler onPick={(lat, lng) => save({ lat, lng })} />
        </MapContainer>
      </div>
      <button className="btn secondary small" onClick={useMyLocation}>
        {t("filters.useLocation")}
      </button>
      {msg && <p className={msg.type === "error" ? "error-msg" : "success-msg"}>{msg.text}</p>}
    </div>
  );
}
