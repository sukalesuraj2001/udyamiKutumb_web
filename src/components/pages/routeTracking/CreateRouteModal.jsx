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

// ── Debounce hook for search ──────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Fetch road-snapped route via OSRM (free, no API key) ─────────────────────
async function fetchRoadPath(waypoints) {
  // waypoints: [[lng, lat], [lng, lat], ...]
  if (waypoints.length < 2) return waypoints;
  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates; // [[lng,lat],...]
    }
  } catch (e) {
    console.warn("OSRM routing failed, falling back to straight line", e);
  }
  return waypoints; // fallback: straight line
}

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
  const polylineRef = useRef(null);        // road-snapped display polyline
  const markersRef = useRef([]);           // click-point markers
  const locationMarkerRef = useRef(null);  // current-location blue dot
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // coords = raw click waypoints [[lng,lat],...]
  const [coords, setCoords] = useState([]);
  // roadCoords = OSRM-snapped path [[lng,lat],...] used for display + payload
  const [roadCoords, setRoadCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const accuracyCircleRef = useRef(null);

  const [form, setForm] = useState({
    routeName: "",
    channelPartnerId: "",
    plannedDistance: "",
    estimatedDuration: "",
  });
  const [step, setStep] = useState("draw");

  // CP dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Map search
  const [mapSearch, setMapSearch] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [showMapResults, setShowMapResults] = useState(false);
  const [mapSearchMarker, setMapSearchMarker] = useState(null);
  const debouncedMapSearch = useDebounce(mapSearch, 400);

  // ── Fetch channel partners ────────────────────────────────────────────────
  useEffect(() => {
    if (token) dispatch(fetchChannelPartners());
  }, [token, dispatch]);

  // ── Close CP dropdown outside click ──────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Close map search dropdown outside click ───────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowMapResults(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [12.9716, 77.5946], 14
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    // ── Map click → add waypoint ──────────────────────────────────────────
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const newPoint = [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))];
      setCoords((prev) => {
        const updated = [...prev, newPoint];
        drawWaypointMarkers(map, updated);
        return updated;
      });
    });

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // ── Re-fetch road path whenever coords change ─────────────────────────────
  useEffect(() => {
    if (coords.length < 2) {
      setRoadCoords(coords);
      if (polylineRef.current) {
        polylineRef.current.forEach?.((l) => l.remove());
        polylineRef.current = null;
      }
      return;
    }
    const map = leafletMap.current;
    if (!map) return;

    setRouteLoading(true);
    fetchRoadPath(coords).then((snapped) => {
      setRoadCoords(snapped);
      drawRoadPolyline(map, snapped);
      setRouteLoading(false);
    });
  }, [coords]);

  // ── Draw road-snapped polyline (white outline + indigo fill) ─────────────
  const drawRoadPolyline = (map, points) => {
    const L = window.L;
    // Remove old polylines
    if (polylineRef.current) {
      if (Array.isArray(polylineRef.current)) {
        polylineRef.current.forEach((l) => l.remove());
      } else {
        polylineRef.current.remove();
      }
    }
    if (points.length < 2) { polylineRef.current = null; return; }

    const latLngs = points.map(([lng, lat]) => [lat, lng]);
    const outline = L.polyline(latLngs, {
      color: "#fff", weight: 8, opacity: 1, lineCap: "round", lineJoin: "round",
    }).addTo(map);
    const fill = L.polyline(latLngs, {
      color: "#4f46e5", weight: 5, opacity: 0.95, lineCap: "round", lineJoin: "round",
    }).addTo(map);
    polylineRef.current = [outline, fill];
  };

  // ── Draw click-point markers (S, 2, 3 … E) ───────────────────────────────
  const drawWaypointMarkers = (map, points) => {
    const L = window.L;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (points.length === 0) return;

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
      markersRef.current.push(L.marker([lat, lng], { icon }).addTo(map));
    });
  };

  // ── My Location button handler ────────────────────────────────────────────
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    const map = leafletMap.current;
    const L = window.L;
    if (!map || !L) return;

    setLocating(true);

    // watchPosition — waits for a FRESH GPS fix (not cached).
    // We stop watching as soon as we get the first accurate reading.
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("📍 Location fix:", { latitude, longitude, accuracy });

        // Keep waiting if accuracy is too poor (>200m = likely cached/IP fix)
        if (accuracy > 200) {
          console.warn(`Accuracy too low (${accuracy}m), waiting for better fix…`);
          return;
        }

        // Got a good fix — stop watching
        navigator.geolocation.clearWatch(watchId);

        // Remove old marker + circle
        if (locationMarkerRef.current) {
          locationMarkerRef.current.remove();
          locationMarkerRef.current = null;
        }
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.remove();
          accuracyCircleRef.current = null;
        }

        map.flyTo([latitude, longitude], 17, { duration: 1.2 });

        const dot = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:20px;height:20px;">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:rgba(66,133,244,0.25);
                animation:rt-pulse 1.8s ease-out infinite;
              "></div>
              <div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:14px;height:14px;border-radius:50%;
                background:#4285F4;border:2px solid #fff;
                box-shadow:0 2px 6px rgba(0,0,0,0.3);
              "></div>
            </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        locationMarkerRef.current = L.marker([latitude, longitude], { icon: dot, zIndexOffset: 500 })
          .addTo(map)
          .bindTooltip(`Your location (±${Math.round(accuracy)}m)`, { permanent: false });

        accuracyCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy,
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);

        setLocating(false);
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        setLocating(false);
        if (err.code === 1) {
          alert("Location access denied. Please allow location permission in your browser and try again.");
        } else if (err.code === 2) {
          alert("Location unavailable. Please check your device GPS / network and try again.");
        } else {
          alert("Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // maximumAge:0 = never use cached
    );

    // Safety: stop watching after 15s regardless
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      setLocating(false);
    }, 15000);
  };

  const handleUndo = () => {
    setCoords((prev) => {
      const updated = prev.slice(0, -1);
      drawWaypointMarkers(leafletMap.current, updated);
      return updated;
    });
  };

  const handleClear = () => {
    setCoords([]);
    setRoadCoords([]);
    drawWaypointMarkers(leafletMap.current, []);
    if (polylineRef.current) {
      if (Array.isArray(polylineRef.current)) polylineRef.current.forEach((l) => l.remove());
      else polylineRef.current.remove();
      polylineRef.current = null;
    }
  };

  // ── Nominatim map search ──────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedMapSearch || debouncedMapSearch.length < 3) {
      setMapSearchResults([]);
      setShowMapResults(false);
      return;
    }
    setMapSearchLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedMapSearch)}&limit=5&countrycodes=in`,
      { headers: { "Accept-Language": "en" } }
    )
      .then((r) => r.json())
      .then((data) => { setMapSearchResults(data); setShowMapResults(true); })
      .catch(() => setMapSearchResults([]))
      .finally(() => setMapSearchLoading(false));
  }, [debouncedMapSearch]);

  const handleMapSearchSelect = (result) => {
    const map = leafletMap.current;
    const L = window.L;
    if (!map || !L) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (mapSearchMarker) mapSearchMarker.remove();

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="
          background:#ef4444;color:#fff;padding:4px 10px;
          border-radius:8px;font-size:12px;font-weight:600;
          white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          border:2px solid #fff;
        ">${result.display_name.split(",")[0]}</div>`,
        iconAnchor: [0, 0],
      }),
    }).addTo(map).bindPopup(result.display_name, { maxWidth: 260 }).openPopup();

    setMapSearchMarker(marker);
    map.flyTo([lat, lng], 16, { duration: 1.2 });
    setMapSearch(result.display_name.split(",")[0]);
    setShowMapResults(false);
  };

  const clearMapSearch = () => {
    setMapSearch("");
    setMapSearchResults([]);
    setShowMapResults(false);
    if (mapSearchMarker) { mapSearchMarker.remove(); setMapSearchMarker(null); }
  };

  // ── Ward Chairman ID ──────────────────────────────────────────────────────
  const getWardChairmanId = () => {
    if (!user) return null;
    return user.id || user._id || user.userId || user.chairmanId || user.wardChairmanId || user.sub || null;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.routeName || !form.channelPartnerId || coords.length < 2) return;
    const wardChairmanId = getWardChairmanId();
    if (!wardChairmanId) {
      alert("Cannot identify Ward Chairman. Please check your login session.");
      return;
    }

    // Use road-snapped coords for payload (falls back to straight-line if OSRM failed)
    const pathCoords = roadCoords.length >= 2 ? roadCoords : coords;

    const payload = {
      wardChairmanId,
      channelPartnerId: form.channelPartnerId,
      routeName: form.routeName,
      routePath: { type: "LineString", coordinates: pathCoords },
      plannedDistance: parseFloat(form.plannedDistance) || 0,
      estimatedDuration: parseInt(form.estimatedDuration) || 0,
    };

    console.log("📤 Submitting route payload:", JSON.stringify(payload, null, 2));
    dispatch(createRoute({ payload, token }));
  };

  useEffect(() => {
    if (createStatus === "succeeded") { dispatch(resetCreateStatus()); onClose(true); }
  }, [createStatus, dispatch, onClose]);

  const isLoading = createStatus === "loading";

  // ── Channel partner filter ────────────────────────────────────────────────
  const allPartners = channelPartners.length > 0 ? channelPartners : fetchedChannelPartners;
  const filteredPartners = allPartners.filter((cp) => {
    const search = searchTerm.toLowerCase();
    return (
      (cp.name || cp.fullName || "").toLowerCase().includes(search) ||
      (cp.email || "").toLowerCase().includes(search) ||
      (cp.mobileNumber || "").includes(search)
    );
  });
  const selectedPartner = allPartners.find(
    (cp) => (cp.userId || cp.id || cp._id) === form.channelPartnerId
  );

  // ── Render ────────────────────────────────────────────────────────────────
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
          <button className={`rt-step-btn ${step === "draw" ? "active" : ""}`} onClick={() => setStep("draw")}>
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

        {/* ── Step 1: Map ───────────────────────────────────────────────── */}
        {step === "draw" && (
          <div className="rt-map-section">
            <div className="rt-map-hint">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click on the map to add waypoints. Route will follow actual roads automatically.
            </div>

            {/* Map wrapper — position:relative so search box can float over it */}
            <div style={{ position: "relative" }}>

              {/* ── Search box (floats over map) ─────────────────────────── */}
              <div
                ref={searchRef}
                style={{
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                  width: "min(340px, calc(100% - 24px))",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: showMapResults && mapSearchResults.length > 0 ? "10px 10px 0 0" : 10,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                  padding: "7px 11px",
                  gap: 8,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#5f6368" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={mapSearch}
                    onChange={(e) => setMapSearch(e.target.value)}
                    onFocus={() => mapSearchResults.length > 0 && setShowMapResults(true)}
                    placeholder="Search location on map…"
                    style={{
                      flex: 1, border: "none", outline: "none",
                      fontSize: 13, color: "#202124", background: "transparent",
                    }}
                  />
                  {mapSearchLoading && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2"
                      style={{ flexShrink: 0, animation: "rt-spin 0.8s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4"/>
                    </svg>
                  )}
                  {mapSearch && !mapSearchLoading && (
                    <button onClick={clearMapSearch}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6"
                        strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>

                {showMapResults && mapSearchResults.length > 0 && (
                  <div style={{
                    background: "#fff",
                    borderRadius: "0 0 10px 10px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                    overflow: "hidden",
                    borderTop: "1px solid #f1f3f4",
                  }}>
                    {mapSearchResults.map((r, i) => {
                      const name = r.display_name.split(",")[0];
                      const detail = r.display_name.split(",").slice(1, 3).join(",").trim();
                      return (
                        <button key={i} onClick={() => handleMapSearchSelect(r)}
                          style={{
                            width: "100%", display: "flex", alignItems: "flex-start",
                            gap: 9, padding: "9px 13px", background: "none",
                            border: "none", cursor: "pointer", textAlign: "left",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fa"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ flexShrink: 0, marginTop: 2 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
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

                {showMapResults && !mapSearchLoading && mapSearchResults.length === 0 && mapSearch.length >= 3 && (
                  <div style={{
                    background: "#fff", borderRadius: "0 0 10px 10px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                    padding: "12px 14px", fontSize: 13, color: "#5f6368",
                    borderTop: "1px solid #f1f3f4",
                  }}>
                    No results for "{mapSearch}"
                  </div>
                )}
              </div>

              {/* Leaflet map */}
              <div ref={mapRef} className="rt-leaflet-map" />

              {/* My Location button — bottom-right of map */}
              <button
                onClick={handleMyLocation}
                disabled={locating}
                title="Go to my location"
                style={{
                  position: "absolute",
                  bottom: 48,
                  right: 10,
                  zIndex: 1000,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "#fff",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  cursor: locating ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  opacity: locating ? 0.7 : 1,
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => { if (!locating) e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)"; }}
              >
                {locating ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2.5"
                    style={{ animation: "rt-spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    <path d="M12 5a7 7 0 1 0 7 7"/>
                  </svg>
                )}
              </button>

              {/* Road routing loading badge */}
              {routeLoading && (
                <div style={{
                  position: "absolute", bottom: 10, left: "50%",
                  transform: "translateX(-50%)", zIndex: 1000,
                  background: "#fff", borderRadius: 20,
                  padding: "5px 14px", fontSize: 12, fontWeight: 600,
                  color: "#4f46e5", boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5"
                    style={{ animation: "rt-spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Snapping to road…
                </div>
              )}
            </div>

            <div className="rt-map-controls">
              <span className="rt-waypoint-count">{coords.length} waypoint{coords.length !== 1 ? "s" : ""}</span>
              <button className="rt-btn-ghost" onClick={handleUndo} disabled={coords.length === 0}>↩ Undo</button>
              <button className="rt-btn-ghost rt-btn-red" onClick={handleClear} disabled={coords.length === 0}>Clear</button>
              <button className="rt-btn-primary" onClick={() => setStep("details")} disabled={coords.length < 2}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Details ───────────────────────────────────────────── */}
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
                  <div className="rt-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    {selectedPartner ? (
                      <div className="rt-selected-partner">
                        <div className="rt-partner-avatar">
                          {(selectedPartner.name || selectedPartner.fullName || "CP").charAt(0).toUpperCase()}
                        </div>
                        <div className="rt-partner-info">
                          <span className="rt-partner-name">{selectedPartner.name || selectedPartner.fullName}</span>
                          <span className="rt-partner-email">{selectedPartner.email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="rt-select-placeholder">
                        {cpStatus === "loading" ? "Loading partners..." : "Select a Channel Partner"}
                      </span>
                    )}
                    <svg className={`rt-select-arrow ${isDropdownOpen ? "open" : ""}`}
                      width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {isDropdownOpen && (
                    <div className="rt-select-dropdown">
                      <div className="rt-search-wrapper">
                        <svg className="rt-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                            </svg>
                            <p>No channel partners found</p>
                            <span>Try a different search term</span>
                          </div>
                        ) : (
                          filteredPartners.map((cp) => {
                            const cpId = cp.userId || cp.id || cp._id;
                            const isSelected = cpId === form.channelPartnerId;
                            return (
                              <div key={cpId}
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
                                  <span className="rt-option-name">{cp.name || cp.fullName || "Unnamed Partner"}</span>
                                  <span className="rt-option-details">
                                    {cp.email && cp.email}
                                    {cp.mobileNumber && ` • ${cp.mobileNumber}`}
                                  </span>
                                  {cp.businessLocation && (
                                    <span className="rt-option-location">📍 {cp.businessLocation}</span>
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
                  className="rt-input" type="number" placeholder="e.g. 2500"
                  value={form.plannedDistance}
                  onChange={(e) => setForm((f) => ({ ...f, plannedDistance: e.target.value }))}
                />
              </div>

              <div className="rt-form-group">
                <label className="rt-label">Estimated Duration (minutes)</label>
                <input
                  className="rt-input" type="number" placeholder="e.g. 45"
                  value={form.estimatedDuration}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
                />
              </div>
            </div>

            <div className="rt-path-summary">
              <span className="rt-path-label">Route path</span>
              <span className="rt-path-val">
                {coords.length} waypoints · {roadCoords.length} road points · LineString
              </span>
              <button className="rt-btn-ghost rt-btn-sm" onClick={() => setStep("draw")}>✏ Edit map</button>
            </div>

            {error && <p className="rt-error">{error}</p>}

            <div className="rt-modal-footer">
              <button className="rt-btn-ghost" onClick={() => onClose()}>Cancel</button>
              <button
                className="rt-btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || !form.routeName || !form.channelPartnerId || !getWardChairmanId()}
              >
                {isLoading ? <span className="rt-spinner" /> : "Create & Assign Route"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rt-spin { to { transform: rotate(360deg); } }
        @keyframes rt-pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}