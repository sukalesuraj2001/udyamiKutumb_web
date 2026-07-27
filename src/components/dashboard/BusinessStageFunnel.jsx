import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export const SAMPLE_FUNNEL = [
  { stage: "Startup", count: 1, pct: 4.3 },
  { stage: "Idea", count: 19, pct: 82.6 },
  { stage: "Established", count: 1, pct: 4.3 },
];

const STAGE_COLORS = {
  Startup: "#3B5BA8",
  Idea: "#B5730B",
  Established: "#2F6F4E",
};

export default function BusinessStageFunnel({ data = SAMPLE_FUNNEL }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-amber mb-1">Pipeline</p>
      <h3 className="font-display text-[19px] text-ink mb-6">Business Stage Funnel</h3>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <PieChart width={180} height={180}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="stage"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.stage} fill={STAGE_COLORS[d.stage] || "#1B2430"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }}
              formatter={(value, name) => [`${value} (${data.find((d) => d.stage === name)?.pct}%)`, name]}
            />
          </PieChart>
          {/* center label — total count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-[26px] text-ink leading-none tabular-nums">{total}</span>
            <span className="text-[10px] uppercase tracking-wide text-muted mt-1">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((d) => (
            <div key={d.stage} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STAGE_COLORS[d.stage] || "#1B2430" }} />
                {d.stage}
              </span>
              <span className="text-[12.5px] text-muted tabular-nums shrink-0">
                {d.count} · {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}