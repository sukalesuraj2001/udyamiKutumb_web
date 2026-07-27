import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Replace with real 12-month data from your API
export const SAMPLE_MEMBER_GROWTH = [
  { month: "Aug 25", new: 0, total: 0 },
  { month: "Sept 25", new: 0, total: 0 },
  { month: "Oct 25", new: 0, total: 0 },
  { month: "Nov 25", new: 0, total: 0 },
  { month: "Dec 25", new: 0, total: 0 },
  { month: "Jan 26", new: 0, total: 0 },
  { month: "Feb 26", new: 0, total: 0 },
  { month: "Mar 26", new: 0, total: 0 },
  { month: "Apr 26", new: 0, total: 0 },
  { month: "May 26", new: 0, total: 0 },
  { month: "Jun 26", new: 22, total: 22 },
  { month: "Jul 26", new: 0, total: 17 },
];

export default function MemberGrowthChart({ data = SAMPLE_MEMBER_GROWTH }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[15px] font-semibold text-ink mb-5">Member growth (12 months)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE2" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }} />
          <Line type="monotone" dataKey="new" name="New" stroke="#B5730B" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="total" name="Total" stroke="#2F6F4E" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1">
        <Legend color="#B5730B" label="New" />
        <Legend color="#2F6F4E" label="Total" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}