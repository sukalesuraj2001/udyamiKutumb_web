import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

// Replace with real data later — shape: [{ ward, pct }, ...]
export const SAMPLE_COVERAGE = [
  { ward: "Ward 1", pct: 100 },
  { ward: "Attigupe", pct: 67 },
  { ward: "Sunkadakatte", pct: 33 },
  { ward: "Nelamangala", pct: 33 },
  { ward: "Yeshwanthpura", pct: 33 },
  { ward: "Nagasandra", pct: 33 },
  { ward: "Mathikere", pct: 33 },
];

const colorFor = (pct) => (pct >= 80 ? "#2F6F4E" : pct >= 50 ? "#B5730B" : "#A23B2E");

export default function LeadCoverageChart({ data = SAMPLE_COVERAGE }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-amber mb-1">Coverage</p>
      <h3 className="font-display text-[19px] text-ink mb-5">Lead Coverage by Ward</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE2" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="ward" width={110} tick={{ fontSize: 12.5, fill: "#4A473E" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }} />
          <Bar dataKey="pct" radius={[0, 6, 6, 0]} barSize={16}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.pct)} />
            ))}
            <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "#4A473E" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}