import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const AVAILABLE_ROLES = ["Admin", "User", "Member", "Moderator", "Channel Partner"];

/**
 * AssignRoleModal
 *
 * Props:
 *  open      boolean   – controls visibility
 *  user      object    – the user receiving a new role (used for display)
 *  onClose   function  – called on cancel / close
 *  onSubmit  function  – called with { user, newRole } when "Assign Role" is clicked
 */
export default function AssignRoleModal({ open, user, onClose, onSubmit }) {
  const [selectedRole, setSelectedRole] = useState("");

  // Reset selection whenever modal opens for a new user
  useEffect(() => {
    if (open) setSelectedRole("");
  }, [open, user]);

  if (!open || !user) return null;

  const handleSubmit = () => {
    if (!selectedRole) return;
    onSubmit?.({ user, newRole: selectedRole });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 leading-tight">Change Role</h2>
            <p className="text-[12.5px] text-gray-400 mt-0.5">Assign a new role to {user.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Role selector */}
        <div>
          <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">New Role</label>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-10 appearance-none pl-3 pr-8 text-[13px] text-gray-800 bg-white border border-blue-400 ring-2 ring-blue-500/20 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Select a role…</option>
              {AVAILABLE_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="h-9 px-5 text-[12.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedRole}
            className="h-9 px-5 text-[12.5px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  );
}