import React from "react";

const badgeToneClass = {
  good: "border border-[#2F6F4E]/25 bg-[#2F6F4E]/5 text-[#2F6F4E]",
  warn: "border border-[#B5730B]/30 bg-[#FBF1DF] text-[#B5730B]",
};

/**
 * @param {string} label
 * @param {string|number} value
 * @param {React.ComponentType} [icon] - a lucide-react icon component
 * @param {string} [badgeText]
 * @param {"good"|"warn"} [badgeTone]
 * @param {boolean} [highlight] - amber wash, for "needs attention" cards
 */
export default function CpCard({ label, value, icon: Icon, badgeText, badgeTone = "good", highlight = false }) {
  return (
    <div className={`rounded-2xl border bg-white p-5 transition-colors ${highlight ? "border-[#B5730B]/30 bg-[#FBF1DF]/40" : "border-[#E8E3D8]"}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-semibold tracking-wide uppercase text-[#8C8777]">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[#1B2430]/5 flex items-center justify-center shrink-0">
            <Icon size={17} className="text-[#1B2430]" strokeWidth={2} />
          </div>
        )}
      </div>
      <p className="font-display text-[30px] font-medium text-[#1B2430] leading-none mb-3 tabular-nums">{value}</p>
      {badgeText && (
        <span className={`inline-flex items-center text-[11.5px] font-medium px-2 py-1 rounded-full ${badgeToneClass[badgeTone]}`}>
          {badgeText}
        </span>
      )}
    </div>
  );
}