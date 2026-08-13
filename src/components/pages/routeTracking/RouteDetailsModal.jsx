import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectJourneyReports } from "../../redux/slices/Routetrackingslice.js";

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

const STATUS_COLORS = {
  ASSIGNED: { bg: "#eff6ff", color: "#1d4ed8", label: "Assigned" },
  STARTED: { bg: "#f0fdf4", color: "#15803d", label: "On Journey" },
  COMPLETED: { bg: "#f0fdf4", color: "#15803d", label: "Completed" },
  MATCHED: { bg: "#f0fdf4", color: "#15803d", label: "Matched" },
  PARTIAL: { bg: "#fffbeb", color: "#b45309", label: "Partial" },
  UNMATCHED: { bg: "#fef2f2", color: "#b91c1c", label: "Unmatched" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RouteDetailsModal({ route, onClose, onEdit }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("street");

  const reports = useSelector(selectJourneyReports);

  const statusKey = route?.status?.toUpperCase() || "ASSIGNED";
  const badge = STATUS_COLORS[statusKey] || STATUS_COLORS.ASSIGNED;

  // Find matching journey report from Redux state if available
  const matchingReport = useMemo(() => {
    if (!route) return null;
    const rId = route._id || route.id || route.routeId;
    const cpId = route.channelPartnerId || route.assignedTo;
    return reports.find(
      (rep) =>
        (rId && (rep.routeId === rId || rep.reportId === rId || rep._id === rId)) ||
        (cpId && rep.channelPartnerId === cpId)
    );
  }, [route, reports]);

  // Robust coverage calculation checking API response keys (coveragePercentage, coveragePercent, etc.)
  const rawCoverage =
    route?.coveragePercentage ??
    route?.coveragePercent ??
    route?.coverage ??
    matchingReport?.coveragePercentage ??
    matchingReport?.coveragePercent ??
    matchingReport?.coverage ??
    (statusKey === "COMPLETED" || statusKey === "MATCHED" ? 100 : 0);

  const coverage = Number(Number(rawCoverage).toFixed(1));
  const coords = route?.routePath?.coordinates || [];
  const cpName = route?.channelPartnerName || "Unassigned";

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapRef.current || !window.L || leafletMap.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [12.9716, 77.5946],
      13
    );

    const styleConfig = MAP_STYLES.street;
    tileLayerRef.current = L.tileLayer(styleConfig.url, {
      attribution: styleConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    // Draw route line if coordinates exist
    if (coords.length > 0) {
      const latLngs = coords.map(([lng, lat]) => [lat, lng]);

      // Outline + main route polyline
      L.polyline(latLngs, {
        color: "#ffffff",
        weight: 7,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      L.polyline(latLngs, {
        color: "#4f46e5",
        weight: 4,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Draw Start (S) and End (E) or Waypoint markers
      coords.forEach(([lng, lat], i) => {
        const isStart = i === 0;
        const isEnd = i === coords.length - 1 && coords.length > 1;
        const color = isStart ? "#16a34a" : isEnd ? "#dc2626" : "#4f46e5";
        const label = isStart ? "S" : isEnd ? "E" : `${i + 1}`;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:26px;height:26px;border-radius:50%;
            background:${color};color:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;
            border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);
          ">${label}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([lat, lng], { icon })
          .addTo(map)
          .bindTooltip(
            isStart ? "Start Point" : isEnd ? "End Point" : `Waypoint ${i + 1}`,
            { permanent: false }
          );
      });

      // Fit map bounds
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [coords]);

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

  if (!route) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Route Details
              </span>
              <span
                className="px-2.5 py-0.5 text-xs font-semibold rounded-full"
                style={{ background: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {route.routeName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
              <p className="text-xs text-indigo-600 font-medium">Assigned To</p>
              <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
                {cpName}
              </p>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5">
              <p className="text-xs text-blue-600 font-medium">Planned Distance</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {route.plannedDistance
                  ? `${(route.plannedDistance / 1000).toFixed(2)} km (${route.plannedDistance} m)`
                  : "—"}
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5">
              <p className="text-xs text-amber-600 font-medium">Est. Duration</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {route.estimatedDuration ? `${route.estimatedDuration} mins` : "—"}
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
              <p className="text-xs text-emerald-600 font-medium">Waypoints</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {coords.length} points
              </p>
            </div>
          </div>

          {/* Coverage Progress Bar (If journey started/completed) */}
          {statusKey !== "ASSIGNED" && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Journey Coverage
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {coverage}% Covered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(coverage, 100)}%`,
                    background:
                      coverage >= 90
                        ? "#16a34a"
                        : coverage >= 70
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}

          {/* Map Preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Route Map Preview
              </p>
            </div>
            <div style={{ position: "relative" }}>
              {/* Map Layer Switcher */}
              <div style={{
                position: "absolute", top: 10, left: 10, zIndex: 1000,
                display: "flex", gap: 3, background: "#fff", padding: 3,
                borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                border: "1px solid #e2e8f0",
              }}>
                {Object.entries(MAP_STYLES).map(([key, styleObj]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMapStyle(key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: "none", cursor: "pointer",
                      background: mapStyle === key ? "#4f46e5" : "transparent",
                      color: mapStyle === key ? "#fff" : "#475569",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{styleObj.icon}</span>
                    <span>{styleObj.name}</span>
                  </button>
                ))}
              </div>

              <div
                ref={mapRef}
                className="w-full h-64 rounded-xl border border-gray-200 shadow-inner overflow-hidden"
              />
            </div>
          </div>

          {/* Route Info Details */}
          <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 text-xs space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Route ID:</span>
              <span className="font-mono text-gray-800">
                {route._id || route.id || "—"}
              </span>
            </div>
            {matchingReport && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Actual Distance Traveled:</span>
                  <span className="font-semibold text-gray-900">
                    {matchingReport.actualDistance != null
                      ? `${(matchingReport.actualDistance / 1000).toFixed(2)} km (${matchingReport.actualDistance} m)`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Actual Journey Duration:</span>
                  <span className="font-semibold text-gray-900">
                    {matchingReport.actualDuration != null ? `${matchingReport.actualDuration} mins` : "—"}
                  </span>
                </div>
                {matchingReport.totalTrackingPoints != null && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Tracking Points:</span>
                    <span className="font-semibold text-gray-900">
                      {matchingReport.coveredPoints ?? 0} / {matchingReport.totalTrackingPoints} covered ({matchingReport.deviatedPoints ?? 0} deviated)
                    </span>
                  </div>
                )}
              </>
            )}
            {route.createdAt && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Created At:</span>
                <span className="text-gray-800">{formatDate(route.createdAt)}</span>
              </div>
            )}
            {route.updatedAt && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Last Updated:</span>
                <span className="text-gray-800">{formatDate(route.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          {statusKey === "ASSIGNED" && onEdit ? (
            <button
              onClick={() => {
                onClose();
                onEdit(route);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-medium transition-colors"
            >
              ✏️ Edit Route
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
