import React from "react";
import { MessageCircle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Empty-state placeholder ───────────────────────────────────────────────────
function EmptyChart({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 px-4">
      <Icon size={32} className="text-gray-300" />
      <p className="text-[13.5px] font-semibold text-gray-500">{title}</p>
      <p className="text-[12px] text-gray-400 text-center max-w-[200px]">{subtitle}</p>
    </div>
  );
}

// ── Recharts shared axis tick style ──────────────────────────────────────────
const TICK = { fontSize: 11, fill: "#9ca3af" };

export default function WhatsAppBotPerformance({
  stats = null,
  dailyConversations = [],
  topTopics = [],
  recentConversations = [],
}) {
  const hasStats = stats !== null;
  const hasDaily = dailyConversations.length > 0;
  const hasTopics = topTopics.length > 0;
  const hasRecent = recentConversations.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">

      {/* Header */}
      <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
        <MessageCircle size={18} className="text-blue-500" />
        WhatsApp Bot Performance
      </h2>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversations This Month"
          value={hasStats ? stats.conversationsThisMonth : null}
          color="blue"
        />
        <StatCard
          label="Avg Messages / Conversation"
          value={hasStats ? stats.avgMessagesPerConversation : null}
          color="violet"
        />
        <StatCard
          label="Resolution Rate"
          value={hasStats ? `${stats.resolutionRate}%` : null}
          color="green"
        />
        <StatCard
          label="Most Asked Topic"
          value={hasStats ? stats.mostAskedTopic : null}
          color="amber"
          isText
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Area chart — daily conversations */}
        <div className="border border-gray-200 rounded-2xl p-5 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 mb-4">Daily Conversations</p>
          {hasDaily ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyConversations} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="convoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12.5, color: "#374151" }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fill="url(#convoFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              icon={({ size, className }) => (
                <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l4-8 4 5 3-3 4 6" />
                </svg>
              )}
              title="Coming soon"
              subtitle="Conversation data will appear here once the bot is active."
            />
          )}
        </div>

        {/* Bar chart — top topics */}
        <div className="border border-gray-200 rounded-2xl p-5 min-w-0">
          <p className="text-[14px] font-semibold text-gray-800 mb-4">Top Query Topics</p>
          {hasTopics ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topTopics} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={TICK} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" width={110}
                  tick={{ fontSize: 11, fill: "#374151" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12.5, color: "#374151" }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              icon={({ size, className }) => (
                <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4v8H3zm6-6h4v14H9zm6-4h4v18h-4z" />
                </svg>
              )}
              title="Coming soon"
              subtitle="Topic breakdown will appear here once queries come in."
            />
          )}
        </div>
      </div>

      {/* ── Recent conversations ── */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">

        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <p className="text-[14px] font-bold text-gray-800">Recent Conversations</p>
        </div>

        {!hasRecent ? (
          <EmptyChart
            icon={({ size, className }) => (
              <svg width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.844L3 20l1.086-3.8A7.953 7.953 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
            title="Coming soon"
            subtitle="Conversations will show up here once members start chatting."
          />
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
                {recentConversations.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-[13px] font-semibold text-gray-800 whitespace-nowrap">{c.member}</td>
                    <td className="px-5 py-3 text-[12.5px] text-gray-400 whitespace-nowrap">{c.ward}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-800 tabular-nums">{c.messages}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.topics.map((t) => (
                          <span key={t} className="text-[10.5px] font-medium border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${c.escalated ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
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
  blue: { bar: "bg-blue-500", value: "text-blue-600" },
  violet: { bar: "bg-violet-500", value: "text-violet-600" },
  green: { bar: "bg-green-500", value: "text-green-600" },
  amber: { bar: "bg-amber-400", value: "text-amber-600" },
};

function StatCard({ label, value, color, isText }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  const isEmpty = value === null || value === undefined;
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 leading-tight">
          {label}
        </p>
        <span className={`w-6 h-1.5 rounded-full shrink-0 ${c.bar}`} />
      </div>
      <p className={`font-bold leading-none ${isEmpty ? "text-gray-300 text-[22px]" : `${c.value} ${isText ? "text-[18px]" : "text-[24px] tabular-nums"}`}`}>
        {isEmpty ? "—" : value}
      </p>
    </div>
  );
}