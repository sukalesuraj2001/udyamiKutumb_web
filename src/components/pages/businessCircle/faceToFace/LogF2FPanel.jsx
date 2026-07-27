import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

// Replace with real member directory from your API
const MEMBER_OPTIONS = ["Nandeesh S Rajegowda", "Nandini devi", "Yogesh Achar", "Prasanna vn", "somashekar B", "Test Member", "Assembly Head Test", "Ward Leader Test"];

const EMPTY_FORM = { member: "", date: new Date().toISOString().slice(0, 10), duration: 30, mode: "In-person", notes: "" };

export default function LogF2FPanel({ onClose, onSubmit }) {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = () => {
    if (!form.member) return;
    onSubmit(form);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-hairline px-6 py-5 flex items-start justify-between z-10">
          <h2 className="font-display text-[20px] text-ink">Log a Face-to-Face</h2>
          <button onClick={handleClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Who did you meet?</label>
            <select
              value={form.member}
              onChange={(e) => update({ member: e.target.value })}
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
            >
              <option value="">Select member</option>
              {MEMBER_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-ink mb-1.5 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-ink mb-1.5 block">Duration (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => update({ duration: Number(e.target.value) })}
                className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Mode</label>
            <select
              value={form.mode}
              onChange={(e) => update({ mode: e.target.value })}
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
            >
              <option>In-person</option>
              <option>Phone call</option>
              <option>Video call</option>
            </select>
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Notes / key discussion points</label>
            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={4}
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30 resize-y"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.member}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}