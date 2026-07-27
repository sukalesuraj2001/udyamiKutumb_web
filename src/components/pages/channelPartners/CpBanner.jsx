// import React from "react";
// import { Users, UserCheck, UserX, ShieldCheck, Crown, UserPlus, AlertTriangle } from "lucide-react";

// export default function CpBanner({ stats }) {
//     const cards = [
//         { key: "totalCp", label: "Total Channel Partners", value: stats.totalCp, icon: Users, delta: stats.totalDelta, tone: "steel" },
//         { key: "activeCp", label: "Active Channel Partners", value: stats.activeCp, icon: UserCheck, delta: stats.activeDelta, tone: "forest" },
//         { key: "deActiveCp", label: "Deactive Channel Partners", value: stats.deActiveCp, icon: UserX, delta: stats.basicDelta, tone: "steel" },
//     ];

//     return (
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
//             {cards.map((c) => (
//                 <div key={c.key} className="rounded-2xl border border-hairline bg-white p-4">
//                     <div className="flex items-center justify-between mb-3">
//                         <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${{ steel: "bg-steel/10 text-steel", forest: "bg-forest/10 text-forest", amber: "bg-amber-tint text-amber", brick: "bg-brick/10 text-brick" }[c.tone]
//                             }`}>
//                             <c.icon size={16} />
//                         </span>
//                         {c.delta != null && (
//                             <span className={`text-[11px] font-semibold ${c.delta > 0 ? "text-forest" : c.delta < 0 ? "text-brick" : "text-muted"}`}>
//                                 {c.delta > 0 ? "↗" : c.delta < 0 ? "↘" : "—"} {c.delta !== 0 ? `${Math.abs(c.delta)}%` : "0%"}
//                             </span>
//                         )}
//                     </div>
//                     <p className="font-display text-[24px] text-ink leading-none tabular-nums mb-1.5">{c.value}</p>
//                     <p className="text-[12px] text-muted">{c.label}</p>
//                     <p className="text-[10.5px] text-muted/70 mt-0.5">last month</p>
//                 </div>
//             ))}
//         </div>
//     );
// }

import React from "react";
import { Users, UserCheck, UserX } from "lucide-react";

export default function CpBanner({ stats }) {
  const cards = [
    {
      key: "totalCp",
      label: "Total Channel Partners",
      value: stats.totalCp,
      icon: Users,
      delta: stats.totalDelta,
      tone: "blue",
      badge: "All states",
    },
    {
      key: "activeCp",
      label: "Active Partners",
      value: stats.activeCp,
      icon: UserCheck,
      delta: stats.activeDelta,
      tone: "green",
      badge: `${Math.round((stats.activeCp / stats.totalCp) * 100)}% active`,
    },
    {
      key: "deActiveCp",
      label: "Inactive Partners",
      value: stats.deActiveCp,
      icon: UserX,
      delta: stats.basicDelta,
      tone: "amber",
      badge: "Needs action",
    },
  ];

  const toneMap = {
    blue:  { icon: "bg-blue-50 text-blue-600",  delta: "text-blue-600",  badge: "bg-blue-50 text-blue-600" },
    green: { icon: "bg-emerald-50 text-emerald-600", delta: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700" },
    amber: { icon: "bg-amber-50 text-amber-600",  delta: "text-amber-600",  badge: "bg-amber-50 text-amber-700" },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const t = toneMap[c.tone];
        return (
          <div key={c.key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.icon}`}>
                <c.icon size={17} />
              </span>
              {c.delta != null && (
                <span className={`text-[11.5px] font-semibold ${c.delta > 0 ? "text-emerald-600" : c.delta < 0 ? "text-red-500" : "text-gray-400"}`}>
                  {c.delta > 0 ? "↗" : c.delta < 0 ? "↘" : "—"} {c.delta !== 0 ? `${Math.abs(c.delta)}%` : "0%"}
                </span>
              )}
            </div>
            <p className="text-[28px] font-semibold text-gray-900 leading-none tabular-nums mb-1.5">
              {c.value}
            </p>
            <p className="text-[12.5px] text-gray-500 mb-2">{c.label}</p>
            {c.badge && (
              <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${t.badge}`}>
                {c.badge}
              </span>
            )}
            <p className="text-[10.5px] text-gray-400 mt-1.5">vs last month</p>
          </div>
        );
      })}
    </div>
  );
}