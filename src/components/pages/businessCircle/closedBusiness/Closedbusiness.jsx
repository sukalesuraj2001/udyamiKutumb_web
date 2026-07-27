import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SlideOver from "./SlideOver.jsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal.jsx";

// Replace with real data (API/Redux) once wired up
const SAMPLE_RECORDS = [
  {
    id: "r1",
    fromMember: "Ward Leader Test",
    toMember: "Member Test",
    amount: 50000,
    date: "20/5/2026",
    notes: "GST filing engagement closed",
  },
];

export default function ClosedBusiness() {
  const [records, setRecords] = useState(SAMPLE_RECORDS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ fromMember: "", toMember: "", amount: "", notes: "" });

  const totalVolume = records.reduce((sum, r) => sum + r.amount, 0);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleRecord = () => {
    if (!form.fromMember.trim() || !form.toMember.trim() || !form.amount) return;
    setRecords((r) => [
      {
        id: `r${Date.now()}`,
        fromMember: form.fromMember,
        toMember: form.toMember,
        amount: Number(form.amount),
        date: new Date().toLocaleDateString("en-GB"),
        notes: form.notes,
      },
      ...r,
    ]);
    setForm({ fromMember: "", toMember: "", amount: "", notes: "" });
    setPanelOpen(false);
  };

  const handleDeleteConfirm = () => {
    setRecords((r) => r.filter((rec) => rec.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[19px] font-semibold text-ink">Closed Business</h2>
          <p className="text-[13px] text-muted mt-0.5">
            Total volume: ₹{totalVolume.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 bg-ink text-white text-[13.5px] font-semibold px-4 py-2.5 rounded-xl hover:bg-ink/90 transition-colors shrink-0"
        >
          <Plus size={16} /> Record Business
        </button>
      </div>

      <div className="space-y-2.5">
        {records.length === 0 ? (
          <p className="text-[13.5px] text-muted text-center py-10">No closed business recorded yet.</p>
        ) : (
          records.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-white border border-hairline rounded-xl px-5 py-4">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink truncate">
                  {r.fromMember} → {r.toMember}
                </p>
                <p className="text-[12.5px] text-muted mt-0.5 truncate">
                  {r.date} · {r.notes}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-[15px] font-semibold text-ink whitespace-nowrap">
                  ₹ {r.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="text-muted hover:text-brick transition-colors"
                  aria-label="Delete record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <SlideOver open={panelOpen} onClose={() => setPanelOpen(false)} title="Record closed business">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="From member" value={form.fromMember} onChange={update("fromMember")} />
            <Field label="To member" value={form.toMember} onChange={update("toMember")} />
          </div>
          <Field label="Amount (₹)" value={form.amount} onChange={update("amount")} type="number" />
          <Field label="Notes" value={form.notes} onChange={update("notes")} />

          <button
            onClick={handleRecord}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 transition-colors mt-2"
          >
            Record
          </button>
        </div>
      </SlideOver>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete this record?"
        description={
          deleteTarget && (
            <>
              <span className="font-medium text-ink">
                {deleteTarget.fromMember} → {deleteTarget.toMember}
              </span>{" "}
              (₹{deleteTarget.amount.toLocaleString("en-IN")}) will be permanently removed.
            </>
          )
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-ink mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </div>
  );
}