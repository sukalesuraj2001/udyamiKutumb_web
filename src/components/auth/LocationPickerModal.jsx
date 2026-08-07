import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Leaflet CSS injector ────────────────────────────────────────────────────
function injectLeafletCSS() {
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    injectLeafletCSS();
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ─── Nominatim — returns full address object ──────────────────────────────────
async function reverseGeocodeDetailed(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const a = data.address || {};
    return {
      displayName: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      pincode:     a.postcode    || "",
      city:        a.city || a.town || a.village || a.suburb || "",
      district:    a.county || a.state_district || a.district || "",
      state:       a.state       || "",
    };
  } catch {
    return {
      displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      pincode: "", city: "", district: "", state: "",
    };
  }
}

async function searchLocations(query) {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function PinIcon({ color = "#1a56db", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function CrosshairIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <>
      <style>{`@keyframes lpm-spin{to{transform:rotate(360deg)}}.lpm-spin{animation:lpm-spin 0.8s linear infinite;display:inline-block}`}</style>
      <svg className="lpm-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </>
  );
}

// ─── LocationPickerModal ──────────────────────────────────────────────────────
/**
 * onSelect receives: { address, lat, lng, pincode, city, district, state }
 */
export default function LocationPickerModal({
  isOpen, onClose, onSelect,
  title = "Select Location",
  initialLat, initialLng,
  wardGeoJson,
}) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markerRef       = useRef(null);
  const boundaryLayerRef = useRef(null);

  const [leafletReady, setLeafletReady]     = useState(false);
  const [loadError, setLoadError]           = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoords, setSelectedCoords]   = useState(null);
  const [selectedMeta, setSelectedMeta]       = useState({ pincode: "", city: "", district: "", state: "" });
  const [locating, setLocating]   = useState(false);
  const [reversing, setReversing] = useState(false);

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    loadLeaflet().then(() => setLeafletReady(true)).catch(() => setLoadError(true));
  }, [isOpen]);

  // ── Place marker + reverse geocode ──
  const placeMarker = useCallback(async (lat, lng, prefilledMeta = null) => {
    if (!mapRef.current) return;
    const L = window.L;

    const icon = L.divIcon({
      className: "",
      html: `<div style="width:32px;height:40px;display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#1a56db"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapRef.current);
      markerRef.current.on("dragend", async (e) => {
        const { lat: dLat, lng: dLng } = e.target.getLatLng();
        setReversing(true);
        const geo = await reverseGeocodeDetailed(dLat, dLng);
        setSelectedAddress(geo.displayName);
        setSelectedCoords({ lat: dLat, lng: dLng });
        setSelectedMeta({ pincode: geo.pincode, city: geo.city, district: geo.district, state: geo.state });
        setReversing(false);
      });
    }
    mapRef.current.setView([lat, lng], 16, { animate: true });

    if (prefilledMeta) {
      // Already have the address info from search result
      setSelectedAddress(prefilledMeta.displayName);
      setSelectedCoords({ lat, lng });
      setSelectedMeta({ pincode: prefilledMeta.pincode, city: prefilledMeta.city, district: prefilledMeta.district, state: prefilledMeta.state });
    } else {
      setReversing(true);
      const geo = await reverseGeocodeDetailed(lat, lng);
      setSelectedAddress(geo.displayName);
      setSelectedCoords({ lat, lng });
      setSelectedMeta({ pincode: geo.pincode, city: geo.city, district: geo.district, state: geo.state });
      setReversing(false);
    }
  }, []);

  // ── Init map ──
  useEffect(() => {
    if (!leafletReady || !isOpen || mapInitialized) return;
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      const L = window.L;
      const center = initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629];
      const zoom   = initialLat ? 15 : 5;

      mapContainerRef.current.style.height = "340px";
      mapContainerRef.current.style.width  = "100%";

      const map = L.map(mapContainerRef.current, { center, zoom, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        await placeMarker(lat, lng);
      });

      mapRef.current = map;
      setMapInitialized(true);
      setTimeout(() => map.invalidateSize(), 100);

      if (initialLat && initialLng) placeMarker(initialLat, initialLng);
    }, 50);
    return () => clearTimeout(timer);
  }, [leafletReady, isOpen]); // eslint-disable-line

  // ── Render Ward GeoJSON Boundary & Auto-fit map ──
  useEffect(() => {
    if (!mapInitialized || !mapRef.current || !wardGeoJson) return;
    const L = window.L;
    if (!L) return;

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
      boundaryLayerRef.current = null;
    }

    const geoData = wardGeoJson.geoJson || wardGeoJson.geometry || wardGeoJson;

    try {
      const geoLayer = L.geoJSON(geoData, {
        style: {
          color: "#1a56db",
          weight: 3,
          opacity: 0.9,
          fillColor: "#2563eb",
          fillOpacity: 0.18,
          dashArray: "4, 4"
        }
      }).addTo(mapRef.current);

      boundaryLayerRef.current = geoLayer;

      const bounds = geoLayer.getBounds();
      if (bounds && bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });

        // Auto-place marker at the center of the ward boundary if no initial lat/lng provided
        if (!initialLat && !initialLng && !markerRef.current) {
          const center = bounds.getCenter();
          placeMarker(center.lat, center.lng);
        }
      }
    } catch (err) {
      console.error("Error displaying ward GeoJSON boundary:", err);
    }
  }, [mapInitialized, wardGeoJson, initialLat, initialLng, placeMarker]);

  // ── Cleanup on close ──
  useEffect(() => {
    if (!isOpen) {
      boundaryLayerRef.current?.remove();
      boundaryLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current    = null;
      markerRef.current = null;
      setMapInitialized(false);
      setLeafletReady(false);
    }
  }, [isOpen]);

  // ── Search debounce ──
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const handleSearchSelect = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const a   = result.address || {};
    const meta = {
      displayName: result.display_name,
      pincode:  a.postcode    || "",
      city:     a.city || a.town || a.village || a.suburb || "",
      district: a.county || a.state_district || a.district || "",
      state:    a.state || "",
    };
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(", "));
    setShowDropdown(false);
    setSearchResults([]);
    await placeMarker(lat, lng, meta);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await placeMarker(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    onSelect({
      address:  selectedAddress,
      lat:      selectedCoords.lat,
      lng:      selectedCoords.lng,
      pincode:  selectedMeta.pincode,
      city:     selectedMeta.city,
      district: selectedMeta.district,
      state:    selectedMeta.state,
    });
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery(""); setSearchResults([]); setShowDropdown(false);
    setSelectedAddress(""); setSelectedCoords(null);
    setSelectedMeta({ pincode: "", city: "", district: "", state: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} onClick={handleClose} />

      <div style={{ position: "relative", width: "100%", maxWidth: "680px", background: "#fff", borderRadius: "16px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90vh" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PinIcon />
            <span style={{ fontWeight: 600, fontSize: 15, color: "#1a2b4a" }}>{title}</span>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 8, display: "flex" }}>
            <CloseIcon />
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", position: "relative", zIndex: 1000 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
                {searching ? <SpinnerIcon /> : <SearchIcon />}
              </span>
              <input
                type="text" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Search city, area, landmark..."
                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px 10px 36px", fontSize: 13.5, outline: "none", boxSizing: "border-box", background: "#fff" }}
              />
              {showDropdown && searchResults.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 9999, overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
                  {searchResults.map((r) => (
                    <button key={r.place_id} type="button" onMouseDown={() => handleSearchSelect(r)}
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #f8fafc", padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#475569" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EEF3FF"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <span style={{ marginTop: 1, flexShrink: 0 }}><PinIcon size={14} color="#94a3b8" /></span>
                      <span style={{ lineHeight: 1.4 }}>{r.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={useCurrentLocation} disabled={locating}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, color: "#1a56db", border: "1px solid rgba(26,86,219,0.3)", background: "#EEF3FF", borderRadius: 10, padding: "10px 14px", cursor: "pointer", whiteSpace: "nowrap", opacity: locating ? 0.6 : 1, flexShrink: 0 }}
              onMouseEnter={e => { if (!locating) { e.currentTarget.style.background = "#1a56db"; e.currentTarget.style.color = "#fff"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "#EEF3FF"; e.currentTarget.style.color = "#1a56db"; }}>
              {locating ? <SpinnerIcon /> : <CrosshairIcon />}
              {locating ? "Locating…" : "My location"}
            </button>
          </div>
        </div>

        {/* Map */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {loadError && <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", background: "#fef2f2", fontSize: 13 }}>Failed to load map.</div>}
          {!leafletReady && !loadError && (
            <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", color: "#94a3b8", fontSize: 13, gap: 8 }}>
              <SpinnerIcon /> Loading map…
            </div>
          )}
          <div ref={mapContainerRef} style={{ height: 340, width: "100%", display: leafletReady ? "block" : "none" }} />
          {leafletReady && wardGeoJson && (
            <div style={{
              position: "absolute", top: 12, left: 12, zIndex: 1000,
              background: "rgba(26, 86, 219, 0.95)", color: "#fff", padding: "5px 12px",
              borderRadius: "20px", fontSize: "11.5px", fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: "6px",
              pointerEvents: "none"
            }}>
              <span>🗺️ Ward Boundary Highlighted</span>
            </div>
          )}
          {leafletReady && !selectedCoords && (
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", border: "1px solid #e2e8f0", borderRadius: 999, padding: "6px 16px", fontSize: 12, color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10 }}>
              Click on the map or search to pin a location
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", background: "#fff" }}>
          <div style={{ minHeight: 28, display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
            {reversing ? (
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}><SpinnerIcon /> Getting address…</span>
            ) : selectedAddress ? (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ marginTop: 1, flexShrink: 0 }}><PinIcon color="#16a34a" size={16} /></span>
                  <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: 0 }}>{selectedAddress}</p>
                </div>
                {/* ✅ Show auto-filled details */}
                {(selectedMeta.pincode || selectedMeta.city || selectedMeta.state) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {selectedMeta.pincode && (
                      <span style={{ background: "#EEF3FF", color: "#1a56db", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
                        📮 {selectedMeta.pincode}
                      </span>
                    )}
                    {selectedMeta.city && (
                      <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
                        🏙 {selectedMeta.city}
                      </span>
                    )}
                    {selectedMeta.district && (
                      <span style={{ background: "#fef9ec", color: "#b45309", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
                        🗺 {selectedMeta.district}
                      </span>
                    )}
                    {selectedMeta.state && (
                      <span style={{ background: "#fdf2f8", color: "#a21caf", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
                        📍 {selectedMeta.state}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No location selected</p>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handleClose}
              style={{ flex: 1, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 500, color: "#475569", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="button" onClick={handleConfirm} disabled={!selectedCoords || reversing}
              style={{ flex: 1, border: "none", background: !selectedCoords || reversing ? "#93b4f5" : "#1a56db", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: !selectedCoords || reversing ? "not-allowed" : "pointer" }}>
              Confirm Location
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: "#cbd5e1", marginTop: 10, marginBottom: 0 }}>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>OpenStreetMap</a>
          </p>
        </div>
      </div>
    </div>
  );
}