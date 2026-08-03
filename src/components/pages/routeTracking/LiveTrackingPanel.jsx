import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { trackCPRoute, selectTrackingData } from "../../redux/slices/Routetrackingslice.js";
import { selectToken } from "../../redux/slices/authSlice";

export default function LiveTrackingPanel({ activeRoutes = [] }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const layersRef = useRef({});
  const pollRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  // ── Stable route IDs for polling dependency ──────────────────────────────
  const routeIds = useMemo(
    () => activeRoutes.map((r) => r._id || r.id).join(","),
    [activeRoutes]
  );

  // ── Init map once ────────────────────────────────────────────────────────
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

  // ── Draw routes on map when activeRoutes change ──────────────────────────
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !window.L) return;
    const L = window.L;

    const activeIds = new Set(activeRoutes.map((r) => r._id || r.id));

    // Remove stale layers
    Object.keys(layersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        const { plannedLine, travelledLine, marker } = layersRef.current[id];
        plannedLine?.remove();
        travelledLine?.remove();
        marker?.remove();
        delete layersRef.current[id];
      }
    });

    activeRoutes.forEach((route) => {
      const id = route._id || route.id;
      const coords = route.routePath?.coordinates || [];
      if (coords.length < 2) return;

      const latLngs = coords.map(([lng, lat]) => [lat, lng]);
      const cpName = route.channelPartnerName || "CP";
      const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

      if (!layersRef.current[id]) {
        const plannedLine = L.polyline(latLngs, {
          color: "#94a3b8", weight: 3, dashArray: "6 4", opacity: 0.7,
        }).addTo(map);

        const travelledLine = L.polyline([], {
          color: "#16a34a", weight: 4, opacity: 0.9,
        }).addTo(map);

        const [startLng, startLat] = coords[0];
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:linear-gradient(135deg,#4f46e5,#818cf8);
            color:#fff;font-size:11px;font-weight:700;
            display:flex;align-items:center;justify-content:center;
            border:3px solid #fff;
            box-shadow:0 0 0 3px rgba(79,70,229,0.4),0 4px 12px rgba(0,0,0,0.25);
          ">${initials}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([startLat, startLng], { icon })
          .bindTooltip(`${cpName} · On Journey`)
          .addTo(map);

        layersRef.current[id] = { plannedLine, travelledLine, marker };
        map.fitBounds(plannedLine.getBounds(), { padding: [30, 30] });
      }

      // Update live points if available
      const livePoints = route.livePoints || route.trackingHistory || [];
      if (livePoints.length > 0 && layersRef.current[id]) {
        const { travelledLine, marker } = layersRef.current[id];
        const travelledLatLngs = livePoints.map((p) => [p.latitude, p.longitude]);
        travelledLine.setLatLngs(travelledLatLngs);
        const last = livePoints[livePoints.length - 1];
        marker.setLatLng([last.latitude, last.longitude]);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeIds]); // ← stable string, not object array → no infinite loop

  // ── Poll trackCPRoute every 30s for each active CP ───────────────────────
  useEffect(() => {
    if (!token || activeRoutes.length === 0) return;

    const poll = () => {
      activeRoutes.forEach((route) => {
        const cpId = route.channelPartnerId;
        if (cpId) dispatch(trackCPRoute({ channelPartnerId: cpId, token }));
      });
    };

    poll(); // immediate first call
    pollRef.current = setInterval(poll, 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeIds, token]); // ← stable string dependency

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="rt-live-panel">
      {/* CP list sidebar */}
      <div className="rt-live-sidebar">
        <div className="rt-live-sidebar-header">
          <span className="rt-live-dot" />
          <span>Active Channel Partners</span>
          <span className="rt-live-badge">{activeRoutes.length} ON JOURNEY</span>
        </div>

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
            {activeRoutes.map((route) => {
              const id = route._id || route.id;
              const coverage = route.coveragePercent ?? route.coverage ?? 0;
              const deviation = route.deviation ?? route.totalDeviationDistance ?? 0;
              const cpName = route.channelPartnerName || "Channel Partner";
              const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const statusKey = (route.status || "").toUpperCase();

              return (
                <div
                  key={id}
                  className={`rt-live-card ${selectedId === id ? "selected" : ""}`}
                  onClick={() => setSelectedId(selectedId === id ? null : id)}
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

      {/* Map */}
      <div className="rt-live-map-wrap">
        <div ref={mapRef} className="rt-leaflet-map rt-live-map" />
        {activeRoutes.length === 0 && (
          <div className="rt-live-map-overlay">
            <p>Waiting for active journeys…</p>
          </div>
        )}
        <div className="rt-map-legend">
          <span className="rt-legend-item">
            <span className="rt-legend-line rt-legend-planned" /> Planned
          </span>
          <span className="rt-legend-item">
            <span className="rt-legend-line rt-legend-covered" /> Covered
          </span>
        </div>
      </div>
    </div>
  );
}