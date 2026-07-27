import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteF2FModal({ log, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="w-10 h-10 rounded-xl bg-brick/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-brick" />
          </span>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <h2 className="text-[16px] font-semibold text-ink mb-1.5">Delete this F2F log?</h2>
        <p className="text-[13.5px] text-muted mb-6">
          The meeting between <span className="font-medium text-ink">{log?.memberA}</span> and{" "}
          <span className="font-medium text-ink">{log?.memberB}</span> on {log?.date} will be permanently removed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-hairline text-ink text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(log)}
            className="flex-1 bg-brick text-white text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-brick/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}