import React from "react";
import { Trophy } from "lucide-react";

export default function F2FLeaderboard({ entries = [] }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-ink mb-4">
        <Trophy size={16} className="text-amber" /> F2F Leaderboard <span className="text-[12px] font-normal text-muted">(this month)</span>
      </h3>

      {entries.length === 0 ? (
        <p className="text-[13px] text-muted py-4">No confirmed F2Fs this month.</p>
      ) : (
        <div className="space-y-2.5">
          {entries.map((e, i) => (
            <div key={e.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-[13.5px] text-ink">
                <span className="w-6 h-6 rounded-full border border-hairline text-[11px] font-semibold text-muted flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {e.name}
              </span>
              <span className="text-[13px] font-semibold text-forest tabular-nums">{e.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}