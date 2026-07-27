import React, { useState } from "react";
import { Users2 } from "lucide-react";

const CIRCLE_OPTIONS = [
  { id: "c1", name: "Malleswaram Circle" },
  { id: "c2", name: "Nelamangala Circle - G33" },
  { id: "c3", name: "Yeshwanthpur Circle" },
  { id: "c4", name: "Indiranagar Growth Circle" },
  { id: "c5", name: "Jayanagar Enterprise Circle" },
  { id: "c6", name: "Bangalore Central Circle" },
];

export default function Positions() {
  const [selectedCircleId, setSelectedCircleId] = useState("");

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <select
          value={selectedCircleId}
          onChange={(e) => setSelectedCircleId(e.target.value)}
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
          <Users2 size={28} className="mx-auto text-muted mb-3" />
          <p className="text-[14px] text-muted">Select a circle to manage positions.</p>
        </div>
      ) : (
        <SectorTeamsPanel circleId={selectedCircleId} />
      )}
    </div>
  );
}

// Replace with real sector-team data once a circle is selected
function SectorTeamsPanel({ circleId }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
      <p className="text-[13.5px] text-muted">Sector teams for this circle will appear here.</p>
    </div>
  );
}