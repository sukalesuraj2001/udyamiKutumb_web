import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Generic delete-confirmation modal, based on the DeletePitchModal pattern
 * but reusable anywhere (Closed Business records, pitches, etc.) with a
 * smooth fade + scale transition instead of popping in/out instantly.
 *
 * @param {boolean} open
 * @param {string} [title]
 * @param {React.ReactNode} [description]
 * @param {string} [confirmLabel]
 * @param {function} onClose
 * @param {function} onConfirm
 */
export default function ConfirmDeleteModal({
  open,
  title = "Delete this item?",
  description,
  confirmLabel = "Delete",
  onClose,
  onConfirm,
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 200); // matches duration-200 below
    return () => clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <span className="w-10 h-10 rounded-xl bg-brick/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-brick" />
          </span>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <h2 className="text-[16px] font-semibold text-ink mb-1.5">{title}</h2>
        {description && <p className="text-[13.5px] text-muted mb-6">{description}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-hairline text-ink text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-brick text-white text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-brick/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}