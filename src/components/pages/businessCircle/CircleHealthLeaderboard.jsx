import React from "react";

const GRADE_MAP = {
  Critical: { text: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
  Warning:  { text: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
  Good:     { text: "text-[#16A34A]", bg: "bg-[#F0FDF4]" },
};

export const SAMPLE_LEADERBOARD = [
  { rank: 1, circle: "Nelamangala Circle - G33",      members: 12, score: 26, grade: "Critical", refPerMo: 0, business: 0 },
  { rank: 2, circle: "Bangalore Central Circle",       members: 4,  score: 10, grade: "Critical", refPerMo: 0, business: 50000 },
  { rank: 3, circle: "Indiranagar Growth Circle",      members: 0,  score: 0,  grade: "Critical", refPerMo: 0, business: 0 },
  { rank: 4, circle: "Jayanagar Enterprise Circle",    members: 0,  score: 0,  grade: "Critical", refPerMo: 0, business: 0 },
];

export default function CircleHealthLeaderboard({ rows = SAMPLE_LEADERBOARD }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
      <h2 className="text-[16px] font-semibold text-[#111827] px-6 pt-5 pb-4">
        Circle health leaderboard
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="border-t border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {["#", "Circle", "Members", "Score", "Grade", "Ref/mo", "Business"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-2.5 text-[11px] font-medium text-[#6B7280] uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const g = GRADE_MAP[r.grade];
              return (
                <tr key={r.rank} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-3.5 text-[13px] text-[#9CA3AF]">{r.rank}</td>
                  <td className="px-6 py-3.5 text-[13.5px] font-medium text-[#111827] whitespace-nowrap">{r.circle}</td>
                  <td className="px-6 py-3.5 text-[13.5px] text-[#374151] tabular-nums">{r.members}</td>
                  <td className="px-6 py-3.5 text-[13.5px] font-semibold text-[#111827] tabular-nums">{r.score}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium ${g?.bg} ${g?.text}`}>
                      {r.grade}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[13.5px] text-[#374151] tabular-nums">{r.refPerMo}</td>
                  <td className="px-6 py-3.5 text-[13.5px] text-[#374151] tabular-nums whitespace-nowrap">
                    ₹{r.business.toLocaleString("en-IN")}
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