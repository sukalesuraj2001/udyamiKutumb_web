import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

/**
 * Google Maps Platform bootstrap (Maps JavaScript API).
 *
 * Add your key in `.env`:
 *   VITE_GOOGLE_MAPS_API_KEY=<your key>
 *   VITE_GOOGLE_MAPS_MAP_ID=<optional cloud Map ID, DEMO_MAP_ID works for dev>
 *
 * APIs to enable on the key (Google Cloud Console -> APIs & Services):
 *   - Maps JavaScript API   (required: member map + intro fly-through)
 *   - Places API (New)      (optional, for place search / autocomplete)
 *   - Geocoding API         (optional, address <-> coordinates)
 */
export const GOOGLE_MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();
export const GOOGLE_MAPS_MAP_ID = (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "").trim() || "DEMO_MAP_ID";

// The sample/placeholder value shipped in .env does not count as a real key.
export const hasGoogleMapsKey =
  GOOGLE_MAPS_API_KEY.length > 0 && !GOOGLE_MAPS_API_KEY.startsWith("YOUR_");

// Google calls window.gm_authFailure when the key is invalid / API not enabled /
// referrer not allowed. Let components subscribe so they can show a message.
const authListeners = new Set();
if (typeof window !== "undefined") {
  window.gm_authFailure = () => authListeners.forEach((fn) => fn());
}
export function onGoogleMapsAuthFailure(fn) {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

let configured = false;
function configure() {
  if (configured) return;
  setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly", language: "en", region: "IN" });
  configured = true;
}

/** Loads the "maps" + "marker" + "core" libraries once; resolves with the global google.maps. */
export async function loadGoogleMaps() {
  configure();
  await Promise.all([importLibrary("maps"), importLibrary("marker"), importLibrary("core")]);
  return window.google.maps;
}

// ── GeoJSON helpers (shared by the member-map components) ──
export function walkCoords(coords, cb) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number") {
    cb(coords);
    return;
  }
  coords.forEach((c) => walkCoords(c, cb));
}

export function extendBoundsWithGeo(bounds, geo) {
  (geo?.features || []).forEach((f) =>
    walkCoords(f.geometry?.coordinates, ([lng, lat]) => bounds.extend({ lat, lng }))
  );
}

export function featureCenter(feature) {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180, any = false;
  walkCoords(feature?.geometry?.coordinates, ([lng, lat]) => {
    any = true;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });
  return any ? { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 } : null;
}
