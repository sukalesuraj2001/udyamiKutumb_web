import React, { useEffect } from "react";
import {
  X, User, Mail, Phone, MapPin,
  Building2, Landmark, Map, ShieldCheck,
} from "lucide-react";

/* ── Field config — label, icon, key ── */
const FIELDS = [
  { key: "name",      label: "Full Name",     Icon: User       },
  { key: "email",     label: "Email",         Icon: Mail       },
  { key: "mobile",    label: "Mobile",        Icon: Phone      },
  { key: "state",     label: "State",         Icon: MapPin     },
  { key: "district",  label: "District",      Icon: Building2  },
  { key: "taluk",     label: "Taluk",         Icon: Landmark   },
  { key: "wardHobli", label: "Ward / Hobli",  Icon: Map        },
];

/* ── Avatar (large) ── */
const BigAvatar = ({ name }) => {
  const initials = name
    ?.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() ?? "?";
  return (
    <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border-2 border-[#DBEAFE] flex items-center justify-center shrink-0">
      <span className="text-[22px] font-bold text-[#2563EB]">{initials}</span>
    </div>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const active = status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : "bg-amber-50  text-amber-700  border-amber-100"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
};

/* ── Field row ── */
const FieldRow = ({ Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F1F5F9] last:border-0">
      <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-[#64748B]" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] mb-0.5">
          {label}
        </p>
        <p className="text-[13px] font-medium text-[#1E293B] break-all">{value}</p>
      </div>
    </div>
  );
};

/* ── MAIN MODAL ── */
export default function HeadViewModal({ row, onClose }) {
  if (!row) return null;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Derive role label from data
  const roleMap = {
    state_head:    "State Head",
    district_head: "District Head",
    taluka_head:   "Taluk Head",
    ward_chairman: "Ward / Hobli Head",
  };
  const roleLabel = roleMap[row.roleName] ?? "Head";

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* ── Modal card ── */}
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* ── Header ── */}
        <div className="relative px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
          {/* Blue accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-t-2xl" />

          <div className="flex items-start justify-between mt-1">
            <div className="flex items-center gap-3">
              <BigAvatar name={row.name} />
              <div>
                <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight">
                  {row.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {/* Role chip */}
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                    <ShieldCheck size={10} strokeWidth={2.5} />
                    {roleLabel}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors shrink-0 mt-0.5"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-2 max-h-[60vh] overflow-y-auto">
          {FIELDS.map(({ key, label, Icon }) => (
            <FieldRow key={key} Icon={Icon} label={label} value={row[key]} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-[#F1F5F9] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] font-semibold border border-[#E2E8F0] rounded-lg text-[#475569] hover:bg-[#F1F5F9] transition-colors"
          >
            Close
          </button>
          <button
            className="px-4 py-1.5 text-[12px] font-semibold rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}