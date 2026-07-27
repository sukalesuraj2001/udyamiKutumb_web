import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Replace with real funnel-stage counts from your API
export const SAMPLE_FUNNEL = [
  { stage: "Passed", count: 34 },
  { stage: "Contacted", count: 0 },
  { stage: "In progress", count: 0 },
  { stage: "Closed won", count: 3 },
];

const STAGE_COLOR = { Passed: "#3B5BA8", Contacted: "#8C8777", "In progress": "#B5730B", "Closed won": "#2F6F4E" };

export default function LeadFunnelChart({ data = SAMPLE_FUNNEL }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[15px] font-semibold text-ink mb-5">Platform lead funnel</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE2" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 12, fill: "#4A473E" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.stage} fill={STAGE_COLOR[d.stage] || "#1B2430"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}