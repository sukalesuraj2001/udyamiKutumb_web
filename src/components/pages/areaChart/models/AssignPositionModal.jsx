import React, { useEffect, useRef, useState, useMemo } from "react";
import { X, Search, Loader2, Building2, Phone, Mail, MapPin, BadgeCheck, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  searchMembers,
  selectSearchResults,
  selectSearchStatus,
} from "../../../redux/slices/areaChartSlice.js";

const BASE_URL = "https://backend.udyamikutumba.com";

// ── Avatar helper ─────────────────────────────────────────────────
function Avatar({ src, name, size = 44 }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0 border border-hairline"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full bg-amber/20 text-amber flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

// ── Role badge ────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const label = role?.role ?? role?.roleName ?? "Member";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/10 text-amber text-[11px] font-semibold">
      <BadgeCheck size={11} />
      {label.replace(/_/g, " ")}
    </span>
  );
}

// ── Profile Photo Extractor ───────────────────────────────────────
function getMemberPhotoUrl(member) {
  if (!member) return null;
  const p = member.profile || {};
  const raw =
    p.profileImage ||
    member.profileImage ||
    member.photoUrl ||
    p.businessDetails?.businessImage1 ||
    null;

  if (!raw) return null;
  if (typeof raw === "string" && raw.trim()) return raw;
  if (typeof raw === "object") {
    if (typeof raw.image === "string" && raw.image.trim()) return raw.image;
    if (typeof raw.url === "string" && raw.url.trim()) return raw.url;
  }
  return null;
}

