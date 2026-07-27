import React from "react";
import { Circle, Users, TrendingUp, Heart } from "lucide-react";
import StatCard from "../businessCircle/StatCard.jsx";

const STATS = {
  liveCircles: 1,
  members: 44,
  leadsQ2: 142,
  gratitudeQ2: "₹22.0L",
};

const CIRCLES = [
  {
    name: "G5 Malleshwaram",
    level: "Constituency",
    members: 44,
    attendance: "78%",
    coverage: "15/18",
    status: "live",
  },
  {
    name: "G5.48 Mathikere",
    level: "Ward",
    members: 28,
    attendance: null,
    coverage: "12/18",
    status: "eligible",
  },
  {
    name: "G5.49 Aramane Nagara",
    level: "Ward",
    members: 9,
    attendance: null,
    coverage: null,
    status: "planned",
  },
];

const STATUS_CONFIG = {
  live:     { dot: "bg-green-500",  label: "Live",     text: "text-green-700"  },
  eligible: { dot: "bg-amber-400",  label: "Eligible", text: "text-amber-700"  },
  planned:  { dot: "bg-gray-400",   label: "Planned",  text: "text-gray-500"   },
};

const eligibleCircle = CIRCLES.find((c) => c.status === "eligible");

export default function Overview() {
  return (
    <div className="space-y-5">

      {/* Phase banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-[13px] text-gray-500">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
          <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Phase 1 — one constituency circle is live. Ward circles form as membership grows (Spin-off tab).
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Live circles"    value={STATS.liveCircles}   icon={Circle}    tone="steel" />
        <StatCard label="Members"         value={STATS.members}        icon={Users}     tone="steel" />
        <StatCard label="Leads · Q2"      value={STATS.leadsQ2}        icon={TrendingUp} tone="steel" />
        <StatCard label="Gratitude · Q2"  value={STATS.gratitudeQ2}   icon={Heart}     tone="steel" />
      </div>

      {/* Circle health table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-[14px] font-semibold text-gray-500 mb-4">Circle health</p>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100">
              {["Circle", "Level", "Members", "Attendance", "Coverage", "Status"].map((h, i) => (
                <th
                  key={h}
                  className={`pb-2.5 text-[11.5px] font-medium text-gray-400 ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CIRCLES.map((c, idx) => {
              const s = STATUS_CONFIG[c.status];
              return (
                <tr key={c.name} className={idx < CIRCLES.length - 1 ? "border-b border-gray-100" : ""}>
                  <td className="py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="py-3 text-right text-gray-500">{c.level}</td>
                  <td className="py-3 text-right text-gray-800">{c.members}</td>
                  <td className="py-3 text-right text-gray-500">{c.attendance ?? "—"}</td>
                  <td className="py-3 text-right text-gray-500">{c.coverage ?? "—"}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center justify-end gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className={s.text}>{s.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Spin-off action banner */}
      {eligibleCircle && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-teal-700">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            {eligibleCircle.name} reached {eligibleCircle.members} members — eligible to spin off
          </div>
          <button className="shrink-0 rounded-lg bg-teal-700 px-4 py-2 text-[13px] font-semibold text-white hover:bg-teal-800 transition-colors">
            Start spin-off
          </button>
        </div>
      )}

    </div>
  );
}