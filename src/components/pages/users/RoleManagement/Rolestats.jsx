import React from "react";
import { Shield, Users, GitBranch, Crown } from "lucide-react";

const ICON_MAP = {
  shield:    Shield,
  users:     Users,
  gitbranch: GitBranch,
  crown:     Crown,
};

// ─── Single stat card ─────────────────────────────────────────────────────────
function StatCard({ label, value, iconKey, iconBg, iconColor }) {
  const Icon = ICON_MAP[iconKey];
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 truncate">
          {label}
        </p>
        <p className="text-[26px] font-bold text-gray-900 leading-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
// Props:
//   stats  – array of { label, value, iconKey, iconBg, iconColor }
//            (comes from STATS in roleHierarchy.js)
export default function RoleStats({ stats }) {
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}