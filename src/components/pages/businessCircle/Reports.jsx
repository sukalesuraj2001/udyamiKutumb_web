import React, { useState } from "react";

const SCOPE_OPTIONS = ["Taluka", "Circle", "Sector"];

const INCLUDES_INIT = [
  { id: "leads",     label: "Leads & conversion",           enabled: true  },
  { id: "attend",    label: "Attendance & scorecards",       enabled: true  },
  { id: "gratitude", label: "Gratitude Slip totals (aggregate)", enabled: true  },
  { id: "sector",    label: "Sector coverage",               enabled: false },
];

const PREVIEW = [
  { label: "Leads passed",            value: "142"    },
  { label: "Conversion to closed",    value: "31%"    },
  { label: "Face to Face completed",  value: "96"     },
  { label: "Guests → joined",         value: "9 / 14" },
  { label: "Avg attendance",          value: "78%"    },
  { label: "Gratitude Slip (aggregate)", value: "₹22.0L" },
];

export default function Reports() {
  const [scope,    setScope]    = useState("Taluka");
  const [includes, setIncludes] = useState(INCLUDES_INIT);

  const toggle = (id) =>
    setIncludes((p) => p.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-bold text-[#111827]">Reports & export</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Build a report ──────────────────────────── */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-5">
          <p className="text-[13px] text-[#6B7280] font-medium">Build a report</p>

          {/* Scope */}
          <div className="space-y-2">
            <p className="text-[12px] text-[#6B7280]">Scope</p>
            <div className="flex items-center gap-2">
              {SCOPE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${
                    scope === s
                      ? "bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]"
                      : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <p className="text-[12px] text-[#6B7280]">Period</p>
            <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-[13.5px] text-[#374151]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Q2 · Apr–Jun 2026
            </div>
          </div>

          {/* Include toggles */}
          <div className="space-y-2">
            <p className="text-[12px] text-[#6B7280]">Include</p>
            <div className="space-y-2">
              {includes.map(({ id, label, enabled }) => (
                <div key={id} className="flex items-center justify-between border border-[#E5E7EB] rounded-xl px-4 py-3">
                  <span className="text-[13.5px] text-[#374151]">{label}</span>
                  <button
                    onClick={() => toggle(id)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-[#1B4332]" : "bg-[#D1D5DB]"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <button className="bg-[#1B4332] hover:bg-[#14532D] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Export
          </button>
        </div>

        {/* ── Preview · Q2 summary ────────────────────── */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[13px] text-[#6B7280] font-medium mb-4">Preview · Q2 summary</p>
          <table className="w-full text-[13.5px]">
            <tbody>
              {PREVIEW.map(({ label, value }, i) => (
                <tr key={label} className={i < PREVIEW.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                  <td className="py-3 text-[#374151]">{label}</td>
                  <td className="py-3 text-right font-medium text-[#111827]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[12px] text-[#9CA3AF] mt-4">
            Individual Gratitude Slip amounts stay private
          </p>
        </div>

      </div>
    </div>
  );
}
