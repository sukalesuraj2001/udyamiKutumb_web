import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// ── Import thunk + selectors from slice ──
import {
  fetchWardMap,
  clearWardMap,
  selectWardGeoJson,
  selectWardLoading,
  selectWardError,
} from "../redux/slices/wardMapSlice.js"; // ← adjust to your store path

import {
  MapPin, Search, X, ArrowLeft,
  Building2, Phone, Hash, User,
} from "lucide-react";
import GlobeIntro from "./memberMap/GlobeIntro.jsx";
import SatelliteMap from "./memberMap/SatelliteMap.jsx";

export default function MemberMap() {
  const dispatch = useDispatch();

  // ── Redux state ──
  const geoJson  = useSelector(selectWardGeoJson);
  const loading  = useSelector(selectWardLoading);
  const error    = useSelector(selectWardError);

  // ── Local UI state only ──
  const [wardInput, setWardInput]               = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [phase, setPhase]                       = useState("idle");

  // ── Derived ──
  const polygon = geoJson
    ? geoJson.features.find(
        (f) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
      )
    : null;

  const businesses = geoJson
    ? geoJson.features.filter((f) => f.geometry.type === "Point")
    : [];

  const wardCenter = (() => {
    if (!polygon) return null;
    const coords =
      polygon.geometry.type === "Polygon"
        ? polygon.geometry.coordinates[0]
        : polygon.geometry.coordinates[0][0];
    const lats = coords.map(([, lat]) => lat);
    const lngs = coords.map(([lng]) => lng);
    return {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      name: `Ward ${polygon.properties?.ward || wardInput}`,
    };
  })();

  // ── Handlers ──
  const handleFetch = () => {
    const trimmed = wardInput.trim();
    if (!trimmed) return;
    setSelectedBusiness(null);
    setPhase("idle");

    dispatch(fetchWardMap(trimmed))
      .unwrap()
      .then(() => setPhase("flying"))
      .catch(() => setPhase("idle"));
  };

  const handleReset = () => {
    dispatch(clearWardMap());
    setSelectedBusiness(null);
    setPhase("idle");
    setWardInput("");
  };

  const handleBackToSearch = () => {
    setPhase("idle");
    setSelectedBusiness(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0 h-[calc(100vh-140px)] -m-6">
      {/* ── Sidebar ── */}
      <div className="border-r border-hairline bg-white overflow-y-auto flex flex-col">

        <div className="p-5 border-b border-hairline">
          <h1 className="flex items-center gap-2 font-display text-[20px] text-ink">
            <MapPin size={18} className="text-amber" /> Member Map
          </h1>
          <p className="text-[12.5px] text-muted mt-0.5">
            Search a ward to view boundaries & businesses
          </p>
        </div>

        <div className="p-5 border-b border-hairline">
          <label className="text-[11px] font-semibold tracking-wide uppercase text-muted mb-1.5 block">
            Ward Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5 flex-1">
              <Search size={14} className="text-muted shrink-0" />
              <input
                value={wardInput}
                onChange={(e) => setWardInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="e.g. 5"
                className="w-full text-[13px] text-ink placeholder:text-muted focus:outline-none"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading || !wardInput.trim()}
              className="bg-ink text-white text-[13px] font-semibold px-4 rounded-xl disabled:opacity-40 hover:bg-ink/80 transition-colors shrink-0"
            >
              {loading ? "…" : "Go"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-[12px] text-brick bg-brick/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {geoJson && polygon && (
          <div className="p-5 border-b border-hairline space-y-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">
                Ward {polygon.properties?.ward}
              </p>
              <p className="text-[11.5px] text-muted">
                Area: {(polygon.properties?.area_sqm / 1_000_000).toFixed(2)} km²
                &nbsp;·&nbsp;
                Perimeter: {(polygon.properties?.perimeter_m / 1000).toFixed(2)} km
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-hairline rounded-xl p-3 text-center">
                <p className="text-[22px] font-display font-semibold text-ink">
                  {businesses.length}
                </p>
                <p className="text-[11px] text-muted">Businesses</p>
              </div>
              <div className="border border-hairline rounded-xl p-3 text-center">
                <p className={`text-[16px] font-display font-semibold ${phase === "arrived" ? "text-forest" : "text-amber"}`}>
                  {phase === "arrived" ? "Live ✓" : "Loading…"}
                </p>
                <p className="text-[11px] text-muted">Map View</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 border border-hairline rounded-xl py-2 text-[12.5px] font-semibold text-muted hover:text-ink hover:border-ink/30 transition-colors"
            >
              <X size={13} /> Clear & Reset
            </button>
          </div>
        )}

        {businesses.length > 0 && (
          <div className="p-5 flex-1 overflow-y-auto">
            <p className="text-[11px] font-semibold tracking-wide uppercase text-muted mb-3">
              Businesses in Ward
            </p>
            <div className="space-y-2">
              {businesses.map((b, i) => (
                <button
                  key={b.properties.memberId || i}
                  onClick={() => setSelectedBusiness(b.properties)}
                  className={`w-full text-left border rounded-xl p-3 transition-colors ${
                    selectedBusiness?.memberId === b.properties.memberId
                      ? "border-amber bg-amber/5"
                      : "border-hairline hover:border-ink/20 hover:bg-ink/[0.02]"
                  }`}
                >
                  <p className="text-[13px] font-semibold text-ink truncate">
                    {b.properties.businessName}
                  </p>
                  <p className="text-[11.5px] text-muted mt-0.5">
                    {b.properties.ownerName} · {b.properties.mobile}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedBusiness && (
          <div className="p-5 border-t border-hairline bg-amber/5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-[13px] font-semibold text-ink leading-tight">
                {selectedBusiness.businessName}
              </p>
              <button onClick={() => setSelectedBusiness(null)} className="text-muted hover:text-ink shrink-0">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <DetailRow icon={User}      label="Owner"      value={selectedBusiness.ownerName} />
              <DetailRow icon={Phone}     label="Mobile"     value={selectedBusiness.mobile} />
              <DetailRow icon={Hash}      label="Membership" value={selectedBusiness.membershipNumber} />
              <DetailRow icon={Building2} label="Member ID"  value={selectedBusiness.memberId?.slice(0, 8) + "…"} />
            </div>
          </div>
        )}
      </div>

      {/* ── Map Area ── */}
      <div className="relative overflow-hidden bg-[#0B0F1A]">
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{
            opacity: phase === "arrived" ? 0 : 1,
            pointerEvents: phase === "arrived" ? "none" : "auto",
          }}
        >
          <GlobeIntro
            flyToLocation={phase === "flying" && wardCenter ? wardCenter : null}
            wardPolygon={polygon}
            onArrived={() => setPhase("arrived")}
          />
        </div>

        {phase === "arrived" && wardCenter && (
          <div className="absolute inset-0 animate-[fadeIn_1000ms_ease-out]">
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-1.5 bg-ink/90 backdrop-blur text-white rounded-xl px-3 py-2.5 text-[12.5px] font-semibold hover:bg-ink transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="bg-ink/90 backdrop-blur text-white rounded-xl px-4 py-2.5 text-[12.5px]">
                <p className="font-semibold">
                  Ward {polygon?.properties?.ward} · {businesses.length} businesses
                </p>
                <p className="text-white/60 text-[11px]">
                  LGD: {polygon?.properties?.lgd_code}
                </p>
              </div>
            </div>

            <SatelliteMap
              location={wardCenter}
              wardPolygon={polygon}
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={setSelectedBusiness}
              onZoomOutToGlobe={handleBackToSearch}
            />
          </div>
        )}

        {phase === "idle" && !geoJson && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 pointer-events-none">
            <MapPin size={32} className="opacity-30" />
            <p className="text-[14px]">Enter a ward number to begin</p>
          </div>
        )}

        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="text-muted shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10.5px] text-muted">{label}</p>
        <p className="text-[12.5px] text-ink font-medium truncate">{value}</p>
      </div>
    </div>
  );
}