import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchWardMap,
  clearWardMap,
  selectWardGeoJson,
  selectWardLoading,
  selectWardError,
} from "../redux/slices/wardMapSlice.js";

import {
  MapPin, Search, X, ArrowLeft,
  Phone, Mail, Globe, Users, Calendar,
  Hash, FileText, IndianRupee, ChevronRight,
  MapPinned, Landmark, ChevronLeft, ExternalLink,
  Building2,
} from "lucide-react";
import GlobeIntro from "./memberMap/GlobeIntro.jsx";
import SatelliteMap from "./memberMap/SatelliteMap.jsx";

export default function MemberMap() {
  const dispatch = useDispatch();

  const geoJson = useSelector(selectWardGeoJson);
  const loading = useSelector(selectWardLoading);
  const error = useSelector(selectWardError);

  const [wardInput, setWardInput] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [imageIdx, setImageIdx] = useState(0);

  // ── Derived ──
  const polygon = geoJson
    ? geoJson.features.find(
      (f) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    )
    : null;

  const businesses = geoJson
    ? geoJson.features.filter((f) => f.geometry.type === "Point")
    : [];

  const wardProps = polygon?.properties || {};
  const wardDisplayName = wardProps.ward_name || wardProps.Ward_Name || `Ward ${wardInput}`;
  const wardId = wardProps.ward_id || wardProps.ward || wardInput;

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
      name: wardDisplayName,
    };
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
    setImageIdx(0);
  };

  const handleSelectBusiness = (props) => {
    setSelectedBusiness(props);
    setImageIdx(0);
  };

  const handleBackToSearch = () => {
    setPhase("idle");
    setSelectedBusiness(null);
  };

  // ── Render sidebar content ──
  const renderSidebar = () => {

    // ── DETAIL VIEW ──
    if (selectedBusiness) {
      const imgs = getBusinessImages(selectedBusiness);
      const mobile = selectedBusiness.businessMobile || selectedBusiness.mobile;
      const website = selectedBusiness.website?.replace(/^https?:\/\//, "");

      return (
        <>
          {/* Sticky back header */}
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

            {/* Image carousel */}
            {imgs.length > 0 ? (
              <div className="relative h-48 bg-ink/10 overflow-hidden">
                <img
                  src={imgs[imageIdx]}
                  alt={selectedBusiness.businessName}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Dot indicators */}
                {imgs.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {imgs.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImageIdx(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === imageIdx ? "bg-white w-5" : "bg-white/50 w-1.5"
                          }`}
                      />
                    ))}
                  </div>
                )}

                {/* Prev / Next */}
                {imgs.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIdx((p) => Math.max(0, p - 1))}
                      disabled={imageIdx === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-black/60"
                    >
                      <ChevronLeft size={15} className="text-white" />
                    </button>
                    <button
                      onClick={() => setImageIdx((p) => Math.min(imgs.length - 1, p + 1))}
                      disabled={imageIdx === imgs.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center disabled:opacity-0 transition-opacity hover:bg-black/60"
                    >
                      <ChevronRight size={15} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* No image placeholder */
              <div className="h-28 bg-gradient-to-br from-amber/10 to-amber/5 flex items-center justify-center border-b border-hairline">
                <Building2 size={28} className="text-amber/40" />
              </div>
            )}

            <div className="p-4 space-y-4">

              {/* Business name + badges */}
              <div>
                <h2 className="text-[16px] font-semibold text-ink leading-snug">
                  {selectedBusiness.businessName}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedBusiness.businessType && (
                    <Chip color="amber">{selectedBusiness.businessType}</Chip>
                  )}
                  {selectedBusiness.sector && (
                    <Chip color="gray">{selectedBusiness.sector}</Chip>
                  )}
                  {selectedBusiness.establishedYear && (
                    <Chip color="gray">Est. {selectedBusiness.establishedYear}</Chip>
                  )}
                </div>
              </div>

              {/* ── Quick action buttons ── */}
              <div className="grid grid-cols-3 gap-2">
                <ActionBtn
                  href={`tel:${mobile}`}
                  icon={Phone}
                  label="Call"
                  color="green"
                />
                {selectedBusiness.email && (
                  <ActionBtn
                    href={`mailto:${selectedBusiness.email}`}
                    icon={Mail}
                    label="Email"
                    color="blue"
                  />
                )}
                {selectedBusiness.website && (
                  <ActionBtn
                    href={selectedBusiness.website}
                    icon={ExternalLink}
                    label="Website"
                    color="purple"
                    external
                  />
                )}
              </div>

              {/* ── Info rows ── */}

              {/* Owner */}
              <InfoCard>
                <InfoRow icon={Users} label="Owner" value={selectedBusiness.ownerName} />
                <InfoRow icon={Phone} label="Mobile" value={mobile} />
                {selectedBusiness.email && (
                  <InfoRow icon={Mail} label="Email" value={selectedBusiness.email} mono />
                )}
                {website && (
                  <InfoRow icon={Globe} label="Website" value={website} mono />
                )}
              </InfoCard>

              {/* Address */}
              {(selectedBusiness.address || selectedBusiness.city) && (
                <InfoCard label="Address">
                  <InfoRow
                    icon={MapPinned}
                    label="Location"
                    value={[
                      selectedBusiness.address,
                      selectedBusiness.city,
                      selectedBusiness.district,
                      selectedBusiness.state,
                      selectedBusiness.pincode,
                    ].filter(Boolean).join(", ")}
                  />
                </InfoCard>
              )}

              {/* Stats row */}
              {(selectedBusiness.employees || selectedBusiness.annualTurnover) && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedBusiness.employees && (
                    <StatCard
                      icon={Users}
                      value={selectedBusiness.employees}
                      label="Employees"
                    />
                  )}
                  {selectedBusiness.annualTurnover && (
                    <StatCard
                      icon={IndianRupee}
                      value={selectedBusiness.annualTurnover}
                      label="Annual Turnover"
                    />
                  )}
                </div>
              )}

              {/* Registration */}
              <InfoCard label="Registration">
                {selectedBusiness.registrationNumber && (
                  <InfoRow icon={FileText} label="Reg. No." value={selectedBusiness.registrationNumber} mono />
                )}
                {selectedBusiness.gstNumber && (
                  <InfoRow icon={Hash} label="GST No." value={selectedBusiness.gstNumber} mono />
                )}
                <InfoRow
                  icon={Building2}
                  label="Profile ID"
                  value={(selectedBusiness.profileId || "").slice(0, 16) + "…"}
                  mono
                />
              </InfoCard>

            </div>
          </div>
        </>
      );
    }

    // ── LIST VIEW ──
    return (
      <>
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline">
          <h1 className="flex items-center gap-2 font-display text-[19px] font-semibold text-ink">
            <span className="w-7 h-7 rounded-lg bg-amber/15 flex items-center justify-center">
              <MapPin size={15} className="text-amber" />
            </span>
            Member Map
          </h1>
          <p className="text-[12px] text-muted mt-1 ml-9">
            Search a ward to view boundaries &amp; businesses
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-hairline">
          <label className="text-[10.5px] font-semibold tracking-widest uppercase text-muted mb-2 block">
            Ward Name / Hobli Name
          </label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 border border-hairline rounded-xl px-3 py-2.5 flex-1 focus-within:border-ink/30 transition-colors">
              <Search size={13} className="text-muted shrink-0" />
              <input
                value={wardInput}
                onChange={(e) => setWardInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                placeholder="e.g. Mathikere or 48"
                className="w-full text-[13px] text-ink placeholder:text-muted/60 focus:outline-none bg-transparent"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={loading || !wardInput.trim()}
              className="bg-ink text-white text-[13px] font-semibold px-4 rounded-xl disabled:opacity-35 hover:bg-ink/80 transition-colors shrink-0 min-w-[52px] flex items-center justify-center"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : "Go"}
            </button>
          </div>

          {error && (
            <div className="mt-2.5 flex items-start gap-2 text-[12px] text-brick bg-brick/8 border border-brick/15 rounded-xl px-3 py-2.5">
              <X size={13} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
        </div>

        {/* Ward info */}
        {geoJson && polygon && (
          <div className="p-4 border-b border-hairline space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-semibold text-ink leading-tight">
                  {wardDisplayName}
                  {wardProps.ward_name_kn && (
                    <span className="text-[13px] text-muted font-normal ml-1.5">
                      ({wardProps.ward_name_kn})
                    </span>
                  )}
                </p>
                <p className="text-[11.5px] text-muted mt-0.5">Ward ID: {wardId}</p>
              </div>
              {wardProps.Corporation && (
                <span className="text-[10px] font-semibold bg-forest/10 text-forest rounded-full px-2.5 py-1 shrink-0 mt-0.5 whitespace-nowrap">
                  {wardProps.Corporation} Zone
                </span>
              )}
            </div>

            {wardProps.Assembly && (
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <Landmark size={11} className="shrink-0" />
                {wardProps.Assembly}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-hairline rounded-xl p-3 text-center bg-ink/[0.015]">
                <p className="text-[22px] font-display font-bold text-ink leading-none">
                  {businesses.length}
                </p>
                <p className="text-[10.5px] text-muted mt-1">Businesses</p>
              </div>
              <div className="border border-hairline rounded-xl p-3 text-center bg-ink/[0.015]">
                <p className={`text-[14px] font-semibold leading-none ${phase === "arrived" ? "text-forest" : "text-amber"}`}>
                  {phase === "arrived" ? "Live ✓" : "Loading…"}
                </p>
                <p className="text-[10.5px] text-muted mt-1">Map View</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 border border-hairline rounded-xl py-2 text-[12px] font-semibold text-muted hover:text-brick hover:border-brick/30 transition-colors"
            >
              <X size={12} /> Clear &amp; Reset
            </button>
          </div>
        )}

        {/* Business list */}
        {businesses.length > 0 && (
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-[10.5px] font-semibold tracking-widest uppercase text-muted mb-3">
              Businesses in Ward
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
                      <p className="text-[13px] font-semibold text-ink truncate">
                        {b.properties.businessName}
                      </p>
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
        {phase === "idle" && !geoJson && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-ink/[0.04] flex items-center justify-center">
              <Search size={20} className="opacity-40" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink/50">No ward selected</p>
              <p className="text-[11.5px] text-muted mt-0.5">Search by name or number above</p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-140px)] -m-6">

      {/* ── Sidebar ── */}
      <div className="border-r border-hairline bg-white flex flex-col overflow-hidden">
        {renderSidebar()}
      </div>

      {/* ── Map ── */}
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
                className="flex items-center gap-1.5 bg-ink/90 backdrop-blur text-white rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold hover:bg-ink transition-colors shadow-lg"
              >
                <ArrowLeft size={13} /> Back
              </button>
              <div className="bg-ink/90 backdrop-blur text-white rounded-xl px-4 py-2.5 text-[12.5px] shadow-lg">
                <p className="font-semibold">
                  {wardDisplayName} · {businesses.length} business{businesses.length !== 1 ? "es" : ""}
                </p>
                <p className="text-white/55 text-[11px]">
                  {[wardProps.Corporation && `${wardProps.Corporation} Zone`, wardProps.ac].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <SatelliteMap
              location={wardCenter}
              wardPolygon={polygon}
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
              onZoomOutToGlobe={handleBackToSearch}
            />
          </div>
        )}

        {phase === "idle" && !geoJson && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 pointer-events-none select-none">
            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
              <MapPin size={28} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium">Enter a ward to begin</p>
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
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors ${colors[color]}`}
    >
      <Icon size={18} />
      <span className="text-[11px] font-semibold">{label}</span>
    </a>
  );
}

function InfoCard({ label, children }) {
  return (
    <div>
      {label && (
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted mb-1.5 px-0.5">
          {label}
        </p>
      )}
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

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="border border-hairline rounded-xl p-3.5 bg-ink/[0.015]">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-muted" />
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}