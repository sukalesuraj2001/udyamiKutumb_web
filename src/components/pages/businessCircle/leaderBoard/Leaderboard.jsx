import React, { useState } from "react";
import { Trophy } from "lucide-react";
import LeaderboardTable from "./LeaderboardTable.jsx";

export default function Leaderboard() {
  const [view, setView] = useState("leaderboard"); // leaderboard | scorecard
  const [selectedCircleId, setSelectedCircleId] = useState(""); // used by Scorecard view

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-ink">
          <Trophy size={18} className="text-amber" /> {view === "leaderboard" ? "Leaderboard" : "Scorecard"}
        </h2>

        <div className="inline-flex rounded-xl border border-hairline bg-white p-1">
          <button
            onClick={() => setView("leaderboard")}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-lg transition-colors ${
              view === "leaderboard" ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setView("scorecard")}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-lg transition-colors ${
              view === "scorecard" ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            Scorecard
          </button>
        </div>
      </div>

      {view === "leaderboard" ? (
        <LeaderboardTable />
      ) : (
        <ScorecardView selectedCircleId={selectedCircleId} onSelectCircle={setSelectedCircleId} />
      )}
    </div>
  );
}

// Replace with real circle list from your API
const CIRCLE_OPTIONS = [
  { id: "c1", name: "Malleswaram Circle" },
  { id: "c2", name: "Nelamangala Circle - G33" },
  { id: "c3", name: "Yeshwanthpur Circle" },
  { id: "c4", name: "Indiranagar Growth Circle" },
  { id: "c5", name: "Jayanagar Enterprise Circle" },
  { id: "c6", name: "Bangalore Central Circle" },
];

function ScorecardView({ selectedCircleId, onSelectCircle }) {
  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <select
          value={selectedCircleId}
          onChange={(e) => onSelectCircle(e.target.value)}
          className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          <option value="">Select a circle…</option>
          {CIRCLE_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCircleId ? (
        <div className="rounded-2xl border border-hairline bg-white p-16 text-center">
          <p className="text-[14px] text-muted">Select a circle to view the scorecard.</p>
        </div>
      ) : (
        <CircleScorecard circleId={selectedCircleId} />
      )}
    </div>
  );
}

// Replace with real per-circle scorecard data once a circle is selected
function CircleScorecard({ circleId }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
      <p className="text-[13.5px] text-muted">Scorecard details for this circle will appear here.</p>
    </div>
  );
}