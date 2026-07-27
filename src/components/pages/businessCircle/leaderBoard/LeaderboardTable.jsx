import React from "react";

// Replace with real member ranking data from your API
export const SAMPLE_LEADERBOARD_MEMBERS = [
  { rank: 1, name: "Member Test", given: 1, received: 2, business: 50000 },
  { rank: 2, name: "Prasanna vn", given: 0, received: 7, business: 0 },
  { rank: 3, name: "Nandini devi", given: 0, received: 4, business: 0 },
  { rank: 4, name: "7760473121", given: 0, received: 4, business: 0 },
  { rank: 5, name: "7483050812", given: 0, received: 3, business: 0 },
  { rank: 6, name: "Nandeesh S Rajegowda", given: 1, received: 2, business: 0 },
  { rank: 7, name: "9880860928", given: 0, received: 2, business: 0 },
  { rank: 8, name: "Devaraj PG", given: 0, received: 1, business: 0 },
  { rank: 9, name: "9538205978", given: 0, received: 1, business: 0 },
  { rank: 10, name: "9980569111", given: 0, received: 1, business: 0 },
  { rank: 11, name: "Yogesh Achar", given: 0, received: 1, business: 0 },
  { rank: 12, name: "Ward Leader Test", given: 1, received: 1, business: 0 },
  { rank: 13, name: "Assembly Head Test", given: 1, received: 0, business: 0 },
];

export default function LeaderboardTable({ rows = SAMPLE_LEADERBOARD_MEMBERS }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="border-b border-hairline">
              <th className="px-6 py-3 text-[11px] font-medium text-muted">Member</th>
              <th className="px-6 py-3 text-[11px] font-medium text-muted">Given</th>
              <th className="px-6 py-3 text-[11px] font-medium text-muted">Received</th>
              <th className="px-6 py-3 text-[11px] font-medium text-muted text-right">Business</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank} className="border-b border-hairline last:border-0">
                <td className="px-6 py-3.5">
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full border border-hairline text-[11px] font-semibold text-muted flex items-center justify-center shrink-0">
                      {r.rank}
                    </span>
                    <span className="text-[13.5px] font-medium text-ink whitespace-nowrap">{r.name}</span>
                  </span>
                </td>
                <td className="px-6 py-3.5 text-[13.5px] tabular-nums">
                  {r.given > 0 ? (
                    <span className="font-semibold text-steel">{r.given}</span>
                  ) : (
                    <span className="text-muted">{r.given}</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-[13.5px] tabular-nums">
                  {r.received > 0 ? (
                    <span className="font-semibold text-steel">{r.received}</span>
                  ) : (
                    <span className="text-muted">{r.received}</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-[13.5px] text-ink tabular-nums text-right whitespace-nowrap">
                  ₹{r.business.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}