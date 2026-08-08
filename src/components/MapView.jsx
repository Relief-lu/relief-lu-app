import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useI18n } from "../lib/i18n.jsx";

const LUXEMBOURG_CENTER = [49.75, 6.15];

export default function MapView({ bags, userPos }) {
  const { t } = useI18n();

  const merchants = {};
  for (const bag of bags) {
    const m = bag.merchants;
    if (!m || m.lat == null || m.lng == null) continue;
    const id = bag.merchant_id;
    if (!merchants[id]) merchants[id] = { ...m, merchantId: id, bags: [] };
    merchants[id].bags.push(bag);
  }
  const merchantList = Object.values(merchants);

  const center = userPos ? [userPos.lat, userPos.lng] : merchantList[0] ? [merchantList[0].lat, merchantList[0].lng] : LUXEMBOURG_CENTER;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPos && <Marker position={[userPos.lat, userPos.lng]} />}
        {merchantList.map((m) => (
          <Marker key={m.merchantId} position={[m.lat, m.lng]}>
            <Popup>
              <b>{m.business_name}</b>
              <br />
              {m.bags.length} {t("left")}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
