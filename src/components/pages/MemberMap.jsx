import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice.js";
import {
  fetchWardMap,
  clearWardMap,
  selectDistrictGeo,
  selectTalukaGeos,
  selectWardGeos,
  selectBusinesses,
  selectFetchType,
  selectWardLoading,
  selectWardError,
} from "../redux/slices/wardMapSlice.js";

import {
  MapPin, Search, X, ArrowLeft,
  Phone, Mail, Globe, Users, Calendar,
  Hash, FileText, IndianRupee, ChevronRight,
  MapPinned, Landmark, ChevronLeft, ExternalLink,
  Building2, Layers,
} from "lucide-react";
import GlobeIntro from "./memberMap/GlobeIntro.jsx";
import SatelliteMap from "./memberMap/SatelliteMap.jsx";

// ── Role resolution ──
function resolveRole(user) {
  const roleStr = (user?.role || "").toLowerCase();
  if (roleStr.includes("district")) return "district";
  if (roleStr.includes("taluk"))    return "taluka";
  return "ward";
}

function getLocationData() {
  try {
    return JSON.parse(localStorage.getItem("locationData")) || {};
  } catch {
    return {};
  }
}

function resolveLocationName(user, roleType) {
  const loc = getLocationData();
  if (roleType === "district") return loc.districtName || "";
  if (roleType === "taluka")   return loc.talukaName   || "";
  return loc.wardName || "";
}

