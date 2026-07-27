import React, { useState } from "react";
import { X, ChevronDown } from "lucide-react";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  password: "",
  role: "Member",
  assembly: "",
};

/**
 * AddUserModal
 *
 * Props:
 *  open      boolean   – controls visibility
 *  onClose   function  – called on cancel / close
 *  onSubmit  function  – called with form data when "Create User" is clicked
 */
export default function AddUserModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);

  if (!open) return null; // safe — useState is always called above this line

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    onSubmit?.(form);
    setForm(INITIAL_FORM);
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 leading-tight">Create New User</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              placeholder="Enter name"
              className="w-full h-10 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="admin@admin.com"
              className="w-full h-10 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="••••••••"
              className="w-full h-10 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="relative">
              <select
                value={form.role}
                onChange={handleChange("role")}
                className="w-full h-10 appearance-none pl-3 pr-8 text-[13px] text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Under Assembly */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">
              <span className="inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Under Assembly
              </span>
            </label>
            <div className="relative">
              <select
                value={form.assembly}
                onChange={handleChange("assembly")}
                className="w-full h-10 appearance-none pl-3 pr-8 text-[13px] text-gray-500 bg-white border border-blue-400 ring-2 ring-blue-500/20 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="">Select assembly first…</option>
                <option value="Anekal">Anekal</option>
                <option value="B.T.M Layout">B.T.M Layout</option>
                <option value="Yelahanka">Yelahanka</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="h-9 px-5 text-[12.5px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="h-9 px-5 text-[12.5px] font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}