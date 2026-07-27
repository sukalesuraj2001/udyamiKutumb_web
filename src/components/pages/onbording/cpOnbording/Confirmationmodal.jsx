import { AlertTriangle, Trash2, X } from "lucide-react";

/**
 * ConfirmationModal
 * Props:
 *   fieldName  – name of the field being deleted
 *   onConfirm  – called when "Delete Field" is clicked
 *   onCancel   – called to close the modal
 */
export default function ConfirmationModal({ fieldName, onConfirm, onCancel }) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-xl border border-gray-200 w-[420px] max-w-[92vw] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Trash2 size={15} className="text-red-500" />
            </span>
            <h2 className="text-[13.5px] font-bold text-gray-900">Delete Field</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400
              hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            Are you sure you want to delete the field{" "}
            <span className="font-semibold text-gray-900">"{fieldName}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg p-3">
            <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-red-700 leading-relaxed">
              All data collected for this field will also be removed from existing records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="h-8 px-4 text-[12.5px] font-semibold text-gray-700 bg-white border
              border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-8 px-4 text-[12.5px] font-semibold text-white bg-red-500 rounded-lg
              hover:bg-red-600 active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            Delete Field
          </button>
        </div>
      </div>
    </div>
  );
}