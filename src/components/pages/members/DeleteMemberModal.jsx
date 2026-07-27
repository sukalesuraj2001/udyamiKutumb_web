import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Loader from "../../common/Loader.jsx";

export default function DeleteMemberModal({ member, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      onConfirm(member);
    } catch (err) {
      console.error("Failed to delete member:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={!isDeleting ? onClose : undefined} />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="w-10 h-10 rounded-xl bg-brick/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-brick" />
          </span>
          {!isDeleting && (
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X size={18} />
            </button>
          )}
        </div>

        <h2 className="text-[16px] font-semibold text-ink mb-1.5">Delete this member?</h2>
        <p className="text-[13.5px] text-muted mb-1">
          <span className="font-medium text-ink">{member?.name}</span>
          {member?.udyamiId && <span className="text-[11px] font-mono text-muted ml-2">({member.udyamiId})</span>}
        </p>
        <p className="text-[13px] text-muted mb-6">
          This will permanently remove this member's profile, business info, and all associated records. This action can't be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 border border-hairline text-ink text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 bg-brick text-white text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-brick/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? <Loader variant="inline" tone="light" label="Deleting…" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}