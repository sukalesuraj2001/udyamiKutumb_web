import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  updateRoute, 
  resetUpdateStatus, 
  selectUpdateStatus, 
  selectRouteError,
  fetchChannelPartners,
  selectChannelPartners,
  selectChannelPartnersStatus
} from "../../redux/slices/Routetrackingslice.js";
import { selectToken, selectUser } from "../../redux/slices/authSlice";

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

export default function UpdateRouteModal({ route, onClose, channelPartners = [] }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const updateStatus = useSelector(selectUpdateStatus);
  const error = useSelector(selectRouteError);
  
  const fetchedChannelPartners = useSelector(selectChannelPartners);
  const cpStatus = useSelector(selectChannelPartnersStatus);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const tileLayerRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const dropdownRef = useRef(null);

  const [mapStyle, setMapStyle] = useState("street");
  const [coords, setCoords] = useState([]);
  const [form, setForm] = useState({
    routeName: "",
    channelPartnerId: "",
    plannedDistance: "",
    estimatedDuration: "",
  });
  const [step, setStep] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load existing route data
  useEffect(() => {
    if (route) {
      console.log("Loading route for edit:", route);
      setForm({
        routeName: route.routeName || "",
        channelPartnerId: route.channelPartnerId || route.assignedTo || "",
        plannedDistance: route.plannedDistance?.toString() || "",
        estimatedDuration: route.estimatedDuration?.toString() || "",
      });
      if (route.routePath?.coordinates) {
        setCoords(route.routePath.coordinates);
      }
    }
  }, [route]);

  // Fetch channel partners
  useEffect(() => {
    if (token) {
      dispatch(fetchChannelPartners());
    }
  }, [token, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || !step || step !== "draw") return;
    
    const L = window.L;
    
    // Remove existing map if any
    if (leafletMap.current) {
      leafletMap.current.remove();
      leafletMap.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [12.9716, 77.5946],
      14
    );

    const styleConfig = MAP_STYLES.street;
    tileLayerRef.current = L.tileLayer(styleConfig.url, {
      attribution: styleConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    // Draw existing route if available
    if (coords.length > 0) {
      redrawPath(map, coords);
      const latLngs = coords.map(([lng, lat]) => [lat, lng]);
      if (latLngs.length > 0) {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
      }
    }

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setCoords((prev) => {
        const updated = [...prev, [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))]];
        redrawPath(map, updated);
        return updated;
      });
    });

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [step]);

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

  const redrawPath = (map, points) => {
    const L = window.L;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    if (points.length === 0) return;

    const latLngs = points.map(([lng, lat]) => [lat, lng]);
    polylineRef.current = L.polyline(latLngs, {
      color: "#4f46e5",
      weight: 4,
      opacity: 0.9,
    }).addTo(map);

    points.forEach(([lng, lat], i) => {
      const isStart = i === 0;
      const isEnd = i === points.length - 1 && points.length > 1;
      const color = isStart ? "#16a34a" : isEnd ? "#dc2626" : "#4f46e5";
      const label = isStart ? "S" : isEnd ? "E" : `${i + 1}`;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;border-radius:50%;
          background:${color};color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;
          border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);
        ">${label}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      markersRef.current.push(marker);
    });
  };

  const handleUndo = () => {
    setCoords((prev) => {
      const updated = prev.slice(0, -1);
      if (leafletMap.current) redrawPath(leafletMap.current, updated);
      return updated;
    });
  };

  const handleClear = () => {
    setCoords([]);
    if (leafletMap.current) redrawPath(leafletMap.current, []);
  };

  const getWardChairmanId = () => {
    if (!user) return null;
    return user.id || user._id || user.userId || user.chairmanId || user.wardChairmanId || user.sub;
  };

  const handleSubmit = () => {
    if (!form.routeName || !form.channelPartnerId || coords.length < 2) {
      alert("Please fill all required fields and add at least 2 waypoints");
      return;
    }

    const wardChairmanId = getWardChairmanId();
    if (!wardChairmanId) {
      alert("Cannot identify Ward Chairman. Please check your login session.");
      return;
    }

    const routeId = route._id || route.id || route.routeId;
    
    // FIXED: routeId is now in the payload body (not URL)
    const payload = {
      routeId: routeId,
      wardChairmanId: wardChairmanId,
      channelPartnerId: form.channelPartnerId,
      routeName: form.routeName,
      routePath: { 
        type: "LineString", 
        coordinates: coords 
      },
      plannedDistance: parseFloat(form.plannedDistance) || 0,
      estimatedDuration: parseInt(form.estimatedDuration) || 0,
    };

    console.log("📤 Updating route:", payload);
    
    dispatch(updateRoute({ payload, token }));
  };

  useEffect(() => {
    if (updateStatus === "succeeded") {
      console.log("✅ Route updated successfully");
      dispatch(resetUpdateStatus());
      onClose(true);
    }
  }, [updateStatus, dispatch, onClose]);

  useEffect(() => {
    if (updateStatus === "failed" && error) {
      console.error("❌ Update failed:", error);
    }
  }, [updateStatus, error]);

  const isLoading = updateStatus === "loading";

  // Filter channel partners
  const allPartners = channelPartners.length > 0 ? channelPartners : fetchedChannelPartners;
  
  const filteredPartners = allPartners.filter(cp => {
    const name = cp.name || cp.fullName || cp.email || "";
    const email = cp.email || "";
    const mobile = cp.mobileNumber || "";
    const search = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(search) ||
           email.toLowerCase().includes(search) ||
           mobile.includes(search);
  });

  const selectedPartner = allPartners.find(
    cp => (cp.userId || cp.id || cp._id) === form.channelPartnerId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-amber-600 uppercase tracking-wider">
              Edit Route
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">Update Route Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Modify route name, reassign partner, or adjust the path
            </p>
          </div>
          <button 
            onClick={() => onClose()} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex items-center gap-0 px-6 py-4 bg-gray-50 border-b border-gray-100">
          <button
            onClick={() => setStep("details")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step === "details" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Route Details
          </button>
          <div className="w-8 h-px bg-gray-300 mx-2" />
          <button
            onClick={() => setStep("draw")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step === "draw" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Edit Path
          </button>
        </div>

        {/* Step 1: Details */}
        {step === "details" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Route Name *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="e.g. Ward 48 Morning Survey Route"
                  value={form.routeName}
                  onChange={(e) => setForm((f) => ({ ...f, routeName: e.target.value }))}
                />
              </div>

              {/* Channel Partner Dropdown */}
              <div className="md:col-span-2" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assign to Channel Partner *
                </label>
                
                <div className="relative">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between gap-2 w-full px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors min-h-[42px]"
                  >
                    {selectedPartner ? (
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(selectedPartner.name || selectedPartner.fullName || "CP").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {selectedPartner.name || selectedPartner.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{selectedPartner.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {cpStatus === "loading" ? "Loading partners..." : "Select a Channel Partner"}
                      </span>
                    )}
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                            placeholder="Search by name, email or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {filteredPartners.length === 0 ? (
                          <div className="flex flex-col items-center py-8 text-gray-400">
                            <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                            <p className="text-sm font-medium">No partners found</p>
                          </div>
                        ) : (
                          filteredPartners.map((cp) => {
                            const cpId = cp.userId || cp.id || cp._id;
                            const isSelected = cpId === form.channelPartnerId;
                            
                            return (
                              <div
                                key={cpId}
                                onClick={() => {
                                  setForm((f) => ({ ...f, channelPartnerId: cpId }));
                                  setIsDropdownOpen(false);
                                  setSearchTerm("");
                                }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                  isSelected ? "bg-indigo-50" : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {(cp.name || cp.fullName || cp.email || "CP").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {cp.name || cp.fullName || "Unnamed Partner"}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {cp.email}
                                    {cp.mobileNumber && ` • ${cp.mobileNumber}`}
                                  </p>
                                  {cp.businessLocation && (
                                    <p className="text-xs text-gray-400 mt-0.5">📍 {cp.businessLocation}</p>
                                  )}
                                </div>
                                {isSelected && (
                                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                  </svg>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Planned Distance (meters)
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  type="number"
                  placeholder="e.g. 2500"
                  value={form.plannedDistance}
                  onChange={(e) => setForm((f) => ({ ...f, plannedDistance: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Estimated Duration (minutes)
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  type="number"
                  placeholder="e.g. 45"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
                />
              </div>
            </div>

            {/* Route Path Summary */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Route Path</span>
                <span className="text-sm text-gray-500 ml-2">
                  {coords.length} waypoints · LineString
                </span>
              </div>
              <button
                onClick={() => setStep("draw")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                ✏️ Edit on Map
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !form.routeName || !form.channelPartnerId}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Route"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Map */}
        {step === "draw" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click on the map to add waypoints. First point = Start, Last point = End.
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
              <div ref={mapRef} className="w-full h-96 rounded-lg border border-gray-200" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <span className="font-medium">{coords.length}</span> waypoint{coords.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={coords.length === 0}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ↩ Undo
                </button>
                <button
                  onClick={handleClear}
                  disabled={coords.length === 0}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => setStep("details")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Details
              </button>
              <button
                onClick={() => setStep("details")}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Path →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}