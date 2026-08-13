import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllRoutesByChairman,
  selectAllRoutes,
  selectRouteStatus,
} from "../../redux/slices/Routetrackingslice.js";
import { selectToken, selectUser } from "../../redux/slices/authSlice";
import CreateRouteModal from "./CreateRouteModal";
import UpdateRouteModal from "./UpdateRouteModal"; // NEW
import RouteDetailsModal from "./RouteDetailsModal";
import LiveTrackingPanel from "./LiveTrackingPanel";
import JourneyReportsTable from "./JourneyReportsTable";

function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = resolve;
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

const TABS = [
  { id: "live", label: "Live Tracking", icon: "📍" },
  { id: "routes", label: "All Routes", icon: "🗺" },
  { id: "reports", label: "Journey Reports", icon: "📊" },
];

const STATUS_COLORS = {
  ASSIGNED: { bg: "#eff6ff", color: "#1d4ed8", label: "Assigned" },
  STARTED: { bg: "#f0fdf4", color: "#15803d", label: "On Journey" },
  COMPLETED: { bg: "#f0fdf4", color: "#15803d", label: "Completed" },
  MATCHED: { bg: "#f0fdf4", color: "#15803d", label: "Matched" },
  PARTIAL: { bg: "#fffbeb", color: "#b45309", label: "Partial" },
  UNMATCHED: { bg: "#fef2f2", color: "#b91c1c", label: "Unmatched" },
};

export default function RouteTracking() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const routes = useSelector(selectAllRoutes);
  const status = useSelector(selectRouteStatus);

  const [leafletReady, setLeafletReady] = useState(false);
  const [activeTab, setActiveTab] = useState("live");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedDetailsRoute, setSelectedDetailsRoute] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  const getChairmanId = () => {
    if (!user) return null;
    return user.id || user._id || user.userId || user.chairmanId || user.wardChairmanId || user.sub;
  };

  useEffect(() => {
    if (token && user) {
      const chairmanId = getChairmanId();
      if (!chairmanId) {
        setError("Unable to identify chairman ID. Please check your login session.");
        return;
      }
      setError(null);
      dispatch(getAllRoutesByChairman({ wardChairmanId: chairmanId, token }));
    }
  }, [token, user, dispatch]);

  const refreshRoutes = () => {
    if (token && user) {
      const chairmanId = getChairmanId();
      if (chairmanId) {
        dispatch(getAllRoutesByChairman({ wardChairmanId: chairmanId, token }));
      }
    }
  };

  const handleCreateModalClose = (refreshed) => {
    setShowCreateModal(false);
    if (refreshed) refreshRoutes();
  };

  const handleUpdateModalClose = (refreshed) => {
    setShowUpdateModal(false);
    setSelectedRoute(null);
    if (refreshed) refreshRoutes();
  };

  const handleEditRoute = (route) => {
    setSelectedRoute(route);
    setShowUpdateModal(true);
  };

  const handleViewDetails = (route) => {
    setSelectedDetailsRoute(route);
    setShowDetailsModal(true);
  };

  // Derived data
  const activeRoutes = routes.filter((r) => r.status?.toUpperCase() === "STARTED");
  const assignedRoutes = routes.filter((r) => r.status?.toUpperCase() === "ASSIGNED");
  const completedRoutes = routes.filter((r) =>
    ["COMPLETED", "MATCHED", "PARTIAL", "UNMATCHED"].includes(r.status?.toUpperCase())
  );

  const avgCoverage =
    completedRoutes.length > 0
      ? Math.round(
          completedRoutes.reduce(
            (acc, r) => acc + (r.coveragePercent ?? r.coverage ?? 0),
            0
          ) / completedRoutes.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider">
              Ward Chairman · Operations
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Route Tracking</h1>
            <p className="text-gray-600 mt-1">
              Assign routes, watch live journeys, and review coverage reports.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Route
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p className="flex-1 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-lg">
              ✕
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺</span>
              <div>
                <p className="text-sm text-gray-500">Total Routes</p>
                <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                <p className="text-xs text-gray-400">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-gray-500">Active Journeys</p>
                <p className="text-2xl font-bold text-green-600">{activeRoutes.length}</p>
                <p className="text-xs text-gray-400">{activeRoutes.length > 0 ? "Live now" : "None active"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{assignedRoutes.length}</p>
                <p className="text-xs text-gray-400">Awaiting start</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm text-gray-500">Avg. Coverage</p>
                <p className="text-2xl font-bold text-gray-900">{avgCoverage}%</p>
                <p className="text-xs text-gray-400">{completedRoutes.length} completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.id === "live" && activeRoutes.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {activeRoutes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {/* LIVE */}
          {activeTab === "live" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {!leafletReady ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">Loading map…</p>
                </div>
              ) : (
                <LiveTrackingPanel activeRoutes={activeRoutes} />
              )}
            </div>
          )}

          {/* ALL ROUTES */}
          {activeTab === "routes" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {status === "loading" ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500">Fetching routes…</p>
                </div>
              ) : routes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" className="mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-900 font-medium text-lg mb-1">No routes created yet</p>
                  <p className="text-gray-500 text-sm mb-4">Click "Create Route" to assign your first route</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    + Create Route
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {routes.map((route) => {
                    const id = route._id || route.id || route.routeId;
                    const statusKey = route.status?.toUpperCase() || "ASSIGNED";
                    const badge = STATUS_COLORS[statusKey] || STATUS_COLORS.ASSIGNED;
                    const coverage = route.coveragePercent ?? route.coverage ?? 0;
                    const coords = route.routePath?.coordinates || [];
                    const cpName = route.channelPartnerName || "Unassigned";

                    return (
                      <div key={id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{route.routeName}</h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate">{cpName}</span>
                            </div>
                          </div>
                          <span
                            className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                          <span>📏 {route.plannedDistance ? `${(route.plannedDistance / 1000).toFixed(1)} km` : "—"}</span>
                          <span>⏱ {route.estimatedDuration ? `${route.estimatedDuration} min` : "—"}</span>
                          <span>📌 {coords.length} waypoints</span>
                        </div>

                        {/* Coverage Bar */}
                        {statusKey !== "ASSIGNED" && (
                          <div className="mb-3">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(coverage, 100)}%`,
                                  background: coverage >= 90 ? "#16a34a" : coverage >= 70 ? "#f59e0b" : "#ef4444",
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{coverage}% covered</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          {statusKey === "ASSIGNED" && (
                            <button
                              onClick={() => handleEditRoute(route)}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                              ✏️ Edit Route
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDetails(route)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            👁️ View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <JourneyReportsTable routes={completedRoutes} />
            </div>
          )}
        </div>
      </div>

      {/* Create Route Modal */}
      {showCreateModal && leafletReady && (
        <CreateRouteModal onClose={handleCreateModalClose} channelPartners={[]} />
      )}

      {/* Update Route Modal */}
      {showUpdateModal && leafletReady && selectedRoute && (
        <UpdateRouteModal
          route={selectedRoute}
          onClose={handleUpdateModalClose}
          channelPartners={[]}
        />
      )}

      {/* Route Details Modal */}
      {showDetailsModal && selectedDetailsRoute && (
        <RouteDetailsModal
          route={selectedDetailsRoute}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDetailsRoute(null);
          }}
          onEdit={handleEditRoute}
        />
      )}
    </div>
  );
}