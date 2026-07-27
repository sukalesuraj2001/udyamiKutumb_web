import React from "react";
import { Users, UserCheck, ShieldCheck, Crown, UserPlus, AlertTriangle } from "lucide-react";

export default function MemberStatsCards({ stats }) {
  const cards = [
    { key: "total", label: "Total Members", value: stats.total, icon: Users, delta: stats.totalDelta, tone: "steel" },
    { key: "active", label: "Active This Month", value: stats.active, icon: UserCheck, delta: stats.activeDelta, tone: "forest" },
    { key: "basic", label: "Basic Plan", value: stats.basic, icon: ShieldCheck, delta: stats.basicDelta, tone: "steel" },
    { key: "prime", label: "Prime Plan", value: stats.prime, icon: Crown, delta: stats.primeDelta, tone: "amber" },
    { key: "newThisMonth", label: "New This Month", value: stats.newThisMonth, icon: UserPlus, delta: stats.newDelta, tone: "steel" },
    { key: "atRisk", label: "At Risk", value: stats.atRisk, icon: AlertTriangle, delta: stats.atRiskDelta, tone: "brick" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div key={c.key} className="rounded-2xl border border-hairline bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              { steel: "bg-steel/10 text-steel", forest: "bg-forest/10 text-forest", amber: "bg-amber-tint text-amber", brick: "bg-brick/10 text-brick" }[c.tone]
            }`}>
              <c.icon size={16} />
            </span>
            {c.delta != null && (
              <span className={`text-[11px] font-semibold ${c.delta > 0 ? "text-forest" : c.delta < 0 ? "text-brick" : "text-muted"}`}>
                {c.delta > 0 ? "↗" : c.delta < 0 ? "↘" : "—"} {c.delta !== 0 ? `${Math.abs(c.delta)}%` : "0%"}
              </span>
            )}
          </div>
          <p className="font-display text-[24px] text-ink leading-none tabular-nums mb-1.5">{c.value}</p>
          <p className="text-[12px] text-muted">{c.label}</p>
          <p className="text-[10.5px] text-muted/70 mt-0.5">vs last month</p>
        </div>
      ))}
    </div>
  );
}