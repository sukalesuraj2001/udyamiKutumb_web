import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Replace with real 12-month data from your API
export const SAMPLE_LEADS_BUSINESS = [
  { month: "Aug 25", leads: 0, business: 0 },
  { month: "Sept 25", leads: 0, business: 0 },
  { month: "Oct 25", leads: 0, business: 0 },
  { month: "Nov 25", leads: 0, business: 0 },
  { month: "Dec 25", leads: 0, business: 0 },
  { month: "Jan 26", leads: 0, business: 0 },
  { month: "Feb 26", leads: 0, business: 0 },
  { month: "Mar 26", leads: 0, business: 0 },
  { month: "Apr 26", leads: 0, business: 0 },
  { month: "May 26", leads: 2, business: 3000 },
  { month: "Jun 26", leads: 32, business: 58000 },
  { month: "Jul 26", leads: 0, business: 50000 },
];

export default function LeadsBusinessChart({ data = SAMPLE_LEADS_BUSINESS }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[15px] font-semibold text-ink mb-5">Leads & business (12 months)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE2" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }} />
          <Line yAxisId="left" type="monotone" dataKey="leads" name="Leads" stroke="#3B5BA8" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="business" name="Business ₹" stroke="#B5730B" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1">
        <Legend color="#3B5BA8" label="Leads" />
        <Legend color="#B5730B" label="Business ₹" />
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