// ── Member card ───────────────────────────────────────────────────
function MemberCard({ member, selected, onSelect }) {
  const role = member.userRoles?.[0]?.role;
  const photo = getMemberPhotoUrl(member);

  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-150 ${selected
          ? "border-amber bg-amber/5 shadow-sm"
          : "border-hairline hover:border-amber/40 hover:bg-ink/[.02]"
        }`}
    >
      <div className="flex items-start gap-3">
        <Avatar src={photo} name={member.name} />

        <div className="min-w-0 flex-1 space-y-1">
          {/* Name + badge row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-ink truncate">
              {member.name}
            </span>
            {role && <RoleBadge role={role} />}
            {member.isPrime && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-semibold">
                Prime
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {member.email && (
              <span className="flex items-center gap-1 text-[11.5px] text-muted">
                <Mail size={10} className="shrink-0" />
                {member.email}
              </span>
            )}
            {member.mobileNumber && (
              <span className="flex items-center gap-1 text-[11.5px] text-muted">
                <Phone size={10} className="shrink-0" />
                {member.mobileNumber}
              </span>
            )}
          </div>

          {/* Location + business */}
          {(member.profile?.district || member.profile?.assembly || member.profile?.ward || member.profile?.businessDetails?.businessName) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {member.profile?.district && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <MapPin size={10} className="shrink-0" />
                  {member.profile.district}
                </span>
              )}
              {member.profile?.assembly && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <MapPin size={10} className="shrink-0 opacity-60" />
                  {member.profile.assembly}
                </span>
              )}
              {member.profile?.ward && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <MapPin size={10} className="shrink-0 opacity-40" />
                  {member.profile.ward}
                </span>
              )}
              {member.profile?.businessDetails?.businessName && (
                <span className="flex items-center gap-1 text-[11.5px] text-muted">
                  <Building2 size={10} className="shrink-0" />
                  {member.profile.businessDetails.businessName}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function AssignPositionModal({
  wardName,
  talukaId: propsTalukaId,
  districtId: propsDistrictId,
  role: propsRole,
  constituency,
  slotId,
  position = "Position",
  isSaving = false,
  onClose,
  onAssign,
}) {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults);
  const searchStatus = useSelector(selectSearchStatus);
  const authUser = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  // Animation state
  const [animate, setAnimate] = useState(false);

  // Location data fallback
  const locationData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("locationData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userRole = (propsRole || authUser?.role || "").toString();
  const roleNorm = userRole.toLowerCase().replace(/[\s_]/g, "");

  const isSuperAdmin = roleNorm === "superadmin";
  const isDistrictHead = roleNorm === "districthead";
  const isTalukaHead = roleNorm === "talukhead" || roleNorm === "talukahead";

  const [selectedDistrict, setSelectedDistrict] = useState(propsDistrictId || locationData?.districtId || "");
  const [selectedTaluka, setSelectedTaluka] = useState(propsTalukaId || locationData?.talukaId || "");
  const [selectedWard, setSelectedWard] = useState(wardName || locationData?.wardName || "");

  const [districtsList, setDistrictsList] = useState([]);
  const [talukasList, setTalukasList] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Fetch Districts for SuperAdmin ──
  useEffect(() => {
    if (!isSuperAdmin) return;
    let isMounted = true;
    setLoadingDistricts(true);
    axios
      .get(`${BASE_URL}/district/getAllDistricts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isMounted && res.data?.success) {
          setDistrictsList(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching districts:", err))
      .finally(() => {
        if (isMounted) setLoadingDistricts(false);
      });
    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin, token]);

  // ── Fetch Talukas for SuperAdmin & DistrictHead ──
  useEffect(() => {
    const activeDistrictId = isDistrictHead ? (propsDistrictId || locationData?.districtId || selectedDistrict) : selectedDistrict;
    if (!activeDistrictId) {
      setTalukasList([]);
      return;
    }
    let isMounted = true;
    setLoadingTalukas(true);
    axios
      .get(`${BASE_URL}/district/getAllDistricts?districtId=${activeDistrictId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isMounted && res.data?.success) {
          setTalukasList(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching talukas:", err))
      .finally(() => {
        if (isMounted) setLoadingTalukas(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, isDistrictHead, propsDistrictId, locationData?.districtId, token]);

  // ── Fetch Wards for SuperAdmin, DistrictHead & TalukaHead ──
  useEffect(() => {
    const activeTalukaId = isTalukaHead ? (propsTalukaId || locationData?.talukaId || selectedTaluka) : selectedTaluka;
    if (!activeTalukaId) {
      setWardsList([]);
      return;
    }
    let isMounted = true;
    setLoadingWards(true);
    axios
      .get(`${BASE_URL}/ward/getWardBy/${activeTalukaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isMounted && res.data?.success) {
          setWardsList(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching wards:", err))
      .finally(() => {
        if (isMounted) setLoadingWards(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedTaluka, isTalukaHead, propsTalukaId, locationData?.talukaId, token]);

  // ── Dispatch searchMembers API ──
  const executeSearch = (overrides = {}) => {
    const dId = "districtId" in overrides ? overrides.districtId : (isDistrictHead || isTalukaHead ? (propsDistrictId || locationData?.districtId) : selectedDistrict);
    const tId = "talukaId" in overrides ? overrides.talukaId : (isTalukaHead ? (propsTalukaId || locationData?.talukaId) : selectedTaluka);
    const wName = "wardName" in overrides ? overrides.wardName : selectedWard;
    const q = "query" in overrides ? overrides.query : search;

    const payload = {
      name: q || "",
      query: q || "",
      role: userRole,
    };
    if (dId) payload.districtId = dId;
    if (tId) payload.talukaId = tId;
    if (wName) payload.wardName = wName;

    dispatch(searchMembers(payload));
  };

  useEffect(() => {
    executeSearch();
  }, [userRole]);

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedTaluka("");
    setSelectedWard("");
    executeSearch({ districtId: val, talukaId: "", wardName: "" });
  };

  const handleTalukaChange = (e) => {
    const val = e.target.value;
    setSelectedTaluka(val);
    setSelectedWard("");
    executeSearch({ talukaId: val, wardName: "" });
  };

  const handleWardChange = (e) => {
    const val = e.target.value;
    setSelectedWard(val);
    executeSearch({ wardName: val });
  };

  // ── Local in-memory filtering for search ──
  const filteredMembers = React.useMemo(() => {
    if (!Array.isArray(searchResults)) return [];
    if (!search.trim()) return searchResults;
    const q = search.trim().toLowerCase();
    return searchResults.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const mobile = (m.mobileNumber || "").toLowerCase();
      const company = (m.companyName || m.company || m.profile?.businessDetails?.businessName || "").toLowerCase();
      const location = (m.businessLocation || m.profile?.district || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        mobile.includes(q) ||
        company.includes(q) ||
        location.includes(q)
      );
    });
  }, [searchResults, search]);

  const handleAssignExisting = () => {
    if (!selectedMember || isSaving) return;
    const p = selectedMember.profile ?? {};
    const photoUrl = getMemberPhotoUrl(selectedMember);
    onAssign({
      name: selectedMember.name,
      company: p.businessDetails?.businessName ?? selectedMember.companyName ?? "",
      photoUrl: photoUrl,
      memberId: selectedMember.userId,
      mobileNumber: selectedMember.mobileNumber,
      alternatePhone: p.alternateMobile,
      email: selectedMember.email,
      location: selectedMember.businessLocation ?? wardName,
      district: p.district ?? "",
      state: p.state ?? "",
      status: "Active",
    });
  };

  const isSearching = searchStatus === "loading";

  const renderSearchEmpty = () => {
    if (isSearching) return null;
    if (filteredMembers.length === 0 && search.trim())
      return (
        <p className="text-[13px] text-muted text-center py-8">
          No members found for "{search}"
        </p>
      );
    if (searchResults.length === 0)
      return (
        <p className="text-[13px] text-muted text-center py-8">
          No members available
        </p>
      );
    return null;
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-ink/40" onClick={handleClose} />

      <div className={`relative w-full max-w-md bg-white h-full shadow-2xl p-4 sm:p-6 overflow-y-auto transform transition-all duration-300 ${animate ? "translate-x-0 opacity-100 ease-out" : "translate-x-full opacity-0 ease-in"}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-[18px] sm:text-[20px] text-ink">
            Assign Position: {position}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-muted mb-6">Ward: {wardName}</p>

        {/* Existing Member List */}
        <div className="space-y-4">
          {/* Search input */}
          <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5">
            {isSearching ? (
              <Loader2 size={16} className="text-muted shrink-0 animate-spin" />
            ) : (
              <Search size={16} className="text-muted shrink-0" />
            )}
            <input
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                setSelectedMember(null);
                executeSearch({ query: val });
              }}
              placeholder="Name, mobile or email…"
              className="w-full text-[13.5px] text-ink placeholder:text-muted focus:outline-none"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedMember(null);
                  executeSearch({ query: "" });
                }}
                className="text-muted hover:text-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Location Filters below Search */}
          {(isSuperAdmin || isDistrictHead || isTalukaHead) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* District Filter (Super Admin only) */}
              {isSuperAdmin && (
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    disabled={loadingDistricts}
                    className="w-full text-[12px] bg-slate-50 border border-hairline rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-amber appearance-none pr-6 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Districts</option>
                    {districtsList.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {d.districtName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              )}

              {/* Taluka Filter (Super Admin & District Head) */}
              {(isSuperAdmin || isDistrictHead) && (
                <div className="relative">
                  <select
                    value={selectedTaluka}
                    onChange={handleTalukaChange}
                    disabled={loadingTalukas || (isSuperAdmin && !selectedDistrict)}
                    className="w-full text-[12px] bg-slate-50 border border-hairline rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-amber appearance-none pr-6 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Talukas</option>
                    {talukasList.map((t) => (
                      <option key={t.talukaId} value={t.talukaId}>
                        {t.talukaName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              )}

              {/* Ward Filter (Super Admin, District Head & Taluka Head) */}
              {(isSuperAdmin || isDistrictHead || isTalukaHead) && (
                <div className="relative">
                  <select
                    value={selectedWard}
                    onChange={handleWardChange}
                    disabled={loadingWards || ((isSuperAdmin || isDistrictHead) && !selectedTaluka && wardsList.length === 0)}
                    className="w-full text-[12px] bg-slate-50 border border-hairline rounded-lg px-2.5 py-1.5 text-ink focus:outline-none focus:border-amber appearance-none pr-6 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">All Wards</option>
                    {wardsList.map((w) => {
                      const wName = w.wardName || w.ward_name || w.ward;
                      return (
                        <option key={w.wardId || wName} value={wName}>
                          {wName} {w.wardNumber ? `(#${w.wardNumber})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              )}
            </div>
          )}

          {/* Results list */}
          <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5">
            {renderSearchEmpty() ??
              filteredMembers.map((m) => (
                <MemberCard
                  key={m.userId || m.id}
                  member={m}
                  selected={selectedMember?.userId === m.userId}
                  onSelect={setSelectedMember}
                />
              ))}
          </div>

          {/* Selected preview strip */}
          {selectedMember && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber/5 border border-amber/20">
              <Avatar
                src={selectedMember.profile?.profileImage}
                name={selectedMember.name}
                size={32}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-ink truncate">
                  {selectedMember.name}
                </p>
                <p className="text-[11px] text-muted truncate">
                  {selectedMember.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-muted hover:text-ink shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <button
            onClick={handleAssignExisting}
            disabled={!selectedMember || isSaving}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl disabled:bg-ink/30 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
          >
            {isSaving ? "Saving…" : "Assign Selected Member"}
          </button>
        </div>
      </div>
    </div>
  );
}