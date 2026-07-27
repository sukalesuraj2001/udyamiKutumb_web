import React from "react";

const badgeToneClass = {
  good: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  warn: "bg-amber-50 text-amber-700 border border-amber-100",
};

export default function SupStartCard({ label, value, icon: Icon, badgeText, badgeTone = "good", highlight = false }) {
  return (
    <div className={`
      group relative bg-white rounded-2xl border overflow-hidden p-6
      shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]
      hover:shadow-[0_8px_24px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.04)]
      transition-all duration-200 hover:-translate-y-0.5 cursor-default
      ${highlight ? "border-amber-200/60" : "border-[#E2E8F0]"}
    `}>
      {/* Top accent */}
      <div className={`absolute inset-x-0 top-0 h-[3px] transition-opacity duration-300 ${
        highlight
          ? "bg-gradient-to-r from-amber-400 to-orange-300"
          : "bg-gradient-to-r from-[#2563EB] to-[#60A5FA] opacity-0 group-hover:opacity-100"
      }`} />

      <div className="flex items-start justify-between mb-5">
        <p className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#94A3B8] leading-none">
          {label}
        </p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            highlight ? "bg-amber-50" : "bg-[#EFF6FF]"
          }`}>
            <Icon size={16} strokeWidth={1.9} className={highlight ? "text-amber-500" : "text-[#2563EB]"} />
          </div>
        )}
      </div>

      <p className="text-[32px] font-bold text-[#1E293B] leading-none tabular-nums mb-4">
        {value}
      </p>

      {badgeText && (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badgeToneClass[badgeTone]}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
}