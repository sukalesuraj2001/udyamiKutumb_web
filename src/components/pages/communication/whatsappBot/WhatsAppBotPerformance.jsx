import React from "react";
import { MessageCircle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STATS = {
  conversationsThisMonth:      847,
  avgMessagesPerConversation:  6.2,
  resolutionRate:              78,
  mostAskedTopic:              "Govt Schemes",
};

const DAILY_CONVERSATIONS = [
  { day: "D1", count: 58 }, { day: "D2", count: 68 }, { day: "D3", count: 72 },
  { day: "D4", count: 65 }, { day: "D5", count: 60 }, { day: "D6", count: 70 },
  { day: "D7", count: 55 }, { day: "D8", count: 48 }, { day: "D9", count: 45 },
  { day: "D10", count: 35 }, { day: "D11", count: 38 }, { day: "D12", count: 37 },
  { day: "D13", count: 45 }, { day: "D14", count: 62 },
];

const TOP_TOPICS = [
  { topic: "Government Schemes", count: 220 },
  { topic: "Lead Generation",    count: 165 },
  { topic: "Membership",         count: 150 },
  { topic: "Events",             count: 130 },
  { topic: "Training",           count: 90  },
  { topic: "Other",              count: 15  },
];

const RECENT_CONVERSATIONS = [
  { member: "Priya Sharma",   ward: "Ward 09", messages: 8,  topics: ["Schemes", "Mudra"], escalated: false, duration: "4m 12s", date: "Today 10:42" },
  { member: "Rohit Patil",    ward: "Ward 14", messages: 12, topics: ["Renewal"],          escalated: false, duration: "6m 02s", date: "Today 09:15" },
  { member: "Anita Deshmukh", ward: "Ward 22", messages: 4,  topics: ["Events"],           escalated: false, duration: "1m 50s", date: "Today 08:30" },
];

// Recharts shared axis tick style
const TICK = { fontSize: 11, fill: "#9ca3af" }; // gray-400

export default function WhatsAppBotPerformance() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">

      {/* Header */}
      <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
        <MessageCircle size={18} className="text-blue-500" />
        WhatsApp Bot Performance
      </h2>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Conversations This Month"       value={STATS.conversationsThisMonth}     color="blue"   />
        <StatCard label="Avg Messages / Conversation"    value={STATS.avgMessagesPerConversation}  color="violet" />
        <StatCard label="Resolution Rate"                value={`${STATS.resolutionRate}%`}        color="green"  />
        <StatCard label="Most Asked Topic"               value={STATS.mostAskedTopic}              color="amber"  isText />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Area chart — daily conversations */}
        <div className="border border-gray-200 rounded-2xl p-5 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 mb-4">Daily Conversations</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={DAILY_CONVERSATIONS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="convoFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day"   tick={TICK} axisLine={false} tickLine={false} />
              <YAxis               tick={TICK} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12.5, color: "#374151" }}
              />
              <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#convoFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart — top topics */}
        <div className="border border-gray-200 rounded-2xl p-5 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 mb-4">Top Query Topics</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TOP_TOPICS} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number"   tick={TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" width={110}
                     tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12.5, color: "#374151" }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent conversations ── */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[14px] font-bold text-gray-800">Recent Conversations</p>
        </div>

        {RECENT_CONVERSATIONS.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-10">No conversations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Member", "Ward", "Messages", "Topics", "Escalated", "Duration", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_CONVERSATIONS.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">

                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800 whitespace-nowrap">{c.member}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-400 whitespace-nowrap">{c.ward}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-800 tabular-nums">{c.messages}</td>

                    {/* Topic chips */}
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.topics.map((t) => (
                          <span key={t} className="text-[10.5px] font-medium border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Escalated badge */}
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        c.escalated
                          ? "bg-red-50 text-red-500"
                          : "bg-green-50 text-green-600"
                      }`}>
                        {c.escalated ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-[12.5px] text-gray-400 whitespace-nowrap">{c.duration}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-400 whitespace-nowrap">{c.date}</td>

                    <td className="px-5 py-3 text-right">
                      <button className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:   { bar: "bg-blue-500",   value: "text-blue-600"   },
  violet: { bar: "bg-violet-500", value: "text-violet-600" },
  green:  { bar: "bg-green-500",  value: "text-green-600"  },
  amber:  { bar: "bg-amber-400",  value: "text-amber-600"  },
};

function StatCard({ label, value, color, isText }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 leading-tight">
          {label}
        </p>
        <span className={`w-6 h-1.5 rounded-full shrink-0 ${c.bar}`} />
      </div>
      <p className={`font-bold leading-none ${c.value} ${isText ? "text-[18px]" : "text-[24px] tabular-nums"}`}>
        {value}
      </p>
    </div>
  );
}