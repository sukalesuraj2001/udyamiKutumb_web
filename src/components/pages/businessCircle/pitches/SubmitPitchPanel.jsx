import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = { name: "", pitch: "", askingFor: "" };

export default function SubmitPitchPanel({ onClose, onSubmit }) {
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
    if (!form.name.trim() || !form.pitch.trim()) return;
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
          <h2 className="font-display text-[20px] text-ink">Weekly 60-second pitch</h2>
          <button onClick={handleClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Your name</label>
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">Pitch</label>
            <textarea
              value={form.pitch}
              onChange={(e) => update({ pitch: e.target.value })}
              rows={5}
              placeholder="What do you do, in one or two lines?"
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber/30 resize-y"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink mb-1.5 block">This week I'm asking for</label>
            <input
              value={form.askingFor}
              onChange={(e) => update({ askingFor: e.target.value })}
              placeholder="e.g. Intros to early-stage founders"
              className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber/30"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.pitch.trim()}
            className="w-full bg-ink text-white text-[13.5px] font-semibold py-3 rounded-xl hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit pitch
          </button>
        </div>
      </div>
    </div>
  );
}