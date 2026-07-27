import React from "react";
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from "lucide-react";

const VARIANT_CONFIG = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    confirmCls: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    confirmCls: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white",
  },
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    confirmCls: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white",
  },
  primary: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    confirmCls: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
  },
};

/**
 * ConfirmationModal
 *
 * Props:
 *  open        boolean   – controls visibility
 *  title       string    – modal heading
 *  description string    – body copy / question
 *  confirmText string    – confirm button label   (default "Confirm")
 *  cancelText  string    – cancel button label    (default "Cancel")
 *  variant     string    – "danger" | "warning" | "success" | "primary"
 *  loading     boolean   – disables buttons and shows spinner on confirm
 *  onConfirm   function  – called when user confirms
 *  onCancel    function  – called when user cancels or closes
 */
export default function ConfirmationModal({
  open,
  title = "Are you sure?",
  description = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const cfg = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.primary;
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-40"
        >
          <X size={14} />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={cfg.iconColor} />
          </div>
          <div className="pt-0.5">
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{title}</h2>
            {description && (
              <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-8 px-4 text-[12.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 h-8 px-4 text-[12.5px] font-semibold rounded-lg transition-colors disabled:opacity-60 ${cfg.confirmCls}`}
          >
            {loading && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}