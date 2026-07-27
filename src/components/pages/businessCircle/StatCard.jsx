import React from "react";

const TONE_MAP = {
  blue:  { iconBg: "bg-[#EEF2FF]", iconColor: "text-[#3B5BDB]", badgeBg: "bg-[#EEF2FF]", badgeText: "text-[#3B5BDB]" },
  red:   { iconBg: "bg-[#FEF2F2]", iconColor: "text-[#DC2626]", badgeBg: "bg-[#FEF2F2]", badgeText: "text-[#DC2626]" },
  green: { iconBg: "bg-[#F0FDF4]", iconColor: "text-[#16A34A]", badgeBg: "bg-[#F0FDF4]", badgeText: "text-[#16A34A]" },
  amber: { iconBg: "bg-[#FFFBEB]", iconColor: "text-[#D97706]", badgeBg: "bg-[#FFFBEB]", badgeText: "text-[#D97706]" },
};

const VALUE_TONE_MAP = {
  red:   "text-[#DC2626]",
  green: "text-[#16A34A]",
  blue:  "text-[#3B5BDB]",
  ink:   "text-[#111827]",
};

export default function StatCard({ label, value, icon: Icon, tone = "blue", valueTone, badge }) {
  const t = TONE_MAP[tone] ?? TONE_MAP.blue;
  const valueColor = VALUE_TONE_MAP[valueTone] ?? VALUE_TONE_MAP.ink;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col gap-3 min-w-0">
      {/* Top row — label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11.5px] font-medium tracking-wide uppercase text-[#6B7280]">
          {label}
        </span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>
          <Icon size={17} className={t.iconColor} />
        </span>
      </div>

      {/* Value */}
      <p className={`text-[28px] font-bold leading-none tracking-tight tabular-nums ${valueColor}`}>
        {value}
      </p>

      {/* Badge */}
      {badge && (
        <span className={`inline-flex items-center self-start text-[12px] font-medium px-2.5 py-1 rounded-lg ${t.badgeBg} ${t.badgeText}`}>
          {badge}
        </span>
      )}
    </div>
  );
}