import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

// Replace with real data later — shape: [{ sector, score }, ...]
export const SAMPLE_SECTORS = [
  { sector: "Solar", score: 100 },
  { sector: "Manufacturing", score: 50 },
  { sector: "Technology", score: 50 },
  { sector: "Pvt Ltd", score: 50 },
  { sector: "Healthcare", score: 50 },
  { sector: "Realty", score: 50 },
];

export default function SectorOpportunityChart({ data = SAMPLE_SECTORS }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="text-[15px] font-semibold text-zinc-900 mb-5">Sector Opportunity Index</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="sector" width={100} tick={{ fontSize: 12.5, fill: "#52525b" }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="score" fill="#0f172a" radius={[0, 6, 6, 0]} barSize={16}>
            <LabelList dataKey="score" position="right" style={{ fontSize: 12, fill: "#52525b" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}