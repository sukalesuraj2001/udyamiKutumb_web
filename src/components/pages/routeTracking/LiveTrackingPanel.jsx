import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackCPRoute } from "../../redux/slices/Routetrackingslice.js";
import { selectToken } from "../../redux/slices/authSlice";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }

function bearing(a, b) {
  const lat1 = toRad(a[0]), lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function getRouteId(r, idx) {
  if (!r) return `route-${idx}`;
  return r.routeId || r._id || r.id || r.route_id || (r.channelPartnerId ? `${r.channelPartnerId}-${r.routeName || idx}` : `route-${idx}`);
}

function normalizePoint(p) {
  if (!p) return null;
  if (Array.isArray(p)) return p.length >= 2 ? { lat: Number(p[1]), lng: Number(p[0]) } : null;
  const lat = p.lat ?? p.latitude;
  const lng = p.lng ?? p.longitude;
  if (lat == null || lng == null) return null;
  return {
    lat: Number(lat),
    lng: Number(lng),
    heading: p.heading != null ? Number(p.heading) : undefined,
    speed: p.speed != null ? Number(p.speed) : undefined,
  };
}

// Animated bike-rider divIcon that rotates to face heading (0 = north)
function bikeRiderIcon(L, heading = 0, initials = "CP") {
  const svg = `
    <svg width="30" height="46" viewBox="0 0 30 46" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="bs" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-color="#000" flood-opacity=".4"/>
        </filter>
      </defs>
      <g filter="url(#bs)">
        <rect x="12.5" y="8" width="5" height="28" rx="2.5" fill="#4f46e5"/>
        <circle cx="15" cy="36" r="4.5" fill="#1a1a1a"/>
        <circle cx="15" cy="10" r="4.5" fill="#1a1a1a"/>
        <ellipse cx="15" cy="19" rx="6.5" ry="8.5" fill="#4f46e5"/>
        <circle cx="15" cy="7" r="4.2" fill="#1a1a1a"/>
        <circle cx="15" cy="6.5" r="1.6" fill="#818cf8"/>
      </g>
    </svg>`;
  return L.divIcon({
    className: "",
    html: `<div style="transform:rotate(${heading}deg);transform-origin:50% 50%;transition:transform 0.4s linear;">${svg}</div>`,
    iconSize: [30, 46],
    iconAnchor: [15, 23],
  });
}

function pinIcon(L, label, color) {
  const svg = `
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z"
            fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="17" cy="17" r="8.5" fill="#fff"/>
      <text x="17" y="21.5" font-family="Arial,sans-serif" font-size="12" font-weight="700"
            text-anchor="middle" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

// Debounce helper for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveTrackingPanel({ activeRoutes = [] }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const layersRef = useRef({});   // { [id]: { plannedLine, travelledLine, marker, startPin, endPin } }
  const headingRef = useRef({});  // { [id]: lastHeading }
  const pollRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [follow, setFollow] = useState(true);

  // ── Location Search state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchRef = useRef(null);

  // Stable string for polling/drawing dependency
  const routeIds = useMemo(
    () => activeRoutes.map((r, i) => getRouteId(r, i)).join(","),
    [activeRoutes]
  );

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [12.9716, 77.5946],
      13
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // ── Nominatim location search ─────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedSearch)}&limit=5&countrycodes=in`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data) => {
        setSearchResults(data);
        setShowResults(true);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = useCallback((result) => {
    const map = leafletMap.current;
    const L = window.L;
    if (!map || !L) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Remove previous search marker
    if (searchMarker) searchMarker.remove();

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="
          background:#ef4444;color:#fff;padding:4px 8px;
          border-radius:6px;font-size:12px;font-weight:600;
          white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          border:2px solid #fff;
        ">${result.display_name.split(",")[0]}</div>`,
        iconAnchor: [0, 0],
      }),
    })
      .addTo(map)
      .bindPopup(`<b>${result.display_name.split(",")[0]}</b><br/>${result.display_name}`, { maxWidth: 260 })
      .openPopup();

    setSearchMarker(marker);
    map.flyTo([lat, lng], 15, { duration: 1.2 });
    setSearchQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  }, [searchMarker]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    if (searchMarker) {
      searchMarker.remove();
      setSearchMarker(null);
    }
  }, [searchMarker]);

  // ── Draw/update route layers when activeRoutes change ─────────────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !window.L) return;
    const L = window.L;

    const activeIds = new Set(activeRoutes.map((r, i) => getRouteId(r, i)));

    // Remove stale layers
    Object.keys(layersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        const { plannedLine, travelledLine, marker, startPin, endPin } = layersRef.current[id];
        plannedLine?.remove();
        travelledLine?.remove();
        marker?.remove();
        startPin?.remove();
        endPin?.remove();
        delete layersRef.current[id];
        delete headingRef.current[id];
      }
    });

    activeRoutes.forEach((route, idx) => {
      const id = getRouteId(route, idx);
      const coords = route.routePath?.coordinates || [];
      if (coords.length < 2) return;

      const latLngs = coords.map(([lng, lat]) => [lat, lng]);
      const cpName = route.channelPartnerName || "CP";
      const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

      // ── Create layers for new route ──────────────────────────────────────
      if (!layersRef.current[id]) {
        // Planned route: grey dashed
        const plannedLine = L.polyline(latLngs, {
          color: "#94a3b8", weight: 4, dashArray: "8 5", opacity: 0.75,
          lineCap: "round", lineJoin: "round",
        }).addTo(map);

        // Travelled route: blue (with white outline for Google Maps look)
        const travelledOutline = L.polyline([], {
          color: "#ffffff", weight: 9, opacity: 1,
          lineCap: "round", lineJoin: "round",
        }).addTo(map);

        const travelledLine = L.polyline([], {
          color: "#4285F4", weight: 6, opacity: 1,
          lineCap: "round", lineJoin: "round",
        }).addTo(map);

        // Start pin (A)
        const [startLng, startLat] = coords[0];
        const startPin = L.marker([startLat, startLng], { icon: pinIcon(L, "A", "#34a853") })
          .addTo(map)
          .bindTooltip(`${cpName} · Start`);

        // End pin (B)
        const [endLng, endLat] = coords[coords.length - 1];
        const endPin = L.marker([endLat, endLng], { icon: pinIcon(L, "B", "#ea4335") })
          .addTo(map)
          .bindTooltip(`${cpName} · End`);

        // Live-position marker (bike rider)
        const marker = L.marker([startLat, startLng], {
          icon: bikeRiderIcon(L, 0, initials),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(`<b>${cpName}</b><br/>On Journey`);

        layersRef.current[id] = {
          plannedLine, travelledOutline, travelledLine,
          marker, startPin, endPin,
        };
        headingRef.current[id] = 0;
        map.fitBounds(plannedLine.getBounds(), { padding: [40, 40] });
      }

      // ── Update live tracking data ────────────────────────────────────────
      const livePoints = (route.livePoints || route.trackingHistory || [])
        .map(normalizePoint)
        .filter(Boolean);

      if (livePoints.length > 0) {
        const { travelledLine, travelledOutline, marker } = layersRef.current[id];
        const travelledLatLngs = livePoints.map((p) => [p.lat, p.lng]);

        travelledOutline.setLatLngs(travelledLatLngs);
        travelledLine.setLatLngs(travelledLatLngs);

        const last = livePoints[livePoints.length - 1];
        const prev = livePoints.length > 1 ? livePoints[livePoints.length - 2] : null;

        // Derive heading from last two points if API doesn't provide it
        let h = last.heading;
        if (h == null && prev) {
          h = bearing([prev.lat, prev.lng], [last.lat, last.lng]);
        }
        if (h != null) headingRef.current[id] = h;

        const currentHeading = headingRef.current[id] ?? 0;
        const cpName = route.channelPartnerName || "CP";
        const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

        // Update marker position and icon (with new heading)
        marker.setLatLng([last.lat, last.lng]);
        marker.setIcon(bikeRiderIcon(window.L, currentHeading, initials));

        // If "follow" is on and this is the selected (or only) route, pan to it
        if (follow && (selectedId === id || activeRoutes.length === 1)) {
          const map = leafletMap.current;
          if (map) {
            map.flyTo([last.lat, last.lng], Math.max(map.getZoom(), 16), { duration: 0.8 });
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeIds, follow]);

  // ── Highlight selected route and fit bounds on map when card clicked ───────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    Object.keys(layersRef.current).forEach((id) => {
      const { plannedLine, travelledOutline, travelledLine, marker } = layersRef.current[id] || {};
      const isSelected = selectedId === null || selectedId === id;

      if (plannedLine) {
        plannedLine.setStyle({
          color: selectedId === id ? "#1a56db" : "#94a3b8",
          weight: selectedId === id ? 6 : 4,
          opacity: isSelected ? 0.9 : 0.25,
          dashArray: selectedId === id ? null : "8 5",
        });
        if (selectedId === id) plannedLine.bringToFront();
      }
      if (travelledOutline) travelledOutline.setStyle({ opacity: isSelected ? 1 : 0.2 });
      if (travelledLine) {
        travelledLine.setStyle({ opacity: isSelected ? 1 : 0.2 });
        if (selectedId === id) travelledLine.bringToFront();
      }
    });

    if (selectedId && layersRef.current[selectedId]) {
      const { plannedLine } = layersRef.current[selectedId];
      if (plannedLine) {
        try {
          const bounds = plannedLine.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
          }
        } catch (e) {
          console.error("Failed to fit bounds for selected route", e);
        }
      }
    }
  }, [selectedId]);

  // ── Poll trackCPRoute every 30s ───────────────────────────────────────────
  useEffect(() => {
    if (!token || activeRoutes.length === 0) return;

    const poll = () => {
      activeRoutes.forEach((route) => {
        const cpId = route.channelPartnerId;
        if (cpId) dispatch(trackCPRoute({ channelPartnerId: cpId, token }));
      });
    };

    poll();
    pollRef.current = setInterval(poll, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeIds, token]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rt-live-panel">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="rt-live-sidebar">
        <div className="rt-live-sidebar-header">
          <span className="rt-live-dot" />
          <span>Active Channel Partners</span>
          <span className="rt-live-badge">{activeRoutes.length} ON JOURNEY</span>
        </div>

        {/* Follow toggle */}
        {activeRoutes.length > 0 && (
          <label className="rt-follow-toggle">
            <input
              type="checkbox"
              checked={follow}
              onChange={(e) => setFollow(e.target.checked)}
            />
            <span>Follow live location</span>
          </label>
        )}

        {activeRoutes.length === 0 ? (
          <div className="rt-live-empty">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#94a3b8">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No active journeys right now</p>
            <span style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
              Assigned routes will appear here when a Channel Partner starts their journey
            </span>
          </div>
        ) : (
          <div className="rt-live-list">
            {activeRoutes.map((route, idx) => {
              const id = getRouteId(route, idx);
              const coverage = route.coveragePercent ?? route.coverage ?? 0;
              const deviation = route.deviation ?? route.totalDeviationDistance ?? 0;
              const cpName = route.channelPartnerName || "Channel Partner";
              const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const statusKey = (route.status || "").toUpperCase();

              return (
                <div
                  key={id}
                  className={`rt-live-card ${selectedId === id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedId(selectedId === id ? null : id);
                    // Fly to this CP's latest position
                    const layers = layersRef.current[id];
                    if (layers) {
                      const livePoints = (route.livePoints || route.trackingHistory || [])
                        .map(normalizePoint).filter(Boolean);
                      if (livePoints.length > 0) {
                        const last = livePoints[livePoints.length - 1];
                        leafletMap.current?.flyTo([last.lat, last.lng], 16, { duration: 1 });
                      } else {
                        const bounds = layers.plannedLine?.getBounds?.();
                        if (bounds?.isValid?.()) leafletMap.current?.fitBounds(bounds, { padding: [40, 40] });
                      }
                    }
                  }}
                >
                  <div className="rt-live-avatar">{initials}</div>
                  <div className="rt-live-info">
                    <p className="rt-live-name">{cpName}</p>
                    <p className="rt-live-route">{route.routeName}</p>
                    <div className="rt-live-stats">
                      <div className="rt-live-coverage-bar">
                        <div
                          className="rt-live-coverage-fill"
                          style={{ width: `${Math.min(coverage, 100)}%` }}
                        />
                      </div>
                      <span className="rt-live-pct">{coverage}%</span>
                      {deviation > 0 && (
                        <span className="rt-live-dev">· {deviation}m dev.</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="rt-status-on"
                    style={statusKey === "ASSIGNED" ? { background: "#eff6ff", color: "#1d4ed8" } : {}}
                  >
                    {statusKey === "ASSIGNED" ? "ASSIGNED" : "ON JOURNEY"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Map area ─────────────────────────────────────────────────────── */}
      <div className="rt-live-map-wrap" style={{ position: "relative" }}>

        {/* ── Search Box (floats over map) ──────────────────────────────── */}
        <div
          ref={searchRef}
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "min(380px, calc(100% - 32px))",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: showResults && searchResults.length > 0 ? "12px 12px 0 0" : 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
            padding: "8px 12px",
            gap: 8,
          }}>
            {/* Search icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search location…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "#202124",
                background: "transparent",
              }}
            />

            {searchLoading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" style={{ flexShrink: 0, animation: "rt-spin 0.8s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4"/>
              </svg>
            )}

            {searchQuery && !searchLoading && (
              <button
                onClick={clearSearch}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {showResults && searchResults.length > 0 && (
            <div style={{
              background: "#fff",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              overflow: "hidden",
              borderTop: "1px solid #f1f3f4",
            }}>
              {searchResults.map((result, i) => {
                const name = result.display_name.split(",")[0];
                const detail = result.display_name.split(",").slice(1, 3).join(",").trim();
                const itemKey = result.place_id || `search-${i}`;
                return (
                  <button
                    key={itemKey}
                    onClick={() => handleSearchSelect(result)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#202124" }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#5f6368", marginTop: 1 }}>{detail}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {showResults && !searchLoading && searchResults.length === 0 && searchQuery.length >= 3 && (
            <div style={{
              background: "#fff",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              padding: "14px 16px",
              fontSize: 13,
              color: "#5f6368",
              borderTop: "1px solid #f1f3f4",
            }}>
              No results found for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Leaflet map */}
        <div ref={mapRef} className="rt-leaflet-map rt-live-map" />

        {activeRoutes.length === 0 && (
          <div className="rt-live-map-overlay">
            <p>Waiting for active journeys…</p>
          </div>
        )}

        {/* Legend */}
        <div className="rt-map-legend">
          <span className="rt-legend-item">
            <span className="rt-legend-line rt-legend-planned" /> Planned
          </span>
          <span className="rt-legend-item">
            <span className="rt-legend-line rt-legend-covered" /> Covered
          </span>
        </div>
      </div>

      {/* Spinner keyframe — injected once */}
      <style>{`@keyframes rt-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}