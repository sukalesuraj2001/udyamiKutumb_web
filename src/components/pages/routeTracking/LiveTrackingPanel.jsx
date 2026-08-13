import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackCPRoute } from "../../redux/slices/Routetrackingslice.js";
import { selectToken } from "../../redux/slices/authSlice";

// ── Math & Distance Helpers ───────────────────────────────────────────────────

function toRad(deg) { return (deg * Math.PI) / 180; }
function toDeg(rad) { return (rad * 180) / Math.PI; }

function bearing(a, b) {
  const lat1 = toRad(a[0]), lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getRouteId(r, idx) {
  if (!r) return `route-${idx}`;
  return (
    r._id ||
    r.routeId ||
    r.id ||
    r.route_id ||
    (r.channelPartnerId ? `${r.channelPartnerId}-${r.routeName || idx}` : `route-${idx}`)
  );
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

// ── Google Maps Navigation Icon (Pulsing Blue Dot + Directional Arrow) ───────
function googleNavMarkerIcon(L, heading = 0, initials = "CP") {
  const svg = `
    <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <!-- Pulsing Outer Aura -->
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:rgba(66,133,244,0.3);
        animation:rt-pulse 2s ease-out infinite;
      "></div>
      
      <!-- Directional Cone / Beam -->
      <div style="
        position:absolute;top:-4px;width:0;height:0;
        border-left:14px solid transparent;
        border-right:14px solid transparent;
        border-bottom:24px solid rgba(66,133,244,0.4);
        transform:rotate(${heading}deg);transform-origin:50% 26px;
        transition:transform 0.4s ease-out;
        filter:blur(1px);
      "></div>

      <!-- Navigation Arrow Pointer -->
      <div style="
        position:relative;z-index:2;width:34px;height:34px;border-radius:50%;
        background:#1a73e8;border:3px solid #ffffff;
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" style="
          transform:rotate(${heading}deg);transform-origin:50% 50%;
          transition:transform 0.4s ease-out;
        ">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      </div>

      <!-- Initial Badge -->
      <div style="
        position:absolute;bottom:-6px;right:-4px;z-index:3;
        background:#1e293b;color:#fff;font-size:9px;font-weight:800;
        padding:1px 5px;border-radius:8px;border:1px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
      ">${initials}</div>
    </div>`;

  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function pinIcon(L, label, color) {
  const svg = `
    <svg width="32" height="42" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="17" cy="17" r="8.5" fill="#fff"/>
      <text x="17" y="21.5" font-family="Arial,sans-serif" font-size="12" font-weight="800"
            text-anchor="middle" fill="${color}">${label}</text>
    </svg>`;
  return L.divIcon({
    className: "",
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Map Tile Layers Configuration ─────────────────────────────────────────────
const MAP_STYLES = {
  street: {
    name: "Street",
    icon: "🗺️",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  satellite: {
    name: "Satellite",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri World Imagery",
  },
  dark: {
    name: "Night",
    icon: "🌙",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO Dark",
  },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveTrackingPanel({ activeRoutes = [] }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const tileLayerRef = useRef(null);

  // Layers storage: { [id]: { plannedLine, aheadLine, pastLine, pastOutline, marker, startPin, endPin } }
  const layersRef = useRef({});
  const headingRef = useRef({});
  const pollRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const [follow, setFollow] = useState(true);
  const [mapStyle, setMapStyle] = useState("street");
  const [fadePastRoute, setFadePastRoute] = useState(true); // Google Maps fade past route feature

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchRef = useRef(null);

  const trackingDataSig = useMemo(
    () =>
      activeRoutes
        .map((r, i) => {
          const id = getRouteId(r, i);
          const history = r.trackingHistory || r.livePoints || [];
          const cur = r.currentLocation;
          const curTime = cur?.capturedAt || cur?.timestamp || "";
          const curLat = cur?.latitude ?? cur?.lat ?? "";
          const curLng = cur?.longitude ?? cur?.lng ?? "";
          return `${id}:${history.length}:${curLat}:${curLng}:${curTime}`;
        })
        .join("|"),
    [activeRoutes]
  );

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [12.9716, 77.5946],
      14
    );

    // Zoom control on top right
    L.control.zoom({ position: "topright" }).addTo(map);

    const style = MAP_STYLES.street;
    tileLayerRef.current = L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // ── Switch Map Tile Layer (Street / Satellite / Night) ───────────────────
  useEffect(() => {
    const map = leafletMap.current;
    const L = window.L;
    if (!map || !L) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const styleConfig = MAP_STYLES[mapStyle] || MAP_STYLES.street;
    tileLayerRef.current = L.tileLayer(styleConfig.url, {
      attribution: styleConfig.attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [mapStyle]);

  // ── Nominatim Location Search ─────────────────────────────────────────────
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = useCallback(
    (result) => {
      const map = leafletMap.current;
      const L = window.L;
      if (!map || !L) return;

      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (searchMarker) searchMarker.remove();

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="
            background:#ef4444;color:#fff;padding:5px 10px;
            border-radius:8px;font-size:12px;font-weight:700;
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
      map.flyTo([lat, lng], 16, { duration: 1.2 });
      setSearchQuery(result.display_name.split(",")[0]);
      setShowResults(false);
    },
    [searchMarker]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    if (searchMarker) {
      searchMarker.remove();
      setSearchMarker(null);
    }
  }, [searchMarker]);

  // ── Draw & Update Layers (Google Maps Navigation Style) ───────────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !window.L) return;
    const L = window.L;

    const activeIds = new Set(activeRoutes.map((r, i) => getRouteId(r, i)));

    // Cleanup removed routes
    Object.keys(layersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        const { aheadLine, aheadOutline, pastLine, pastOutline, marker, startPin, endPin } =
          layersRef.current[id];
        aheadOutline?.remove();
        aheadLine?.remove();
        pastOutline?.remove();
        pastLine?.remove();
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

      // ── Create Layers if New Route ─────────────────────────────────────────
      if (!layersRef.current[id]) {
        // Ahead Route (Google Maps vibrant blue path ahead of user)
        const aheadOutline = L.polyline(latLngs, {
          color: "#ffffff",
          weight: 9,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        const aheadLine = L.polyline(latLngs, {
          color: "#1a73e8", // Google Maps Blue
          weight: 6,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Past Route (Disappearing / Translucent Faded Grey behind user)
        const pastOutline = L.polyline([], {
          color: "#ffffff",
          weight: 6,
          opacity: 0.4,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        const pastLine = L.polyline([], {
          color: fadePastRoute ? "#94a3b8" : "#3b82f6", // Faded grey if fade enabled
          weight: 4,
          opacity: fadePastRoute ? 0.35 : 0.8,
          dashArray: fadePastRoute ? "6 4" : null,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        // Start (A) and End (B) Pins
        const [startLng, startLat] = coords[0];
        const startPin = L.marker([startLat, startLng], { icon: pinIcon(L, "A", "#16a34a") })
          .addTo(map)
          .bindTooltip(`${cpName} · Start`);

        const [endLng, endLat] = coords[coords.length - 1];
        const endPin = L.marker([endLat, endLng], { icon: pinIcon(L, "B", "#dc2626") })
          .addTo(map)
          .bindTooltip(`${cpName} · End`);

        // Live Navigation Marker (Pulsing blue dot with compass arrow)
        const marker = L.marker([startLat, startLng], {
          icon: googleNavMarkerIcon(L, 0, initials),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(`<b>${cpName}</b><br/>${route.routeName}`);

        layersRef.current[id] = {
          aheadOutline,
          aheadLine,
          pastOutline,
          pastLine,
          marker,
          startPin,
          endPin,
          fullCoords: coords,
        };
        headingRef.current[id] = 0;

        map.fitBounds(aheadLine.getBounds(), { padding: [50, 50] });
      }

      // ── Update Live Tracking Position & Faded Past Path ──────────────────
      let livePoints = (route.livePoints || route.trackingHistory || [])
        .map(normalizePoint)
        .filter(Boolean);

      const currentLocPoint = normalizePoint(route.currentLocation);
      if (currentLocPoint) {
        const lastPt = livePoints[livePoints.length - 1];
        if (
          !lastPt ||
          Math.abs(lastPt.lat - currentLocPoint.lat) > 0.000001 ||
          Math.abs(lastPt.lng - currentLocPoint.lng) > 0.000001
        ) {
          livePoints.push(currentLocPoint);
        }
      }

      if (livePoints.length > 0) {
        const { aheadLine, aheadOutline, pastLine, pastOutline, marker } =
          layersRef.current[id];
        const travelledLatLngs = livePoints.map((p) => [p.lat, p.lng]);

        // 1. Update Traveled (Past) Route Line (Faded / Disappeared behind user)
        pastOutline.setLatLngs(travelledLatLngs);
        pastLine.setLatLngs(travelledLatLngs);
        pastLine.setStyle({
          color: fadePastRoute ? "#94a3b8" : "#3b82f6",
          opacity: fadePastRoute ? 0.35 : 0.8,
          dashArray: fadePastRoute ? "6 4" : null,
        });

        // 2. Update Ahead Route Line (Split planned route from current point to end)
        const last = livePoints[livePoints.length - 1];

        // Find closest point on planned route to current location
        let minIndex = 0;
        let minDist = Infinity;
        latLngs.forEach(([plat, plng], pidx) => {
          const d = haversineDistance(last.lat, last.lng, plat, plng);
          if (d < minDist) {
            minDist = d;
            minIndex = pidx;
          }
        });

        const remainingPath = [[last.lat, last.lng], ...latLngs.slice(minIndex + 1)];
        if (remainingPath.length >= 2) {
          aheadOutline.setLatLngs(remainingPath);
          aheadLine.setLatLngs(remainingPath);
        }

        // 3. Compute Compass Heading Angle
        const prev = livePoints.length > 1 ? livePoints[livePoints.length - 2] : null;
        let h = last.heading;
        if (h == null && prev) {
          h = bearing([prev.lat, prev.lng], [last.lat, last.lng]);
        }
        if (h != null) headingRef.current[id] = h;

        const currentHeading = headingRef.current[id] ?? 0;
        const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

        // 4. Smooth Marker Update
        marker.setLatLng([last.lat, last.lng]);
        marker.setIcon(googleNavMarkerIcon(window.L, currentHeading, initials));

        // 5. Auto Follow User Camera
        if (follow && (selectedId === id || activeRoutes.length === 1)) {
          const map = leafletMap.current;
          if (map) {
            map.flyTo([last.lat, last.lng], Math.max(map.getZoom(), 16), {
              duration: 0.8,
            });
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingDataSig, follow, fadePastRoute]);

  // ── Highlight Selected Route ──────────────────────────────────────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    Object.keys(layersRef.current).forEach((id) => {
      const { aheadLine, aheadOutline, pastLine, pastOutline } = layersRef.current[id] || {};
      const isSelected = selectedId === null || selectedId === id;

      if (aheadLine) {
        aheadLine.setStyle({
          color: selectedId === id ? "#1a73e8" : "#64748b",
          weight: selectedId === id ? 7 : 4,
          opacity: isSelected ? 1 : 0.2,
        });
        if (selectedId === id) aheadLine.bringToFront();
      }
      if (aheadOutline) aheadOutline.setStyle({ opacity: isSelected ? 0.95 : 0.1 });
      if (pastLine) pastLine.setStyle({ opacity: isSelected ? (fadePastRoute ? 0.35 : 0.8) : 0.1 });
      if (pastOutline) pastOutline.setStyle({ opacity: isSelected ? 0.4 : 0.05 });
    });

    if (selectedId && layersRef.current[selectedId]) {
      const { aheadLine } = layersRef.current[selectedId];
      if (aheadLine) {
        try {
          const bounds = aheadLine.getBounds();
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
          }
        } catch (e) {
          console.error("Failed to fit bounds for selected route", e);
        }
      }
    }
  }, [selectedId, fadePastRoute]);

  // ── Poll Live Tracking Data ───────────────────────────────────────────────
  useEffect(() => {
    if (!token || activeRoutes.length === 0) return;

    const poll = () => {
      activeRoutes.forEach((route) => {
        const rId = route._id || route.routeId || route.id;
        const cpId =
          route.channelPartnerId ||
          route.assignedTo ||
          route.channelPartner?._id ||
          (typeof route.channelPartner === "string" ? route.channelPartner : null);

        if (rId) {
          dispatch(trackCPRoute({ routeId: rId, channelPartnerId: cpId, token }));
        } else if (cpId) {
          dispatch(trackCPRoute({ routeId: cpId, channelPartnerId: cpId, token }));
        }
      });
    };

    poll();
    pollRef.current = setInterval(poll, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingDataSig, token]);

  // Derived selected route data for HUD
  const selectedRouteObj = useMemo(() => {
    if (!selectedId) return activeRoutes[0] || null;
    return activeRoutes.find((r, i) => getRouteId(r, i) === selectedId) || activeRoutes[0] || null;
  }, [selectedId, activeRoutes]);

  // Calculate live HUD metrics (Speed, Remaining distance, ETA)
  const hudMetrics = useMemo(() => {
    if (!selectedRouteObj) return null;
    const curLoc = normalizePoint(selectedRouteObj.currentLocation);
    const speed = curLoc?.speed != null ? Math.round(curLoc.speed * 3.6) : 0; // m/s to km/h
    const coverage = selectedRouteObj.coveragePercent ?? selectedRouteObj.coverage ?? 0;
    const totalDist = selectedRouteObj.plannedDistance || 0; // in meters
    const remainingDistMeters = Math.max(0, Math.round(totalDist * (1 - coverage / 100)));
    const remainingKm = (remainingDistMeters / 1000).toFixed(1);
    const etaMins = speed > 5 ? Math.round((remainingDistMeters / 1000 / speed) * 60) : Math.round(remainingDistMeters / 300);

    return {
      speed,
      remainingKm,
      etaMins: Math.max(1, etaMins),
      coverage,
      cpName: selectedRouteObj.channelPartnerName || "Channel Partner",
      routeName: selectedRouteObj.routeName,
    };
  }, [selectedRouteObj]);

  // Handler to recenter camera to user location
  const handleRecenter = () => {
    if (!selectedRouteObj) return;
    const curLoc = normalizePoint(selectedRouteObj.currentLocation);
    if (curLoc && leafletMap.current) {
      leafletMap.current.flyTo([curLoc.lat, curLoc.lng], 16, { duration: 1 });
    }
  };

  return (
    <div className="rt-live-panel">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="rt-live-sidebar">
        <div className="rt-live-sidebar-header">
          <span className="rt-live-dot" />
          <span>Active Channel Partners</span>
          <span className="rt-live-badge">{activeRoutes.length} ON JOURNEY</span>
        </div>

        {/* Controls Bar */}
        {activeRoutes.length > 0 && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 border-b border-gray-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={follow}
                onChange={(e) => setFollow(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>🎯 Follow live location</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium select-none">
              <input
                type="checkbox"
                checked={fadePastRoute}
                onChange={(e) => setFadePastRoute(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>🌫️ Fade traveled path (Google Maps style)</span>
            </label>
          </div>
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
              const rawDev = route.deviation ?? route.totalDeviationDistance ?? route.currentLocation?.deviationDistance ?? route.currentLocation?.deviation ?? 0;
              const deviation = Math.round(Number(rawDev) || 0);
              const cpName = route.channelPartnerName || "Channel Partner";
              const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const statusKey = (route.status || "").toUpperCase();

              return (
                <div
                  key={id}
                  className={`rt-live-card ${selectedId === id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedId(selectedId === id ? null : id);
                    const curPt = normalizePoint(route.currentLocation);
                    if (curPt) {
                      leafletMap.current?.flyTo([curPt.lat, curPt.lng], 16, { duration: 1 });
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

      {/* ── Map Area ─────────────────────────────────────────────────────── */}
      <div className="rt-live-map-wrap" style={{ position: "relative" }}>

        {/* ── Google Maps Search Box ─────────────────────────────────────── */}
        <div
          ref={searchRef}
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "min(360px, calc(100% - 32px))",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            borderRadius: showResults && searchResults.length > 0 ? "12px 12px 0 0" : 12,
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            padding: "8px 12px",
            gap: 8,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search location on map…"
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: 13, color: "#202124", background: "transparent",
              }}
            />

            {searchLoading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" style={{ flexShrink: 0, animation: "rt-spin 0.8s linear infinite" }}>
                <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4"/>
              </svg>
            )}

            {searchQuery && !searchLoading && (
              <button onClick={clearSearch} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div style={{
              background: "#fff", borderRadius: "0 0 12px 12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              overflow: "hidden", borderTop: "1px solid #f1f3f4",
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
                      width: "100%", display: "flex", alignItems: "flex-start",
                      gap: 10, padding: "9px 12px", background: "none",
                      border: "none", cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
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
        </div>

        {/* ── Google Maps Layer Switcher (Top Left) ──────────────────────── */}
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 1000,
          display: "flex", gap: 4, background: "#fff", padding: 3,
          borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
          border: "1px solid #e2e8f0",
        }}>
          {Object.entries(MAP_STYLES).map(([key, styleObj]) => (
            <button
              key={key}
              onClick={() => setMapStyle(key)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 8px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                border: "none", cursor: "pointer",
                background: mapStyle === key ? "#1a73e8" : "transparent",
                color: mapStyle === key ? "#fff" : "#475569",
                transition: "all 0.2s",
              }}
            >
              <span>{styleObj.icon}</span>
              <span>{styleObj.name}</span>
            </button>
          ))}
        </div>

        {/* ── Recenter Target Button (Bottom Right) ──────────────────────── */}
        {activeRoutes.length > 0 && (
          <button
            onClick={handleRecenter}
            title="Recenter to active vehicle"
            style={{
              position: "absolute", bottom: 50, right: 12, zIndex: 1000,
              width: 40, height: 40, borderRadius: 10,
              background: "#fff", border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </button>
        )}

        {/* ── Google Maps Live Navigation HUD Card (Top/Bottom Overlay) ──── */}
        {hudMetrics && activeRoutes.length > 0 && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, width: "min(440px, calc(100% - 32px))",
            background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)",
            borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)", color: "#fff",
            padding: "12px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{hudMetrics.cpName}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{hudMetrics.routeName}</div>
              </div>

              {/* ETA Badge */}
              <div style={{
                background: "#1a73e8", padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 700, textAlign: "center",
              }}>
                ETA ~{hudMetrics.etaMins} mins
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12, marginTop: 10, paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Speed</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#38bdf8", marginTop: 1 }}>{hudMetrics.speed} km/h</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Remaining</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#facc15", marginTop: 1 }}>{hudMetrics.remainingKm} km</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Progress</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#4ade80", marginTop: 1 }}>{hudMetrics.coverage}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaflet Map */}
        <div ref={mapRef} className="rt-leaflet-map rt-live-map" />

        {activeRoutes.length === 0 && (
          <div className="rt-live-map-overlay">
            <p>Waiting for active journeys…</p>
          </div>
        )}

        {/* Legend */}
        <div className="rt-map-legend" style={{ zIndex: 999 }}>
          <span className="rt-legend-item">
            <span className="rt-legend-line" style={{ background: "#1a73e8", height: 4 }} /> Route Ahead
          </span>
          <span className="rt-legend-item">
            <span className="rt-legend-line" style={{ background: "#94a3b8", height: 3, opacity: 0.5 }} /> Past Path (Faded)
          </span>
        </div>
      </div>

      {/* Keyframe Animations */}
      <style>{`
        @keyframes rt-spin { to { transform: rotate(360deg); } }
        @keyframes rt-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}