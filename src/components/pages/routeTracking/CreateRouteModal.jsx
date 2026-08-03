import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  createRoute, 
  resetCreateStatus, 
  selectCreateStatus, 
  selectRouteError,
  fetchChannelPartners,
  selectChannelPartners,
  selectChannelPartnersStatus
} from "../../redux/slices/Routetrackingslice.js";
import { selectToken, selectUser } from "../../redux/slices/authSlice";

export default function CreateRouteModal({ onClose, channelPartners = [] }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const createStatus = useSelector(selectCreateStatus);
  const error = useSelector(selectRouteError);
  
  const fetchedChannelPartners = useSelector(selectChannelPartners);
  const cpStatus = useSelector(selectChannelPartnersStatus);

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const dropdownRef = useRef(null);

  const [coords, setCoords] = useState([]);
  const [form, setForm] = useState({
    routeName: "",
    channelPartnerId: "",
    plannedDistance: "",
    estimatedDuration: "",
  });
  const [step, setStep] = useState("draw");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ── Fetch channel partners on mount ──────────────────────────────────────
  useEffect(() => {
    if (token) {
      dispatch(fetchChannelPartners());
    }
  }, [token, dispatch]);

  // ── Debug user object ────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      console.log("CreateRouteModal - User object:", user);
      console.log("User keys:", Object.keys(user));
      
      // Try to find the ID
      const possibleId = user.id || user._id || user.userId || user.chairmanId || user.wardChairmanId;
      console.log("Extracted ID:", possibleId);
      
      if (!possibleId) {
        console.error("⚠️ Cannot find ward chairman ID in user object!");
        console.error("Available fields:", Object.keys(user));
      }
    }
  }, [user]);

  // ── Close dropdown when clicking outside ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Init Leaflet ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [12.9716, 77.5946],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

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
  }, []);

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
      dashArray: null,
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
      redrawPath(leafletMap.current, updated);
      return updated;
    });
  };

  const handleClear = () => {
    setCoords([]);
    redrawPath(leafletMap.current, []);
  };

  // ── Helper to extract chairman ID ───────────────────────────────────────
  const getWardChairmanId = () => {
    if (!user) {
      console.error("No user object available");
      return null;
    }
    
    // Try all possible ID fields
    const chairmanId = 
      user.id || 
      user._id || 
      user.userId || 
      user.chairmanId || 
      user.wardChairmanId ||
      user.sub; // JWT token sometimes uses 'sub' for user ID
    
    if (!chairmanId) {
      console.error("Cannot find ward chairman ID. User object:", user);
      console.error("Available keys:", Object.keys(user));
    }
    
    return chairmanId;
  };

  const handleSubmit = () => {
    if (!form.routeName || !form.channelPartnerId || coords.length < 2) return;

    const wardChairmanId = getWardChairmanId();
    
    if (!wardChairmanId) {
      alert("Cannot identify Ward Chairman. Please check your login session.");
      console.error("Missing wardChairmanId");
      return;
    }

    const payload = {
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

    console.log("📤 Submitting route payload:", JSON.stringify(payload, null, 2));
    
    dispatch(createRoute({ payload, token }));
  };

  useEffect(() => {
    if (createStatus === "succeeded") {
      dispatch(resetCreateStatus());
      onClose(true);
    }
  }, [createStatus, dispatch, onClose]);

  useEffect(() => {
    if (createStatus === "failed" && error) {
      console.error("❌ Route creation failed:", error);
    }
  }, [createStatus, error]);

  const isLoading = createStatus === "loading";

  // ── Filter channel partners based on search ─────────────────────────────
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
    <div className="rt-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rt-modal">
        {/* Header */}
        <div className="rt-modal-header">
          <div>
            <p className="rt-modal-eyebrow">Route Management</p>
            <h2 className="rt-modal-title">Create & Assign Route</h2>
          </div>
          <button className="rt-modal-close" onClick={() => onClose()}>✕</button>
        </div>

        {/* Step tabs */}
        <div className="rt-steps">
          <button
            className={`rt-step-btn ${step === "draw" ? "active" : ""}`}
            onClick={() => setStep("draw")}
          >
            <span className="rt-step-num">1</span> Draw Route
          </button>
          <div className="rt-step-divider" />
          <button
            className={`rt-step-btn ${step === "details" ? "active" : ""} ${coords.length < 2 ? "disabled" : ""}`}
            onClick={() => coords.length >= 2 && setStep("details")}
          >
            <span className="rt-step-num">2</span> Route Details
          </button>
        </div>

        {/* Step 1: Map */}
        {step === "draw" && (
          <div className="rt-map-section">
            <div className="rt-map-hint">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click on the map to add waypoints. First point = Start, Last point = End.
            </div>
            <div ref={mapRef} className="rt-leaflet-map" />
            <div className="rt-map-controls">
              <span className="rt-waypoint-count">{coords.length} waypoint{coords.length !== 1 ? "s" : ""}</span>
              <button className="rt-btn-ghost" onClick={handleUndo} disabled={coords.length === 0}>
                ↩ Undo
              </button>
              <button className="rt-btn-ghost rt-btn-red" onClick={handleClear} disabled={coords.length === 0}>
                Clear
              </button>
              <button
                className="rt-btn-primary"
                onClick={() => setStep("details")}
                disabled={coords.length < 2}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === "details" && (
          <div className="rt-details-section">
            <div className="rt-form-grid">
              <div className="rt-form-group rt-span-2">
                <label className="rt-label">Route Name *</label>
                <input
                  className="rt-input"
                  placeholder="e.g. Ward 48 Morning Survey Route"
                  value={form.routeName}
                  onChange={(e) => setForm((f) => ({ ...f, routeName: e.target.value }))}
                />
              </div>

              {/* Searchable Channel Partner Dropdown */}
              <div className="rt-form-group rt-span-2" ref={dropdownRef}>
                <label className="rt-label">Assign to Channel Partner *</label>
                
                <div className="rt-custom-select">
                  <div 
                    className="rt-select-trigger"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedPartner ? (
                      <div className="rt-selected-partner">
                        <div className="rt-partner-avatar">
                          {(selectedPartner.name || selectedPartner.fullName || "CP").charAt(0).toUpperCase()}
                        </div>
                        <div className="rt-partner-info">
                          <span className="rt-partner-name">
                            {selectedPartner.name || selectedPartner.fullName}
                          </span>
                          <span className="rt-partner-email">{selectedPartner.email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="rt-select-placeholder">
                        {cpStatus === "loading" ? "Loading partners..." : "Select a Channel Partner"}
                      </span>
                    )}
                    <svg 
                      className={`rt-select-arrow ${isDropdownOpen ? "open" : ""}`}
                      width="20" 
                      height="20" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="rt-select-dropdown">
                      <div className="rt-search-wrapper">
                        <svg className="rt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          className="rt-search-input"
                          placeholder="Search by name, email or mobile..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>

                      <div className="rt-select-options">
                        {filteredPartners.length === 0 ? (
                          <div className="rt-no-results">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                            <p>No channel partners found</p>
                            <span>Try a different search term</span>
                          </div>
                        ) : (
                          filteredPartners.map((cp) => {
                            const cpId = cp.userId || cp.id || cp._id;
                            const isSelected = cpId === form.channelPartnerId;
                            
                            return (
                              <div
                                key={cpId}
                                className={`rt-select-option ${isSelected ? "selected" : ""}`}
                                onClick={() => {
                                  setForm((f) => ({ ...f, channelPartnerId: cpId }));
                                  setIsDropdownOpen(false);
                                  setSearchTerm("");
                                }}
                              >
                                <div className="rt-option-avatar">
                                  {(cp.name || cp.fullName || cp.email || "CP").charAt(0).toUpperCase()}
                                </div>
                                <div className="rt-option-info">
                                  <span className="rt-option-name">
                                    {cp.name || cp.fullName || "Unnamed Partner"}
                                  </span>
                                  <span className="rt-option-details">
                                    {cp.email && `${cp.email}`}
                                    {cp.mobileNumber && ` • ${cp.mobileNumber}`}
                                  </span>
                                  {cp.businessLocation && (
                                    <span className="rt-option-location">
                                      📍 {cp.businessLocation}
                                    </span>
                                  )}
                                </div>
                                {isSelected && (
                                  <svg className="rt-option-check" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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

                <input type="hidden" value={form.channelPartnerId} required />
              </div>

              <div className="rt-form-group">
                <label className="rt-label">Planned Distance (meters)</label>
                <input
                  className="rt-input"
                  type="number"
                  placeholder="e.g. 2500"
                  value={form.plannedDistance}
                  onChange={(e) => setForm((f) => ({ ...f, plannedDistance: e.target.value }))}
                />
              </div>

              <div className="rt-form-group">
                <label className="rt-label">Estimated Duration (minutes)</label>
                <input
                  className="rt-input"
                  type="number"
                  placeholder="e.g. 45"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
                />
              </div>
            </div>

            <div className="rt-path-summary">
              <span className="rt-path-label">Route path</span>
              <span className="rt-path-val">{coords.length} waypoints · LineString</span>
              <button className="rt-btn-ghost rt-btn-sm" onClick={() => setStep("draw")}>
                ✏ Edit map
              </button>
            </div>

            {/* Show wardChairmanId debug info */}
            {user && (
              <div style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                marginTop: '8px',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '6px',
                fontFamily: 'monospace'
              }}>
                Ward Chairman ID: {getWardChairmanId() || '⚠️ Not found'}
              </div>
            )}

            {error && <p className="rt-error">{error}</p>}

            <div className="rt-modal-footer">
              <button className="rt-btn-ghost" onClick={() => onClose()}>Cancel</button>
              <button
                className="rt-btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || !form.routeName || !form.channelPartnerId || !getWardChairmanId()}
              >
                {isLoading ? (
                  <span className="rt-spinner" />
                ) : (
                  "Create & Assign Route"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}