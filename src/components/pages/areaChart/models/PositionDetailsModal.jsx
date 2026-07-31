import React from "react";
import {
  X,
  Phone,
  Mail,
  Building2,
  BadgeCheck,
  Hash,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

/**
 * Premium member details popup.
 *
 * Props:
 *   open          {boolean}
 *   position      {object}  — shape below
 *   onClose       {fn}
 *
 * position shape (from API / assignments state):
 *   slotId, role, memberName, mobileNumber, email,
 *   company, memberId, memberNumber, status, profileImage / photoUrl
 */
export default function PositionDetailsModal({ open, position, onClose }) {
  if (!open || !position) return null;

  const {
    role,
    memberName,
    mobileNumber,
    email,
    company,
    memberNumber,
    status,
    profileImage,
    photoUrl,
  } = position;

  const photo = profileImage || photoUrl || null;
  const isActive = status === "active" || status === "registered" || status === true;
  const displayStatus = isActive ? "Active" : "Inactive";

  /* ── initials fallback ── */
  const initials = (memberName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: "rgba(10, 14, 40, 0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* ── Card ── */}
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top gradient strip (brand colours) ── */}
        <div
          className="h-[88px] w-full relative"
          style={{
            background: "linear-gradient(135deg, #1a2e5e 0%, #c8102e 100%)",
          }}
        >
          {/* close btn */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>

          {/* role pill */}
          <span className="absolute bottom-3 left-4 text-[10px] font-bold text-white/80 uppercase tracking-widest">
            {role || "Member"}
          </span>
        </div>

        {/* ── Avatar (overlaps strip) ── */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div
            className="w-[72px] h-[72px] rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a2e5e, #c8102e)" }}
          >
            {photo ? (
              <img src={photo} alt={memberName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[22px] font-bold select-none">{initials}</span>
            )}
          </div>
        </div>

        {/* ── Name + status ── */}
        <div className="text-center px-6 pt-3 pb-1">
          <h2 className="text-[17px] font-extrabold text-[#1a2e5e] tracking-tight leading-snug">
            {memberName || "—"}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-[2px] rounded-full ${
                isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-500"
              }`}
            >
              <ShieldCheck size={9} />
              {displayStatus}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-6 my-3 h-px bg-slate-100" />

        {/* ── Info rows ── */}
        <div className="px-6 pb-6 space-y-3">

          {/* Member number */}
          {memberNumber && (
            <InfoRow
              icon={<Hash size={13} className="text-[#c8102e]" />}
              label="Member No."
              value={memberNumber}
            />
          )}

          {/* Phone */}
          {mobileNumber && (
            <InfoRow
              icon={<Phone size={13} className="text-[#c8102e]" />}
              label="Mobile"
              value={
                <a
                  href={`tel:${mobileNumber}`}
                  className="text-[#1a2e5e] font-semibold hover:underline"
                >
                  {mobileNumber}
                </a>
              }
            />
          )}

          {/* Email */}
          {email && (
            <InfoRow
              icon={<Mail size={13} className="text-[#c8102e]" />}
              label="Email"
              value={
                <a
                  href={`mailto:${email}`}
                  className="text-[#1a2e5e] font-semibold hover:underline truncate block max-w-[190px]"
                >
                  {email}
                </a>
              }
            />
          )}

          {/* Company */}
          {company && (
            <InfoRow
              icon={<Building2 size={13} className="text-[#c8102e]" />}
              label="Company"
              value={company}
            />
          )}
        </div>

        {/* ── Bottom CTA strip ── */}
        {/* <div
          className="px-6 py-4 flex gap-2 border-t border-slate-100"
          style={{ background: "#f8f9fc" }}
        >
          <a
            href={`tel:${mobileNumber}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1a2e5e, #273f80)" }}
          >
            <Phone size={12} /> Call
          </a>
          <a
            href={`mailto:${email}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c8102e, #e53935)" }}
          >
            <Mail size={12} /> Email
          </a>
        </div> */}
      </div>
    </div>
  );
}

/* ── Reusable info row ── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
          {label}
        </p>
        <div className="text-[12.5px] font-semibold text-slate-700 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}