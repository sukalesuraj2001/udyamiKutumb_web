import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  X,
  Search,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Building2,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { searchMembers } from "../../../redux/slices/areaChartSlice.js";

const BASE_URL = "https://backend.udyamikutumba.com";

const SLOT_TO_UCN_TYPE_MAP = {
  "core-president": ["circle_leader", "circle-leader", "president"],
  "core-vice-president": ["vice_president", "vice-president"],
  "core-general-secretary": ["general_secretary", "general-secretary"],
  "core-treasurer": ["treasurer"],
  "ward-chairman": ["ward_chairman", "ward-chairman"],
};

/* ─── Main Component ─── */
export default function UcnMembersSidePanel({
  open,
  onClose,
  slotId,
  slotLabel,
  wardName,
  talukaId: propsTalukaId,
  districtId: propsDistrictId,
  role: propsRole,
  ucnMembers = [],
  channelPartners = [],
  patrons = [],
  umsMembers = [],
  panelType = "ucn", // "ucn" | "channelPartner" | "patron" | "ums"
  onSearchBusiness,
  onAssignMember,
}) {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

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

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setSelectedTaluka("");
    setSelectedWard("");
  };

  const handleTalukaChange = (e) => {
    const val = e.target.value;
    setSelectedTaluka(val);
    setSelectedWard("");
  };

  const handleWardChange = (e) => {
    const val = e.target.value;
    setSelectedWard(val);
  };

  const isUms = panelType === "ums" || (slotId && slotId.startsWith("ums-"));
  const isPatron = panelType === "patron" || (slotId && slotId.startsWith("patron-"));
  const isChannelPartner = panelType === "channelPartner" || (slotId && slotId.startsWith("product-"));
  const targetMembers = isUms
    ? umsMembers
    : isPatron
      ? patrons
      : isChannelPartner
        ? channelPartners
        : ucnMembers;

  const targetTypes = useMemo(() => {
    if (!slotId) return [];
    if (SLOT_TO_UCN_TYPE_MAP[slotId]) return SLOT_TO_UCN_TYPE_MAP[slotId];
    if (slotId.startsWith("ums-")) {
      const key = slotId.replace("ums-", "").toLowerCase();
      return [`ums_${key}`, `ums-${key}`, key];
    }
    if (slotId.startsWith("sector-")) {
      const key = slotId.replace("sector-", "").toLowerCase();
      return [`sector_${key}`, `sector-${key}`, key];
    }
    return [slotId.toLowerCase()];
  }, [slotId]);

  // Helper to check if a member matches the current slot
  const isMatchingMember = (member) => {
    if (isChannelPartner || isPatron || isUms) return false;
    const mType = (member.ucnType || member.positionName || member.assignmentType || "").toLowerCase();
    return targetTypes.some((t) => mType.includes(t));
  };

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!targetMembers || !Array.isArray(targetMembers)) return [];

    let list = [...targetMembers];

    // Priority sorting: matched slot members first
    if (!isChannelPartner && !isPatron && !isUms && targetTypes.length > 0) {
      list.sort((a, b) => {
        const aMatch = isMatchingMember(a) ? 1 : 0;
        const bMatch = isMatchingMember(b) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((m) => {
      if (isChannelPartner) {
        const cpId = (m.cpId || "").toLowerCase();
        const busName = (m.profile?.businessDetails?.businessName || "").toLowerCase();
        const services = (m.cpRegistration?.selectedServices || []).join(" ").toLowerCase();
        const address = (m.cpRegistration?.businessOfficeAddress || "").toLowerCase();
        const holderName = (m.holder?.user?.name || m.name || "").toLowerCase();
        return (
          cpId.includes(q) ||
          busName.includes(q) ||
          services.includes(q) ||
          address.includes(q) ||
          holderName.includes(q)
        );
      }

      if (isPatron) {
        const name = (m.name || "").toLowerCase();
        const busName = (m.profile?.businessDetails?.businessName || "").toLowerCase();
        const desig = (m.designation?.designationName || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const phone = (m.mobileNumber || "").toLowerCase();
        return (
          name.includes(q) ||
          busName.includes(q) ||
          desig.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      }

      if (isUms) {
        const name = (m.holder?.user?.name || m.name || "").toLowerCase();
        const desig = (m.designation?.designationName || m.positionName || "").toLowerCase();
        const email = (m.holder?.user?.email || m.email || "").toLowerCase();
        const phone = (m.holder?.user?.mobileNumber || m.mobileNumber || "").toLowerCase();
        return (
          name.includes(q) ||
          desig.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      }

      const name = (m.name || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const phone = (m.mobileNumber || "").toLowerCase();
      const position = (m.positionName || "").toLowerCase();
      const ucnType = (m.ucnType || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        position.includes(q) ||
        ucnType.includes(q)
      );
    });
  }, [targetMembers, searchQuery, isChannelPartner, isPatron, isUms, targetTypes]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedMember(null);
    if (isChannelPartner && onSearchBusiness) {
      onSearchBusiness(e.target.value);
    }
  };

  // Reset state on open/close
  React.useEffect(() => {
    if (!open) {
      setSelectedMember(null);
      setSearchQuery("");
    }
  }, [open]);

  if (!open) return null;

  const handleConfirmAssign = () => {
    if (selectedMember && onAssignMember) {
      onAssignMember(selectedMember);
      onClose();
    }
  };

  const canAssign = !!selectedMember;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 flex">
        <div className="w-[480px] bg-white flex flex-col shadow-xl border-l border-slate-200">

          {/* ── HEADER ─────────────────────────────────────────── */}
          <div className="px-6 pt-6 pb-5 shrink-0 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-[17px] font-bold text-slate-900 leading-snug">
                  Assign Position:{" "}
                  <span className="text-slate-900">{slotLabel || slotId}</span>
                </h2>
                <p className="text-[12.5px] text-slate-500 mt-1 font-medium">
                  Ward: {wardName || "—"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 py-3.5 border-b border-slate-100 shrink-0 space-y-2.5">
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder={
                  isUms
                    ? "Search by UMS designation, name, or email..."
                    : isPatron
                      ? "Search by patron name, business name, or email..."
                      : isChannelPartner
                        ? "Search by business name, CP ID, or service..."
                        : "Search by name, email, phone..."
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="
                  w-full pl-9 pr-9 py-2.5
                  bg-white border border-slate-200 rounded-xl
                  text-[13px] text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-slate-900/8 focus:border-slate-300
                  transition-all
                "
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedMember(null);
                    if (isChannelPartner && onSearchBusiness) onSearchBusiness("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>


          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2.5 min-h-0">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <UserPlus size={18} className="text-slate-400" />
                </div>
                <p className="text-[13px] font-semibold text-slate-600">
                  {isUms
                    ? "No UMS Management members found"
                    : isPatron
                      ? "No Patrons found"
                      : isChannelPartner
                        ? "No Channel Partners found"
                        : "No members found"}
                </p>
                <p className="text-[12px] text-slate-400 mt-1">
                  {searchQuery
                    ? "Try a different search term."
                    : isUms
                      ? "No management members returned for this ward."
                      : isPatron
                        ? "No patrons returned for this taluka."
                        : isChannelPartner
                          ? "No channel partners returned for this ward."
                          : "No members for this ward."}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isSelected =
                  selectedMember?.userId === member.userId ||
                  (selectedMember?.cpId && selectedMember?.cpId === member.cpId) ||
                  selectedMember?.assignmentId === member.assignmentId ||
                  (selectedMember?.holder?.user?.userId && selectedMember?.holder?.user?.userId === member.holder?.user?.userId);
                const isMatched = isMatchingMember(member);
                const photo =
                  member.holder?.user?.profile?.profileImage ||
                  member.profileImage ||
                  member.photoUrl ||
                  member.profile?.profileImage ||
                  member.profile?.photoUrl ||
                  member.profile?.businessDetails?.businessImage1 ||
                  null;
                const nameToUse =
                  member.holder?.user?.name ||
                  member.name ||
                  member.cpRegistration?.fullName ||
                  member.assignedUserName ||
                  "Unnamed";
                const initials = (nameToUse || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const servicesStr = member.cpRegistration?.selectedServices?.join(", ");
                const busNameStr = member.designation?.designationName || servicesStr || member.profile?.businessDetails?.businessName;
                // Structured district → assembly → ward location
                const profileRef = member.holder?.user?.profile || member.profile || {};
                const locationParts = [
                  profileRef.district,
                  profileRef.assembly,
                  profileRef.ward,
                ].filter(Boolean);
                const structuredLocation = locationParts.length > 0 ? locationParts.join(" · ") : null;

                const busAddress =
                  structuredLocation ||
                  member.businessLocation ||
                  member.officeLocation ||
                  member.cpRegistration?.businessOfficeAddress ||
                  null;
                const emailStr = member.holder?.user?.email || member.email;
                const phoneStr = member.holder?.user?.mobileNumber || member.mobileNumber;

                return (
                  <div
                    key={member.assignmentId || member.cpId || member.userId || member.holder?.user?.userId || Math.random()}
                    onClick={() => setSelectedMember(member)}
                    className={`
                      relative cursor-pointer rounded-2xl overflow-hidden
                      border-2 transition-all duration-150 p-4 shadow-xs
                      ${isSelected && isMatched
                        ? "border-[#d97706] bg-[#fefce8] ring-2 ring-[#f59e0b]/40 shadow-md"
                        : isSelected
                          ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800/10 shadow-md"
                          : isMatched
                            ? "border-[#fde68a] bg-[#fffbeb] hover:border-[#f59e0b]/60 hover:bg-[#fef3c7]"
                            : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`
                            w-11 h-11 rounded-xl flex items-center justify-center
                            font-bold text-[13px] overflow-hidden
                            ${isMatched ? "bg-[#fef3c7] text-[#b45309]" : "bg-slate-100 text-slate-700"}
                          `}
                        >
                          {photo ? (
                            <img
                              src={photo}
                              alt={nameToUse}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        {isSelected && (
                          <div className={`absolute -bottom-0.5 -right-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-xs ${isMatched ? "bg-[#d97706]" : "bg-slate-800"}`}>
                            <CheckCircle2 size={11} className="text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name + badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[13.5px] font-bold text-slate-900 truncate">
                            {nameToUse}
                          </h4>
                          {member.cpId && (
                            <span className="text-[9px] font-extrabold tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-[1.5px] rounded uppercase">
                              CP: {member.cpId}
                            </span>
                          )}
                          {(member.memberId || member.holder?.user?.userId) && (
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-[1.5px] rounded uppercase">
                              {member.memberId || member.holder?.user?.userId?.slice(0, 8)}
                            </span>
                          )}
                          {member.isPatron && (
                            <span className="text-[9px] font-extrabold tracking-wider text-red-700 bg-red-50 border border-red-200 px-1.5 py-[1.5px] rounded uppercase">
                              PATRON
                            </span>
                          )}
                          {member.designation?.designationName && (
                            <span className="text-[9px] font-extrabold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-[1.5px] rounded uppercase truncate max-w-[140px]">
                              {member.designation.designationName}
                            </span>
                          )}
                          {member.isPrime && (
                            <span className="text-[9px] font-extrabold tracking-wider text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-[1.5px] rounded uppercase">
                              Prime
                            </span>
                          )}
                          {isMatched && (
                            <span className="ml-auto text-[9.5px] font-extrabold text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-2 py-[2px] rounded-full whitespace-nowrap shadow-2xs flex items-center gap-1">
                              <Sparkles size={10} className="text-[#d97706]" /> Recommended Match
                            </span>
                          )}
                        </div>

                        {/* Services / Business Name */}
                        {busNameStr && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Building2 size={11} className="text-[#c8102e] shrink-0" />
                            <span className="text-[11.5px] font-bold text-[#c8102e] truncate">
                              {busNameStr}
                            </span>
                          </div>
                        )}

                        {/* Contact row */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {emailStr && (
                            <span className="flex items-center gap-1 text-[11.5px] text-slate-600">
                              <Mail size={11} className="text-slate-400 shrink-0" />
                              {emailStr}
                            </span>
                          )}
                          {phoneStr && (
                            <span className="flex items-center gap-1 text-[11.5px] text-slate-600">
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              {phoneStr}
                            </span>
                          )}
                        </div>

                        {/* Address / Location */}
                        {busAddress && (
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                              {busAddress}
                            </span>
                          </div>
                        )}

                        {/* Position Name / Role Pill for non-CP/non-Patron */}
                        {!isChannelPartner && !isPatron && (member.positionName || member.assignmentType) && (
                          <div className="flex items-center gap-1 mt-2">
                            <Building2 size={11} className={isMatched ? "text-[#d97706] shrink-0" : "text-slate-400 shrink-0"} />
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border truncate ${isMatched
                                  ? "bg-[#fef3c7] text-[#b45309] border-[#fde68a]"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                            >
                              {member.positionName || member.assignmentType?.replace(/_/g, " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
            <button
              onClick={handleConfirmAssign}
              disabled={!canAssign}
              className="
                w-full flex items-center justify-center gap-2
                py-3 px-4 rounded-xl
                text-[13.5px] font-bold text-white
                bg-slate-800 hover:bg-slate-900
                transition-colors
                disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed
              "
            >
              <UserCheck size={15} />
              Assign Selected Member
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}