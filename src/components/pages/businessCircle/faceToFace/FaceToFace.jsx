import React, { useState } from "react";
import { Users2, Plus } from "lucide-react";
import CircleOneToOneOverview from "./CircleOneToOneOverview.jsx";
import F2FLogItem from "./F2FLogItem.jsx";
import F2FLeaderboard from "./F2FLeaderboard.jsx";
import LogF2FPanel from "./LogF2FPanel.jsx";
import DeleteF2FModal from "./DeleteF2FModal.jsx";

// Replace with real F2F log data from your API
const SAMPLE_LOGS = [
  { id: "f1", memberA: "Nandeesh S Rajegowda", memberB: "Nandini devi", date: "19 Jun 2026", mode: "In-person", duration: 30, status: "Pending", notes: "Stall booking" },
  { id: "f2", memberA: "Nandeesh S Rajegowda", memberB: "Yogesh Achar", date: "19 Jun 2026", mode: "In-person", duration: 30, status: "Confirmed", notes: "Meeting for digital marketing" },
  { id: "f3", memberA: "Yogesh Achar", memberB: "Nandeesh S Rajegowda", date: "19 Jun 2026", mode: "In-person", duration: 30, status: "Pending", notes: "" },
  { id: "f4", memberA: "Prasanna vn", memberB: "Nandini devi", date: "19 Jun 2026", mode: "In-person", duration: 20, status: "Pending", notes: "" },
  { id: "f5", memberA: "Prasanna vn", memberB: "Nandeesh S Rajegowda", date: "19 Jun 2026", mode: "In-person", duration: 30, status: "Confirmed", notes: "Circle Meetings" },
  { id: "f6", memberA: "somashekar B", memberB: "Prasanna vn", date: "15 Jun 2026", mode: "In-person", duration: 30, status: "Pending", notes: "" },
  { id: "f7", memberA: "Test Member", memberB: "Assembly Head Test", date: "3 Jun 2026", mode: "Phone call", duration: 20, status: "Pending", notes: "Intro call" },
  { id: "f8", memberA: "Test Member", memberB: "Ward Leader Test", date: "31 May 2026", mode: "In-person", duration: 45, status: "Confirmed", notes: "Discussed referral pipeline" },
  { id: "f9", memberA: "Ward Leader Test", memberB: "Assembly Head Test", date: "25 May 2026", mode: "Video call", duration: 30, status: "Confirmed", notes: "Marketing collaboration" },
];

export default function FaceToFace() {
  const [logs, setLogs] = useState(SAMPLE_LOGS);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmedThisMonth = logs.filter((l) => l.status === "Confirmed"); // simplistic; refine with real month filtering

  const handleSubmitLog = (form) => {
    setLogs((prev) => [
      {
        id: `f-${Date.now()}`,
        memberA: "You",
        memberB: form.member,
        date: new Date(form.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        mode: form.mode,
        duration: form.duration,
        status: "Pending",
        notes: form.notes,
      },
      ...prev,
    ]);
  };

  const handleConfirmDelete = (log) => {
    setLogs((prev) => prev.filter((l) => l.id !== log.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <CircleOneToOneOverview onNudge={(m) => console.log("Nudge:", m)} onExport={() => console.log("Export F2F report")} />

      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-ink">
          <Users2 size={18} /> Face to Face
        </h2>
        <button
          onClick={() => setShowLogPanel(true)}
          className="flex items-center gap-2 bg-ink text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-ink/90 transition-colors"
        >
          <Plus size={16} /> Log F2F
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start min-w-0">
        <div className="space-y-3">
          {logs.map((log) => (
            <F2FLogItem key={log.id} log={log} onDelete={setDeleteTarget} />
          ))}
        </div>

        <F2FLeaderboard entries={confirmedThisMonth.map((l) => ({ id: l.id, name: l.memberA, count: 1 }))} />
      </div>

      {showLogPanel && <LogF2FPanel onClose={() => setShowLogPanel(false)} onSubmit={handleSubmitLog} />}

      {deleteTarget && (
        <DeleteF2FModal log={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />
      )}
    </div>
  );
}