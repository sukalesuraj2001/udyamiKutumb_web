import React from "react";
import { AlertTriangle } from "lucide-react";

// Replace with real alert data from your API — usually derived from the same
// leaderboard rows filtered to Critical grade
export const SAMPLE_ALERTS = [
  { id: "a1", label: "Nelamangala Circle -G33 critical (26)" },
  { id: "a2", label: "Bangalore Central Circle critical (10)" },
  { id: "a3", label: "Indiranagar Growth Circle critical (0)" },
  { id: "a4", label: "Jayanagar Enterprise Circle critical (0)" },
];

export default function AlertsPanel({ alerts = SAMPLE_ALERTS, onTakeAction }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
      <h2 className="text-[16px] font-semibold text-ink px-6 pt-5 pb-4">Alerts</h2>

      {alerts.length === 0 ? (
        <p className="text-[13px] text-muted text-center py-10">No active alerts.</p>
      ) : (
        <div>
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 px-6 py-3.5 border-b border-hairline last:border-0"
            >
              <p className="flex items-center gap-2 text-[13px] text-brick min-w-0">
                <AlertTriangle size={14} className="shrink-0" />
                <span className="truncate">{a.label}</span>
              </p>
              <button
                onClick={() => onTakeAction?.(a)}
                className="text-[12.5px] font-semibold text-ink hover:text-amber transition-colors shrink-0"
              >
                Take action
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}