export default function MemberMap() {
  const dispatch = useDispatch();

  const user        = useSelector(selectUser);
  const districtGeo = useSelector(selectDistrictGeo);
  const talukaGeos  = useSelector(selectTalukaGeos);
  const wardGeos    = useSelector(selectWardGeos);
  const businesses  = useSelector(selectBusinesses);
  const fetchType   = useSelector(selectFetchType);
  const loading     = useSelector(selectWardLoading);
  const error       = useSelector(selectWardError);

  const roleType     = resolveRole(user);
  const locationName = resolveLocationName(user, roleType);
  const isAutoRole   = roleType === "district" || roleType === "taluka";

  const [wardInput,        setWardInput]        = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [phase,            setPhase]            = useState("idle");
  const [imageIdx,         setImageIdx]         = useState(0);

  // ── Auto-fetch for district / taluka heads ──
  useEffect(() => {
    if (isAutoRole && locationName) {
      dispatch(fetchWardMap({ name: locationName, type: roleType }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    }
  }, [isAutoRole, locationName, roleType]);

  // ── Derived ──
  // For center calculation — use district > taluka > ward
  const primaryGeo = districtGeo || talukaGeos || wardGeos;

  const mapCenter = (() => {
    // Search all layers for a polygon — district > taluka > ward
    const candidates = [
      ...(districtGeo?.features || []),
      ...(talukaGeos?.features  || []),
      ...(wardGeos?.features    || []),
    ];
    const poly = candidates.find(
      (f) => f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon"
    );
    if (!poly) return null;

    // Handle both 2D [lng,lat] and 3D [lng,lat,alt] coordinate arrays
    const rawCoords =
      poly.geometry.type === "Polygon"
        ? poly.geometry.coordinates[0]
        : poly.geometry.coordinates[0][0];

    const lngs = rawCoords.map((c) => c[0]);
    const lats  = rawCoords.map((c) => c[1]);
    const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    if (!isFinite(lat) || !isFinite(lng)) return null;
    return { lat, lng, name: locationName || wardInput };
  })();

  const getBusinessImages = (props) => {
    const imgs = [];
    ["businessImage1", "businessImage2", "businessImage3"].forEach((key) => {
      if (props?.[key]?.image) imgs.push(props[key].image);
    });
    return imgs;
  };

  // ── Handlers ──
  const handleFetch = () => {
    const trimmed = wardInput.trim();
    if (!trimmed) return;
    setSelectedBusiness(null);
    setPhase("idle");
    setImageIdx(0);
    dispatch(fetchWardMap({ name: trimmed, type: roleType }))
      .unwrap()
      .then(() => setPhase("flying"))
      .catch(() => setPhase("idle"));
  };

  const handleReset = () => {
    dispatch(clearWardMap());
    setSelectedBusiness(null);
    setPhase("idle");
    setWardInput("");
    setImageIdx(0);
    // Re-fetch for auto-roles
    if (isAutoRole && locationName) {
      dispatch(fetchWardMap({ name: locationName, type: roleType }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    }
  };

  const handleSelectBusiness = (props) => {
    setSelectedBusiness(props);
    setImageIdx(0);
  };

  const handleBackToSearch = () => {
    setPhase(isAutoRole ? "arrived" : "idle");
    setSelectedBusiness(null);
  };

  // Stats summary
  const talukaCount  = talukaGeos?.features?.length || 0;
  const wardCount    = wardGeos?.features?.length   || 0;
  const bizCount     = businesses.length;

  // ── Sidebar ──
  const renderSidebar = () => {
    // DETAIL VIEW
    if (selectedBusiness) {
      const imgs   = getBusinessImages(selectedBusiness);
      const mobile  = selectedBusiness.businessMobile || selectedBusiness.mobile;
      const website = selectedBusiness.website?.replace(/^https?:\/\//, "");

      return (
        <>
          <div className="sticky top-0 z-10 bg-white border-b border-hairline px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSelectedBusiness(null)}
              className="w-8 h-8 rounded-xl bg-ink/[0.05] hover:bg-ink/10 flex items-center justify-center transition-colors shrink-0"
            >
              <ChevronLeft size={16} className="text-ink" />
            </button>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink truncate leading-tight">
                {selectedBusiness.businessName}
              </p>
              <p className="text-[11px] text-muted truncate">
                {selectedBusiness.businessType || selectedBusiness.sector || "Business"}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {imgs.length > 0 ? (
              <div className="relative h-48 bg-ink/10 overflow-hidden">
                <img src={imgs[imageIdx]} alt={selectedBusiness.businessName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {imgs.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {imgs.map((_, idx) => (
                      <button key={idx} onClick={() => setImageIdx(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === imageIdx ? "bg-white w-5" : "bg-white/50 w-1.5"}`} />
                    ))}
                  </div>
                )}
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImageIdx((p) => Math.max(0, p - 1))} disabled={imageIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-black/60">
                      <ChevronLeft size={15} className="text-white" />
                    </button>
                    <button onClick={() => setImageIdx((p) => Math.min(imgs.length - 1, p + 1))} disabled={imageIdx === imgs.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-black/60">
                      <ChevronRight size={15} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-28 bg-gradient-to-br from-amber/10 to-amber/5 flex items-center justify-center border-b border-hairline">
                <Building2 size={28} className="text-amber/40" />
              </div>
            )}

            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink leading-snug">{selectedBusiness.businessName}</h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedBusiness.businessType && <Chip color="amber">{selectedBusiness.businessType}</Chip>}
                  {selectedBusiness.sector && <Chip color="gray">{selectedBusiness.sector}</Chip>}
                </div>
              </div>

              {/* Action buttons */}
              {(mobile || selectedBusiness.email || website) && (
                <div className={`grid gap-2 ${[mobile, selectedBusiness.email, website].filter(Boolean).length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {mobile && <ActionBtn href={`tel:${mobile}`} icon={Phone} label="Call" color="green" />}
                  {selectedBusiness.email && <ActionBtn href={`mailto:${selectedBusiness.email}`} icon={Mail} label="Email" color="blue" />}
                  {website && <ActionBtn href={`https://${website}`} icon={Globe} label="Website" color="purple" external />}
                </div>
              )}

              <InfoCard label="Business Info">
                {selectedBusiness.ownerName && <InfoRow icon={Hash} label="Owner" value={selectedBusiness.ownerName} />}
                {mobile && <InfoRow icon={Phone} label="Mobile" value={mobile} mono />}
                {selectedBusiness.email && <InfoRow icon={Mail} label="Email" value={selectedBusiness.email} />}
                {selectedBusiness.address && <InfoRow icon={MapPin} label="Address" value={`${selectedBusiness.address}${selectedBusiness.city ? ", " + selectedBusiness.city : ""}`} />}
              </InfoCard>

              {(selectedBusiness.employees || selectedBusiness.establishedYear || selectedBusiness.annualTurnover) && (
                <InfoCard label="Stats">
                  {selectedBusiness.employees && <InfoRow icon={Users} label="Employees" value={selectedBusiness.employees} />}
                  {selectedBusiness.establishedYear && <InfoRow icon={Calendar} label="Est." value={selectedBusiness.establishedYear} />}
                  {selectedBusiness.annualTurnover && <InfoRow icon={IndianRupee} label="Annual Turnover" value={selectedBusiness.annualTurnover} />}
                </InfoCard>
              )}
            </div>
          </div>
        </>
      );
    }

    // MAIN SIDEBAR VIEW
    return (
      <>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-hairline">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink capitalize">{roleType} Map</p>
              {locationName && (
                <p className="text-[11px] text-muted truncate">{locationName}</p>
              )}
            </div>
          </div>

          {/* Search — only for ward heads */}
          {!isAutoRole && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  value={wardInput}
                  onChange={(e) => setWardInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                  placeholder="Enter ward name…"
                  className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-hairline rounded-xl focus:outline-none focus:border-blue-400 bg-ink/[0.02]"
                />
              </div>
              <button
                onClick={handleFetch}
                disabled={loading || !wardInput.trim()}
                className="px-3.5 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Go
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[12.5px] text-muted">Loading {roleType} boundaries…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[12px] text-red-600">
            {error}
          </div>
        )}

        {/* Stats cards — after data loaded */}
        {!loading && (districtGeo || talukaGeos || wardGeos) && (
          <div className="px-4 pt-4 pb-2">
            <div className={`grid gap-2 ${roleType === "district" ? "grid-cols-3" : "grid-cols-2"}`}>
              {roleType === "district" && (
                <StatCard icon={Landmark} value={talukaCount} label="Talukas" color="orange" />
              )}
              <StatCard icon={MapPinned} value={wardCount} label="Wards" color="green" />
              <StatCard icon={Building2} value={bizCount} label="Businesses" color="amber" />
            </div>

            {/* Layer legend strip */}
            <div className="mt-3 flex flex-wrap gap-2">
              {roleType === "district" && (
                <LegendPill color="#003366" label="District" />
              )}
              {(roleType === "district" || roleType === "taluka") && (
                <LegendPill color="#EA580C" label="Taluka" />
              )}
              <LegendPill color="#16A34A" label="Ward" />
            </div>
          </div>
        )}

        {/* Reset */}
        {!loading && (districtGeo || talukaGeos || wardGeos) && !isAutoRole && (
          <div className="px-4 pb-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[11.5px] text-muted hover:text-red-500 transition-colors"
            >
              <X size={12} /> Clear &amp; Reset
            </button>
          </div>
        )}

        {/* Business list */}
        {businesses.length > 0 && !loading && (
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-[10.5px] font-semibold tracking-widest uppercase text-muted mb-3">
              Businesses ({bizCount})
            </p>
            <div className="space-y-2">
              {businesses.map((b, i) => (
                <button
                  key={b.properties.profileId || i}
                  onClick={() => handleSelectBusiness(b.properties)}
                  className="w-full text-left border border-hairline rounded-xl p-3.5 transition-all hover:border-amber/50 hover:bg-amber/[0.03] hover:shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{b.properties.businessName}</p>
                      <p className="text-[11.5px] text-muted mt-0.5 truncate">
                        {b.properties.ownerName} · {b.properties.businessMobile || b.properties.mobile}
                      </p>
                      {b.properties.sector && (
                        <span className="inline-block mt-1.5 text-[10px] font-medium bg-ink/[0.06] text-ink/60 rounded-full px-2 py-0.5">
                          {b.properties.sector}
                        </span>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-muted/40 group-hover:text-amber shrink-0 mt-0.5 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {phase === "idle" && !districtGeo && !talukaGeos && !wardGeos && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ink/[0.04] flex items-center justify-center">
              <Search size={20} className="opacity-40" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink/50">No ward selected</p>
              <p className="text-[11.5px] text-muted mt-0.5">Search by name above</p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-140px)] -m-6">

      {/* Sidebar */}
      <div className="border-r border-hairline bg-white flex flex-col overflow-hidden">
        {renderSidebar()}
      </div>

      {/* Map */}
      <div className="relative overflow-hidden bg-[#0B0F1A]">
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{
            opacity: phase === "arrived" ? 0 : 1,
            pointerEvents: phase === "arrived" ? "none" : "auto",
          }}
        >
          <GlobeIntro
            flyToLocation={phase === "flying" && mapCenter ? mapCenter : null}
            wardPolygon={districtGeo?.features?.[0] || talukaGeos?.features?.[0] || wardGeos?.features?.[0] || null}
            onArrived={() => setPhase("arrived")}
          />
        </div>

        {phase === "arrived" && mapCenter && (
          <div className="absolute inset-0 animate-[fadeIn_1000ms_ease-out]">
            {/* Top bar */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
              {!isAutoRole && (
                <button
                  onClick={handleBackToSearch}
                  className="flex items-center gap-1.5 bg-ink/90 backdrop-blur text-white rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold hover:bg-ink transition-colors shadow-lg"
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <div className="bg-ink/90 backdrop-blur text-white rounded-xl px-4 py-2.5 text-[12.5px] shadow-lg">
                <p className="font-semibold capitalize">
                  {locationName || wardInput}
                  {roleType === "district" && talukaCount > 0 && ` · ${talukaCount} talukas`}
                  {wardCount > 0 && ` · ${wardCount} wards`}
                </p>
                <p className="text-white/55 text-[11px]">
                  {bizCount} business{bizCount !== 1 ? "es" : ""}
                </p>
              </div>
            </div>

            <SatelliteMap
              location={mapCenter}
              // Legacy prop
              wardPolygon={null}
              // Layered props
              districtGeo={districtGeo}
              talukaGeos={talukaGeos}
              wardGeos={wardGeos}
              fetchType={fetchType || roleType}
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
              onZoomOutToGlobe={!isAutoRole ? handleBackToSearch : undefined}
            />
          </div>
        )}

        {phase === "idle" && !districtGeo && !talukaGeos && !wardGeos && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 pointer-events-none select-none">
            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
              <MapPin size={28} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium">
                {isAutoRole ? "Loading your area…" : "Enter a ward to begin"}
              </p>
              <p className="text-[12px] mt-0.5 opacity-70">Name or number both work</p>
            </div>
          </div>
        )}

        <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Chip({ children, color = "gray" }) {
  const colors = {
    amber: "bg-amber/12 text-amber",
    gray: "bg-ink/[0.06] text-ink/55",
    green: "bg-forest/10 text-forest",
  };
  return (
    <span className={`inline-flex items-center text-[10.5px] font-medium rounded-full px-2.5 py-0.5 ${colors[color]}`}>
      {children}
    </span>
  );
}

function ActionBtn({ href, icon: Icon, label, color, external }) {
  const colors = {
    green: "bg-forest/10 text-forest hover:bg-forest/20",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    purple: "bg-violet-50 text-violet-600 hover:bg-violet-100",
  };
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}
      className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors ${colors[color]}`}>
      <Icon size={18} />
      <span className="text-[11px] font-semibold">{label}</span>
    </a>
  );
}

function InfoCard({ label, children }) {
  return (
    <div>
      {label && <p className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5 px-0.5">{label}</p>}
      <div className="bg-ink/[0.02] border border-hairline rounded-xl divide-y divide-hairline overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <div className="w-7 h-7 rounded-lg bg-ink/[0.05] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-[12.5px] text-ink font-medium mt-0.5 break-all leading-snug ${mono ? "font-mono text-[11.5px]" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  const colors = {
    orange: "text-orange-600 bg-orange-50",
    green: "text-green-700 bg-green-50",
    amber: "text-amber-700 bg-amber-50",
  };
  return (
    <div className="border border-hairline rounded-xl p-3 bg-ink/[0.015]">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1.5 ${colors[color]}`}>
        <Icon size={12} />
      </div>
      <p className="text-[15px] font-semibold text-ink">{value}</p>
      <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
    </div>
  );
}

function LegendPill({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[10.5px] text-muted">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color, opacity: 0.8 }} />
      {label}
    </div>
  );
}