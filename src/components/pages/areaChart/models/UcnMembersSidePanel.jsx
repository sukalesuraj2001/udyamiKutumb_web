import React, { useState, useMemo } from "react";
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
  UserRoundPlus,
  Sparkles,
} from "lucide-react";

const SLOT_TO_UCN_TYPE_MAP = {
  "core-president": ["circle_leader", "circle-leader", "president"],
  "core-vice-president": ["vice_president", "vice-president"],
  "core-general-secretary": ["general_secretary", "general-secretary"],
  "core-treasurer": ["treasurer"],
  "ward-chairman": ["ward_chairman", "ward-chairman"],
};

/* ─── Invite New tab placeholder ─── */
function InviteNewTab({ slotLabel }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
      <p className="text-[12.5px] text-slate-500 leading-relaxed">
        Invite a new member to fill the{" "}
        <span className="font-semibold text-slate-700">{slotLabel}</span> position.
        They'll receive an email with next steps.
      </p>
      {[
        { label: "Full Name", key: "name", placeholder: "e.g. Rajan Kumar", type: "text" },
        { label: "Email Address", key: "email", placeholder: "e.g. rajan@example.com", type: "email" },
        { label: "Mobile Number", key: "phone", placeholder: "e.g. 9876543210", type: "tel" },
      ].map(({ label, key, placeholder, type }) => (
        <div key={key}>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
          </label>
          <input
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all bg-slate-50 focus:bg-white"
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
/* ─── Main Component ─── */
export default function UcnMembersSidePanel({
  open,
  onClose,
  slotId,
  slotLabel,
  wardName,
  ucnMembers = [],
  channelPartners = [],
  patrons = [],
  umsMembers = [],
  panelType = "ucn", // "ucn" | "channelPartner" | "patron" | "ums"
  onSearchBusiness,
  onAssignMember,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState("existing"); // "existing" | "invite"

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

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (isChannelPartner && onSearchBusiness) {
      onSearchBusiness(val);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!Array.isArray(targetMembers)) return [];
    if (!searchQuery.trim()) return targetMembers;
    const q = searchQuery.toLowerCase().trim();
    return targetMembers.filter((m) => {
      if (isUms) {
        const desName = (m.designation?.designationName || "").toLowerCase();
        const name = (m.holder?.user?.name || m.name || m.assignedUserName || "").toLowerCase();
        const email = (m.holder?.user?.email || m.email || "").toLowerCase();
        const phone = (m.holder?.user?.mobileNumber || m.mobileNumber || "").toLowerCase();
        const addr = (m.holder?.user?.profile?.homeAddress || m.address || "").toLowerCase();
        return (
          desName.includes(q) ||
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          addr.includes(q)
        );
      }
      if (isPatron) {
        const name = (m.name || "").toLowerCase();
        const memberId = (m.memberId || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const phone = (m.mobileNumber || "").toLowerCase();
        const busName = (m.profile?.businessDetails?.businessName || "").toLowerCase();
        const loc = (m.businessLocation || m.officeLocation || m.profile?.homeAddress || m.profile?.officeAddress || "").toLowerCase();
        return (
          name.includes(q) ||
          memberId.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          busName.includes(q) ||
          loc.includes(q)
        );
      }
      if (isChannelPartner) {
        const name = (m.name || m.cpRegistration?.fullName || "").toLowerCase();
        const cpId = (m.cpId || "").toLowerCase();
        const memberId = (m.memberId || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const phone = (m.mobileNumber || "").toLowerCase();
        const busLoc = (m.businessLocation || m.officeLocation || m.cpRegistration?.businessOfficeAddress || "").toLowerCase();
        const services = (m.cpRegistration?.selectedServices || []).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          cpId.includes(q) ||
          memberId.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          busLoc.includes(q) ||
          services.includes(q)
        );
      }
      const name = (m.name || m.assignedUserName || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const phone = (m.mobileNumber || "").toLowerCase();
      const posName = (m.positionName || "").toLowerCase();
      const assignType = (m.assignmentType || "").toLowerCase();
      const address = (m.address || "").toLowerCase();
      return (
        name.includes(q) || email.includes(q) || phone.includes(q) ||
        posName.includes(q) || assignType.includes(q) || address.includes(q)
      );
    });
  }, [targetMembers, searchQuery, isChannelPartner, isPatron, isUms]);

  const isMatchingMember = (member) => {
    if (!member || isChannelPartner || isPatron) return false;
    if (isUms) {
      const desName = (member.designation?.designationName || "").toLowerCase();
      return slotLabel && desName.includes(slotLabel.toLowerCase());
    }
    const assignType = (member.assignmentType || "").toLowerCase();
    const posName = (member.positionName || "").toLowerCase();
    const memberSlot = (member.slotId || "").toLowerCase();
    return (
      targetTypes.some((t) => assignType.includes(t) || memberSlot.includes(t)) ||
      (slotLabel && posName.includes(slotLabel.toLowerCase()))
    );
  };

  React.useEffect(() => {
    if (open && targetMembers.length > 0) {
      if (isChannelPartner || isPatron) {
        setSelectedMember(targetMembers[0] || null);
      } else {
        const bestMatch = targetMembers.find(isMatchingMember);
        setSelectedMember(bestMatch || targetMembers[0] || null);
      }
    } else {
      setSelectedMember(null);
      setSearchQuery("");
      setActiveTab("existing");
    }
  }, [open, slotId, targetMembers, isChannelPartner, isPatron, isUms]);

  if (!open) return null;

  const handleConfirmAssign = () => {
    if (selectedMember && onAssignMember) {
      onAssignMember(selectedMember);
      onClose();
    }
  };

  const canAssign = activeTab === "existing" ? !!selectedMember : true;

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

          {/* ── EXISTING MEMBER TAB ──────────────────────────── */}
          {activeTab === "existing" && (
            <>
              {/* Search */}
              <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
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
                        if (isChannelPartner && onSearchBusiness) onSearchBusiness("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Member List */}
              <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2.5">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-16 px-4">
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
                    const busAddress =
                      member.holder?.user?.profile?.homeAddress ||
                      member.businessLocation ||
                      member.officeLocation ||
                      member.cpRegistration?.businessOfficeAddress ||
                      member.profile?.homeAddress ||
                      member.profile?.officeAddress;
                    const emailStr = member.holder?.user?.email || member.email;
                    const phoneStr = member.holder?.user?.mobileNumber || member.mobileNumber;

                    return (
                      <div
                        key={member.assignmentId || member.cpId || member.userId || member.holder?.user?.userId || Math.random()}
                        onClick={() => setSelectedMember(member)}
                        className={`
                          relative cursor-pointer rounded-2xl overflow-hidden
                          border-2 transition-all duration-150 p-4 shadow-xs
                          ${
                            isSelected && isMatched
                              ? "border-[#d97706] bg-[#fefce8] ring-2 ring-[#f59e0b]/40 shadow-md"
                              : isSelected
                              ? "border-slate-800 bg-white shadow-md ring-2 ring-slate-800/20"
                              : isMatched
                              ? "border-[#eab308] bg-[#fefce8] hover:border-[#d97706] hover:shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-bold text-[12px] shadow-xs ${
                                isMatched
                                  ? "bg-[#d97706] text-white border border-[#b45309]"
                                  : isPatron
                                  ? "bg-[#c8102e] text-white"
                                  : isChannelPartner
                                  ? "bg-[#1a2e5e] text-white"
                                  : "bg-slate-700 text-white"
                              }`}
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
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border truncate ${
                                    isMatched
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
            </>
          )}

          {/* ── INVITE NEW TAB ───────────────────────────────── */}
          {activeTab === "invite" && <InviteNewTab slotLabel={slotLabel} />}

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
              {activeTab === "invite" ? (
                <>
                  <UserRoundPlus size={15} />
                  Send Invite
                </>
              ) : (
                <>
                  <UserCheck size={15} />
                  Assign Selected Member
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}