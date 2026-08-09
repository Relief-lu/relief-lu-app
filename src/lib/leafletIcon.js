import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Vite ne résout pas les chemins d'images par défaut de Leaflet — on les
// réimporte explicitement, sinon les marqueurs s'affichent cassés.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Marqueur rond avec le logo du commerçant, façon TGTG — un simple divIcon
// (pas de fond réseau à charger côté Leaflet) avec l'image en background,
// et un repli sur un pictogramme si le commerçant n'a pas encore de logo.
export function merchantMarkerIcon(logoUrl) {
  const inner = logoUrl
    ? `<div class="merchant-marker-photo" style="background-image:url('${logoUrl}')"></div>`
    : `<div class="merchant-marker-photo merchant-marker-fallback">🥡</div>`;
  return L.divIcon({
    className: "merchant-marker",
    html: inner,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });
}
