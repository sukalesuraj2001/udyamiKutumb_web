import React, { useState } from "react";
import { Plus } from "lucide-react";
import PitchCard from "./PitchCard.jsx";
import SubmitPitchPanel from "./SubmitPitchPanel.jsx";
import DeletePitchModal from "./DeletePitchModal.jsx";

// Replace with real pitch data from your API
const SAMPLE_PITCHES = [
  { id: "p1", name: "Member Test", date: "4/6/2026", pitch: "I help startups with end-to-end accounting & GST compliance.", askingFor: "Intros to early-stage founders" },
  { id: "p2", name: "Ward Leader Test", date: "4/6/2026", pitch: "Residential & commercial property in East Bangalore.", askingFor: "Buyers looking in Indiranagar/CV Raman Nagar" },
];

export default function Pitches() {
  const [pitches, setPitches] = useState(SAMPLE_PITCHES);
  const [showSubmitPanel, setShowSubmitPanel] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSubmitPitch = (form) => {
    setPitches((prev) => [
      {
        id: `p-${Date.now()}`,
        name: form.name,
        date: new Date().toLocaleDateString("en-GB"),
        pitch: form.pitch,
        askingFor: form.askingFor,
      },
      ...prev,
    ]);
  };

  const handleConfirmDelete = (pitch) => {
    setPitches((prev) => prev.filter((p) => p.id !== pitch.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-ink">60-Second Pitches</h2>
        <button
          onClick={() => setShowSubmitPanel(true)}
          className="flex items-center gap-2 bg-ink text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-ink/90 transition-colors"
        >
          <Plus size={16} /> Submit Pitch
        </button>
      </div>

      {pitches.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-14 text-center">
          <p className="text-[14px] text-muted">No pitches submitted this week.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pitches.map((p) => (
            <PitchCard key={p.id} pitch={p} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {showSubmitPanel && (
        <SubmitPitchPanel onClose={() => setShowSubmitPanel(false)} onSubmit={handleSubmitPitch} />
      )}

      {deleteTarget && (
        <DeletePitchModal pitch={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
}