import React from "react";
import { X, Shield, Trash2 } from "lucide-react";

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-gray-900">{value || "—"}</p>
    </div>
  );
}

/**
 * UserDetailsModal
 *
 * Props:
 *  open           boolean   – controls visibility
 *  user           object    – the selected user object
 *  onClose        function  – called on close
 *  onChangeRole   function  – called when "Change Role" is clicked
 *  onDelete       function  – called when "Delete" is clicked
 */
export default function UserDetailsModal({ open, user, onClose, onChangeRole, onDelete }) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 leading-tight">User Details</h2>
            <p className="text-[12.5px] text-gray-400 mt-0.5">Account information and role</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <DetailField label="Full Name" value={user.name} />
          <DetailField label="Email" value={user.email} />
          <DetailField label="Phone" value={user.phone} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Roles</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.roles?.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
          <DetailField label="Email Verified" value={user.status === "verified" ? "Yes" : "No"} />
          <DetailField label="Last Login" value={user.lastLogin} />
          <DetailField label="Created" value={user.registered} />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => onChangeRole?.(user)}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[12.5px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shield size={13} className="text-violet-500" />
            Change Role
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="inline-flex items-center gap-1.5 h-9 px-4 text-[12.5px] font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}