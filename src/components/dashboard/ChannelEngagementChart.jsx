import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Replace with real data later — shape: [{ month, sms, whatsapp, email, inPerson }, ...]
export const SAMPLE_ENGAGEMENT = [
  { month: "Feb", sms: 0, whatsapp: 0, email: 0, inPerson: 0 },
  { month: "Mar", sms: 0, whatsapp: 1, email: 0, inPerson: 0.5 },
  { month: "Apr", sms: 0, whatsapp: 4, email: 0, inPerson: 3 },
  { month: "May", sms: 0, whatsapp: 8, email: 0, inPerson: 5 },
  { month: "Jun", sms: 0, whatsapp: 10, email: 0, inPerson: 10 },
  { month: "Jul", sms: 0, whatsapp: 0, email: 0, inPerson: 1 },
];

const SERIES = [
  { key: "sms", name: "SMS", color: "#3B5BA8" },       // steel
  { key: "whatsapp", name: "WhatsApp", color: "#2F6F4E" }, // forest
  { key: "email", name: "Email", color: "#B5730B" },   // amber
  { key: "inPerson", name: "In-Person", color: "#1B2430" }, // ink
];

export default function ChannelEngagementChart({ data = SAMPLE_ENGAGEMENT }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-amber mb-1">Engagement</p>
      <h3 className="font-display text-[19px] text-ink mb-5">Channel Engagement Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEBE2" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8C8777" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8E3D8", fontSize: 12.5 }} />
          {SERIES.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-1 justify-center">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}