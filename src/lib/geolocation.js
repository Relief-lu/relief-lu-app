const STORAGE_KEY = "relief-user-position";

// Villes du Luxembourg — repli si la géolocalisation est refusée ou indisponible.
export const REFERENCE_POINTS = [
  { key: "luxembourg", label: "Luxembourg-Ville", lat: 49.6117, lng: 6.1319 },
  { key: "esch", label: "Esch-sur-Alzette", lat: 49.4958, lng: 5.9806 },
  { key: "dudelange", label: "Dudelange", lat: 49.4794, lng: 6.0864 },
  { key: "differdange", label: "Differdange", lat: 49.5244, lng: 5.8917 },
  { key: "ettelbruck", label: "Ettelbruck", lat: 49.8486, lng: 6.105 },
  { key: "wiltz", label: "Wiltz", lat: 49.9667, lng: 5.9333 },
  { key: "grevenmacher", label: "Grevenmacher", lat: 49.6797, lng: 6.4408 },
  { key: "remich", label: "Remich", lat: 49.5453, lng: 6.3667 },
  { key: "echternach", label: "Echternach", lat: 49.8117, lng: 6.4181 },
];

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function loadSavedPosition() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function savePosition(pos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
}

export function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        savePosition(p);
        resolve(p);
      },
      () => reject(new Error("denied")),
      { timeout: 8000 }
    );
  });
}
