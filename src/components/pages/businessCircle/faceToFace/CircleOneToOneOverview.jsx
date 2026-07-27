import React, { useMemo, useState } from "react";
import { Users, Target, TrendingUp, AlertTriangle, Bell, Download } from "lucide-react";

export const SAMPLE_MEMBERS_F2F = [
  { id: "m1", name: "Admin",               initials: "A",  category: "IT Services",                   count: 0, target: 4, lastMeeting: "Never" },
  { id: "m2", name: "Member Test",          initials: "MT", category: "Chartered Accountant",           count: 0, target: 4, lastMeeting: "Never" },
  { id: "m3", name: "Assembly Head Test",   initials: "AH", category: "Marketing Agency",               count: 0, target: 4, lastMeeting: "Never" },
  { id: "m4", name: "Ward Leader Test",     initials: "WL", category: "Real Estate",                    count: 0, target: 4, lastMeeting: "Never" },
  { id: "m5", name: "John Britto",          initials: "JB", category: "Clothing",                       count: 0, target: 4, lastMeeting: "Never" },
  { id: "m6", name: "D Narasimha Murthy",   initials: "DN", category: "Financial Services Advisor",     count: 0, target: 4, lastMeeting: "Never" },
  { id: "m7", name: "Devaraj PG",           initials: "DP", category: "Structure",                      count: 0, target: 4, lastMeeting: "Never" },
  { id: "m8", name: "C R Manjunath",        initials: "CR", category: "Realty sector",                  count: 0, target: 4, lastMeeting: "Never" },
  { id: "m9", name: "Prasanna vn",          initials: "PV", category: "water proofing",                 count: 0, target: 4, lastMeeting: "Never" },
];

const statusOf = (count, target) => {
  if (count === 0) return "No F2Fs";
  if (count >= target) return "On Track";
  return "Behind";
};

const STATUS_BAR  = { "No F2Fs": "bg-[#DC2626]", Behind: "bg-[#D97706]", "On Track": "bg-[#16A34A]" };
const STATUS_PILL = {
  "No F2Fs": { bg: "bg-[#FEF2F2]", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  Behind:    { bg: "bg-[#FFFBEB]", text: "text-[#D97706]", dot: "bg-[#D97706]" },
  "On Track":{ bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
};

export default function CircleOneToOneOverview({ members = SAMPLE_MEMBERS_F2F, monthLabel = "July 2026", onNudge, onExport }) {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("F2Fs");

  const rows = useMemo(() => members.map((m) => ({ ...m, status: statusOf(m.count, m.target) })), [members]);

  const counts = useMemo(() => {
    const c = { All: rows.length, "On Track": 0, Behind: 0, "No F2Fs": 0 };
    rows.forEach((r) => { c[r.status]++; });
    return c;
  }, [rows]);

  const circleAverage = useMemo(() => {
    if (rows.length === 0) return 0;
    return (rows.reduce((sum, r) => sum + r.count, 0) / rows.length).toFixed(1);
  }, [rows]);

  const needAttentionCount = counts["No F2Fs"] + counts.Behind;
  const filtered = filter === "All" ? rows : rows.filter((r) => r.status === filter);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortBy === "Name") copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "Last Meeting") copy.sort((a, b) => (a.lastMeeting === "Never" ? 1 : 0) - (b.lastMeeting === "Never" ? 1 : 0));
    else copy.sort((a, b) => a.count - b.count);
    return copy;
  }, [filtered, sortBy]);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-[#111827]">
          <Users size={17} className="text-[#3B5BDB]" />
          Circle 1-2-1 overview
          <span className="text-[13px] font-normal text-[#6B7280]">{monthLabel}</span>
        </h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 border border-[#E5E7EB] text-[13px] font-medium text-[#374151] px-3.5 py-2 rounded-xl hover:bg-[#F9FAFB] transition-colors"
        >
          <Download size={14} className="text-[#6B7280]" /> Export F2F report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MiniStat icon={Users}         label="Total 1-2-1s"    sub="this month"                         value={rows.reduce((s, r) => s + r.count, 0)} tone="blue"  />
        <MiniStat icon={Target}        label="Circle average"  sub={`avg · target ${rows[0]?.target ?? 4}`} value={circleAverage}                     tone="blue"  />
        <MiniStat icon={TrendingUp}    label="On track"        sub={`of ${rows.length} members`}         value={counts["On Track"]}                   tone="green" />
        <MiniStat icon={AlertTriangle} label="Need attention"  sub="members"                             value={needAttentionCount}                   tone="red"   />
      </div>

      {/* Filter tabs + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All", "On Track", "Behind", "No F2Fs"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-lg border transition-colors ${
                filter === f
                  ? f === "No F2Fs"
                    ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                    : f === "Behind"
                    ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                    : "bg-[#3B5BDB] text-white border-[#3B5BDB]"
                  : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
              }`}
            >
              {f} {f !== "All" && `(${counts[f]})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#6B7280]">Sort:</span>
          {["F2Fs", "Name", "Last Meeting"].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                sortBy === s
                  ? "bg-[#EEF2FF] text-[#3B5BDB]"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="border-t border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {["Member", "Category", "F2Fs this month", "Last meeting", "Status", "Action"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-medium text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const pill = STATUS_PILL[m.status];
              return (
                <tr key={m.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  {/* Member */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#3B5BDB] text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {m.initials}
                      </span>
                      <div>
                        <p className="text-[13.5px] font-medium text-[#111827] leading-tight">{m.name}</p>
                        <span className="text-[10px] font-medium border border-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                          Member
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5 text-[13px] text-[#6B7280] whitespace-nowrap">{m.category}</td>

                  {/* F2Fs progress */}
                  <td className="px-4 py-3.5 min-w-[160px]">
                    <p className="text-[12.5px] text-[#374151] mb-1.5">{m.count} / {m.target}</p>
                    <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_BAR[m.status]}`}
                        style={{ width: `${Math.min((m.count / m.target) * 100, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* Last meeting */}
                  <td className={`px-4 py-3.5 text-[13px] whitespace-nowrap ${m.lastMeeting === "Never" ? "text-[#DC2626]" : "text-[#6B7280]"}`}>
                    {m.lastMeeting}
                  </td>

                  {/* Status pill */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-lg ${pill.bg} ${pill.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
                      {m.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => onNudge?.(m)}
                      className="flex items-center gap-1.5 border border-[#E5E7EB] text-[12px] font-medium text-[#374151] px-3 py-1.5 rounded-lg hover:bg-[#F9FAFB] transition-colors whitespace-nowrap"
                    >
                      <Bell size={13} className="text-[#6B7280]" /> Nudge
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, sub, value, tone }) {
  const MAP = {
    blue:  { iconBg: "bg-[#EEF2FF]", iconColor: "text-[#3B5BDB]", value: "text-[#111827]" },
    green: { iconBg: "bg-[#F0FDF4]", iconColor: "text-[#16A34A]", value: "text-[#16A34A]" },
    red:   { iconBg: "bg-[#FEF2F2]", iconColor: "text-[#DC2626]", value: "text-[#DC2626]" },
  };
  const t = MAP[tone] ?? MAP.blue;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-medium uppercase tracking-wide text-[#6B7280]">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.iconBg}`}>
          <Icon size={14} className={t.iconColor} />
        </span>
      </div>
      <p className={`text-[24px] font-bold leading-none tabular-nums ${t.value}`}>{value}</p>
      <p className="text-[11.5px] text-[#9CA3AF]">{sub}</p>
    </div>
  );
}