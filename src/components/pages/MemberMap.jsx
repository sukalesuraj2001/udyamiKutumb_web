import React, { useState, useEffect, useMemo } from "react";
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
import { fetchDistricts, selectDistricts } from "../redux/slices/wardSlice.js";

import {
  MapPin, Search, X, ArrowLeft,
  Phone, Mail, Globe, Users, Calendar,
  Hash, FileText, IndianRupee, ChevronRight,
  MapPinned, Landmark, ChevronLeft, ExternalLink,
  Building2, Layers, Filter, SlidersHorizontal,
  RotateCcw, Check, ChevronDown, Eye, EyeOff
} from "lucide-react";
import GlobeIntro from "./memberMap/GlobeIntro.jsx";
import SatelliteMap from "./memberMap/SatelliteMap.jsx";

// ── Role resolution ──
function resolveRole(user) {
  const roleStr = (user?.role || user?.roleName || "").toLowerCase();
  if (roleStr.includes("superadmin") || roleStr === "admin" || roleStr === "super_admin") return "superadmin";
  if (roleStr.includes("district")) return "districthead";
  if (roleStr.includes("taluk"))    return "talukahead";
  return "wardhead";
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
  if (roleType === "districthead") return loc.districtName || "";
  if (roleType === "talukahead")   return loc.talukaName   || "";
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
  const districts   = useSelector(selectDistricts) || [];

  const roleType     = resolveRole(user);
  const locationName = resolveLocationName(user, roleType);
  const isAutoRole   = roleType === "districthead" || roleType === "talukahead";

  // Location filter state
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka,   setSelectedTaluka]   = useState("");
  const [selectedWard,     setSelectedWard]     = useState("");
  const [wardInput,        setWardInput]        = useState("");

  // Preserved master dropdown lists
  const [allAvailableTalukas, setAllAvailableTalukas] = useState([]);
  const [allAvailableWards,   setAllAvailableWards]   = useState([]);

  // Business Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Map Layer Toggles
  const [showDistrictLayer,   setShowDistrictLayer]   = useState(true);
  const [showTalukaLayer,     setShowTalukaLayer]     = useState(true);
  const [showWardLayer,       setShowWardLayer]       = useState(true);
  const [showBusinessMarkers, setShowBusinessMarkers] = useState(true);

  // UI State
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [phase,            setPhase]            = useState("idle");
  const [imageIdx,         setImageIdx]         = useState(0);

  // Fetch districts list for SuperAdmin
  useEffect(() => {
    if (roleType === "superadmin") {
      dispatch(fetchDistricts());
    }
  }, [roleType, dispatch]);

  // Initial Auto-fetch on mount based on user role
  useEffect(() => {
    if (roleType === "superadmin") {
      dispatch(fetchWardMap({ name: "Malleshwaram", type: "taluka" }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    } else if (isAutoRole && locationName) {
      const type = roleType === "districthead" ? "district" : "taluka";
      dispatch(fetchWardMap({ name: locationName, type }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    }
  }, [roleType, isAutoRole, locationName, dispatch]);

  // Update master Taluka list whenever a broader GeoJSON with multiple talukas is loaded
  useEffect(() => {
    if (talukaGeos?.features?.length > 0) {
      const set = new Set();
      talukaGeos.features.forEach((f) => {
        const name = f.properties?.name || f.properties?.talukaName;
        if (name) set.add(name);
      });
      if (set.size > 0) {
        setAllAvailableTalukas(Array.from(set).sort());
      }
    }
  }, [talukaGeos]);

  // Update master Ward list whenever a broader GeoJSON with multiple wards is loaded
  useEffect(() => {
    if (wardGeos?.features?.length > 1) {
      const set = new Set();
      wardGeos.features.forEach((f) => {
        const name = f.properties?.name || f.properties?.ward_name || f.properties?.Ward_Name;
        if (name) set.add(name);
      });
      if (set.size > 0) {
        setAllAvailableWards(Array.from(set).sort());
      }
    } else if (wardGeos?.features?.length === 1 && allAvailableWards.length === 0) {
      const name = wardGeos.features[0].properties?.name || wardGeos.features[0].properties?.ward_name || wardGeos.features[0].properties?.Ward_Name;
      if (name) setAllAvailableWards([name]);
    }
  }, [wardGeos]);

  // Filter businesses array based on search input
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const props = b.properties || {};
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName   = (props.businessName || "").toLowerCase().includes(q);
        const matchOwner  = (props.ownerName || "").toLowerCase().includes(q);
        const matchMobile = (props.businessMobile || props.mobile || "").includes(q);
        const matchCity   = (props.city || props.address || "").toLowerCase().includes(q);
        if (!matchName && !matchOwner && !matchMobile && !matchCity) return false;
      }
      return true;
    });
  }, [businesses, searchQuery]);

  // Active filter counter
  const activeFilterCount = [
    selectedDistrict,
    selectedTaluka,
    selectedWard,
    searchQuery,
    !showDistrictLayer,
    !showTalukaLayer,
    !showWardLayer,
    !showBusinessMarkers,
  ].filter(Boolean).length;

  // Center calculation
  const mapCenter = useMemo(() => {
    const candidates = [
      ...(districtGeo?.features || []),
      ...(talukaGeos?.features  || []),
      ...(wardGeos?.features    || []),
    ];
    const poly = candidates.find(
      (f) => f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon"
    );
    if (!poly) return null;

    const rawCoords =
      poly.geometry.type === "Polygon"
        ? poly.geometry.coordinates[0]
        : poly.geometry.coordinates[0][0];

    const lngs = rawCoords.map((c) => c[0]);
    const lats = rawCoords.map((c) => c[1]);
    const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const lng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    if (!isFinite(lat) || !isFinite(lng)) return null;
    return { lat, lng, name: selectedWard || selectedTaluka || selectedDistrict || locationName || wardInput };
  }, [districtGeo, talukaGeos, wardGeos, selectedWard, selectedTaluka, selectedDistrict, locationName, wardInput]);

  const getBusinessImages = (props) => {
    const imgs = [];
    ["businessImage1", "businessImage2", "businessImage3"].forEach((key) => {
      if (props?.[key]?.image) imgs.push(props[key].image);
      else if (typeof props?.[key] === "string" && props[key]) imgs.push(props[key]);
    });
    return imgs;
  };

  // Location Change Handlers
  const handleDistrictSelect = (name) => {
    setSelectedDistrict(name);
    setSelectedTaluka("");
    setSelectedWard("");
    setSelectedBusiness(null);
    if (!name) return;
    dispatch(fetchWardMap({ name, type: "district" }))
      .unwrap()
      .then(() => setPhase("flying"))
      .catch(() => setPhase("idle"));
  };

  const handleTalukaSelect = (name) => {
    setSelectedTaluka(name);
    setSelectedWard("");
    setSelectedBusiness(null);
    if (name) {
      dispatch(fetchWardMap({ name, type: "taluka" }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    } else {
      const parentName = selectedDistrict || locationName || "Malleshwaram";
      const parentType = selectedDistrict ? "district" : (roleType === "districthead" ? "district" : "taluka");
      dispatch(fetchWardMap({ name: parentName, type: parentType }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    }
  };

  const handleWardSelect = (name) => {
    setSelectedWard(name);
    setSelectedBusiness(null);
    if (name) {
      dispatch(fetchWardMap({ name, type: "ward" }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    } else {
      // When clearing ward filter (selecting "All Wards"), re-fetch parent taluka/district map to restore all wards
      const parentName = selectedTaluka || selectedDistrict || locationName || "Malleshwaram";
      const parentType = selectedTaluka ? "taluka" : selectedDistrict ? "district" : (isAutoRole ? (roleType === "districthead" ? "district" : "taluka") : "taluka");
      dispatch(fetchWardMap({ name: parentName, type: parentType }))
        .unwrap()
        .then(() => setPhase("flying"))
        .catch(() => setPhase("idle"));
    }
  };

  const handleWardSearchFetch = () => {
    const trimmed = wardInput.trim();
    if (!trimmed) return;
    setSelectedBusiness(null);
    setPhase("idle");
    setImageIdx(0);
    dispatch(fetchWardMap({ name: trimmed, type: "ward" }))
      .unwrap()
      .then(() => setPhase("flying"))
      .catch(() => setPhase("idle"));
  };

  const handleResetFilters = () => {
    setSelectedDistrict("");
    setSelectedTaluka("");
    setSelectedWard("");
    setWardInput("");
    setSearchQuery("");
    setShowDistrictLayer(true);
    setShowTalukaLayer(true);
    setShowWardLayer(true);
    setShowBusinessMarkers(true);
    setSelectedBusiness(null);

    // Re-fetch parent area so all wards show back up
    const defaultName = (isAutoRole && locationName) ? locationName : "Malleshwaram";
    const defaultType = (roleType === "districthead") ? "district" : "taluka";

    dispatch(fetchWardMap({ name: defaultName, type: defaultType }))
      .unwrap()
      .then(() => setPhase("flying"))
      .catch(() => setPhase("idle"));
  };

  const handleSelectBusiness = (props) => {
    setSelectedBusiness(props);
    setImageIdx(0);
  };

  // Stats summary
  const talukaCount = talukaGeos?.features?.length || 0;
  const wardCount   = wardGeos?.features?.length   || 0;
  const bizCount    = filteredBusinesses.length;

  // ── Sidebar Renderer ──
  const renderSidebar = () => {
    // DETAIL VIEW
    if (selectedBusiness) {
      const imgs    = getBusinessImages(selectedBusiness);
      const mobile  = selectedBusiness.businessMobile || selectedBusiness.mobile;
      const website = selectedBusiness.website?.replace(/^https?:\/\//, "");

      return (
        <>
          <div className="sticky top-0 z-10 bg-white border-b border-hairline px-4 py-3 flex items-center gap-3 shadow-sm">
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

    // MAIN SIDEBAR & FILTER VIEW
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white">
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-hairline bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Filter size={15} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-bold text-ink tracking-tight uppercase">Member Map Filters</p>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.2">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted capitalize font-medium">
                  {roleType === "superadmin" ? "SuperAdmin Mode" : `${roleType.replace("head", " Head")} View`}
                </p>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                title="Clear all filters and reset map"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Filters Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-hairline">
          
          {/* SECTION 1: ROLE-BASED LOCATION FILTERS */}
          <div className="p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <MapPin size={12} className="text-blue-600" /> Area Filter
              </span>
            </div>

            {/* SuperAdmin: District Select */}
            {roleType === "superadmin" && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full text-[12px] font-medium border border-hairline rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select District…</option>
                  {districts.length > 0
                    ? districts.map((d) => {
                        const name = d.districtName || d.name || d;
                        return <option key={d._id || d.districtId || name} value={name}>{name}</option>;
                      })
                    : [
                        "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubballi-Dharwad",
                        "Belagavi", "Mangaluru", "Tumakuru", "Shivamogga", "Ballari", "Kalaburagi"
                      ].map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
            )}

            {/* District Head Badge */}
            {roleType === "districthead" && locationName && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[12px] font-semibold text-blue-800 flex items-center justify-between">
                <span className="text-[11px] text-blue-600 font-medium uppercase">District:</span>
                <span>{locationName}</span>
              </div>
            )}

            {/* SuperAdmin & District Head: Taluka Select */}
            {(roleType === "superadmin" || roleType === "districthead") && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Taluka</label>
                <select
                  value={selectedTaluka}
                  onChange={(e) => handleTalukaSelect(e.target.value)}
                  className="w-full text-[12px] font-medium border border-hairline rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">
                    {allAvailableTalukas.length > 0 ? "All Talukas" : "Select Taluka…"}
                  </option>
                  {allAvailableTalukas.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Taluka Head Badge */}
            {roleType === "talukahead" && locationName && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-[12px] font-semibold text-orange-800 flex items-center justify-between">
                <span className="text-[11px] text-orange-600 font-medium uppercase">Taluka:</span>
                <span>{locationName}</span>
              </div>
            )}

            {/* Ward Select Dropdown (SuperAdmin, District Head, Taluka Head) */}
            {roleType !== "wardhead" && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Ward</label>
                <select
                  value={selectedWard}
                  onChange={(e) => handleWardSelect(e.target.value)}
                  className="w-full text-[12px] font-medium border border-hairline rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">
                    {allAvailableWards.length > 0 ? "All Wards" : "Select Ward…"}
                  </option>
                  {allAvailableWards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Ward Head text search */}
            {roleType === "wardhead" && (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    value={wardInput}
                    onChange={(e) => setWardInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleWardSearchFetch()}
                    placeholder="Enter ward name…"
                    className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-hairline rounded-xl focus:outline-none focus:border-blue-400 bg-slate-50"
                  />
                </div>
                <button
                  onClick={handleWardSearchFetch}
                  disabled={loading || !wardInput.trim()}
                  className="px-3.5 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  Go
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: SEARCH BUSINESS FILTER */}
          <div className="p-4 space-y-2.5 bg-white">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Building2 size={12} className="text-amber-600" /> Search Business
            </span>

            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, owner, phone…"
                className="w-full pl-8 pr-8 py-2 text-[12px] border border-hairline rounded-xl focus:outline-none focus:border-blue-400 bg-slate-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* SECTION 3: MAP LAYER TOGGLES */}
          <div className="p-4 space-y-2.5 bg-white">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
              <Layers size={12} className="text-purple-600" /> Layer Visibility
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-hairline hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showDistrictLayer}
                  onChange={(e) => setShowDistrictLayer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-slate-700">District Boundary</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-hairline hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showTalukaLayer}
                  onChange={(e) => setShowTalukaLayer(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium text-slate-700">Taluka Borders</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-hairline hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showWardLayer}
                  onChange={(e) => setShowWardLayer(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700">Ward Borders</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border border-hairline hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={showBusinessMarkers}
                  onChange={(e) => setShowBusinessMarkers(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">Business Pins</span>
              </label>
            </div>
          </div>

          {/* SECTION 4: STATS SUMMARY & BUSINESS LIST */}
          <div className="p-4 bg-slate-50/50 space-y-3">
            {/* Stats Cards */}
            {!loading && (districtGeo || talukaGeos || wardGeos) && (
              <div className={`grid gap-2 ${roleType === "superadmin" || roleType === "districthead" ? "grid-cols-3" : "grid-cols-2"}`}>
                {(roleType === "superadmin" || roleType === "districthead") && (
                  <StatCard icon={Landmark} value={talukaCount} label="Talukas" color="orange" />
                )}
                <StatCard icon={MapPinned} value={wardCount} label="Wards" color="green" />
                <StatCard icon={Building2} value={bizCount} label="Businesses" color="amber" />
              </div>
            )}

            {/* Businesses Header & Items */}
            {loading ? (
              <div className="py-8 text-center text-muted">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[12px]">Loading map data…</p>
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-bold tracking-widest uppercase text-muted">
                    Businesses ({filteredBusinesses.length})
                  </p>
                  {filteredBusinesses.length < businesses.length && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      Filtered from {businesses.length}
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredBusinesses.map((b, i) => (
                    <button
                      key={b.properties.profileId || i}
                      onClick={() => handleSelectBusiness(b.properties)}
                      className="w-full text-left bg-white border border-hairline rounded-xl p-3 transition-all hover:border-amber/50 hover:bg-amber/[0.03] hover:shadow-sm group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-ink truncate">{b.properties.businessName}</p>
                          <p className="text-[11px] text-muted mt-0.5 truncate">
                            {b.properties.ownerName} · {b.properties.businessMobile || b.properties.mobile || "No Mobile"}
                          </p>
                          {b.properties.sector && (
                            <span className="inline-block mt-1 text-[9.5px] font-medium bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
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
            ) : businesses.length > 0 ? (
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl text-center text-[12px] text-amber-800">
                <p className="font-semibold">No businesses match search query</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-1.5 text-[11px] font-semibold text-blue-600 underline"
                >
                  Clear Search
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-0 h-[calc(100vh-140px)] -m-6">

      {/* Sidebar */}
      <div className="border-r border-hairline bg-white flex flex-col overflow-hidden shadow-sm">
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
            {/* Top Bar Overlay */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
              <div className="bg-ink/90 backdrop-blur text-white rounded-xl px-4 py-2.5 text-[12.5px] shadow-lg flex items-center gap-3">
                <div>
                  <p className="font-semibold capitalize flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-400" />
                    {selectedWard || selectedTaluka || selectedDistrict || locationName || wardInput || "Map Area"}
                    {roleType === "superadmin" || roleType === "districthead" ? (talukaCount > 0 && ` · ${talukaCount} talukas`) : ""}
                    {wardCount > 0 && ` · ${wardCount} wards`}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    Showing {bizCount} of {businesses.length} business{businesses.length !== 1 ? "es" : ""}
                  </p>
                </div>
              </div>
            </div>

            <SatelliteMap
              location={mapCenter}
              wardPolygon={null}
              districtGeo={districtGeo}
              talukaGeos={talukaGeos}
              wardGeos={wardGeos}
              fetchType={fetchType || (roleType === "superadmin" ? "district" : roleType.replace("head", ""))}
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
              showDistrictLayer={showDistrictLayer}
              showTalukaLayer={showTalukaLayer}
              showWardLayer={showWardLayer}
              showBusinessMarkers={showBusinessMarkers}
            />
          </div>
        )}

        {phase === "idle" && !districtGeo && !talukaGeos && !wardGeos && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 pointer-events-none select-none">
            <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
              <MapPin size={28} className="opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-medium">Select location filters to view area map</p>
              <p className="text-[12px] mt-0.5 opacity-70">Use the left side filter panel</p>
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
    <div className="border border-hairline rounded-xl p-2.5 bg-white shadow-xs">
      <div className={`w-5 h-5 rounded-md flex items-center justify-center mb-1 ${colors[color]}`}>
        <Icon size={11} />
      </div>
      <p className="text-[14px] font-bold text-ink leading-tight">{value}</p>
      <p className="text-[9.5px] text-muted uppercase tracking-wide font-medium">{label}</p>
    </div>
  );
}