import React, { useState } from "react";
import { Users, Trash2, Eye } from "lucide-react";
import PositionDetailsModal from "../models/PositionDetailsModal.jsx";

/* ── Status badge tokens ── */
const STATUS_STYLES = {
  registered: "bg-emerald-50 text-emerald-700",
  invited:    "bg-amber-50   text-amber-700",
  pending:    "bg-slate-100  text-slate-500",
};
const STATUS_DOTS = {
  registered: "bg-emerald-500",
  invited:    "bg-amber-500",
  pending:    "bg-slate-400",
};

export default function AllAssignmentsTable({ rows = [], onRemove }) {
  const [viewPosition, setViewPosition] = useState(null);

  const handleView = (r) => {
    setViewPosition({
      slotId:      r.slotId,
      role:        r.position,
      memberName:  r.name,
      company:     r.company,
      mobileNumber: r.mobileNumber || null,
      email:       r.email        || null,
      memberNumber: r.memberNumber || null,
      status:      r.status,
      profileImage: r.profileImage || r.photoUrl || null,
    });
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* ── Section Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="w-1 h-5 rounded-full bg-blue-600 shrink-0" />
          <div className="flex items-center gap-2.5">
            <h3 className="text-[16px] font-semibold text-slate-800">All Assignments</h3>
            <span className="inline-flex items-center justify-center text-[11.5px] font-semibold bg-slate-100 text-slate-600 w-6 h-6 rounded-full">
              {rows.length}
            </span>
          </div>
        </div>

        {/* ── Empty State ── */}
        {rows.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Users size={18} className="text-slate-400" />
            </div>
            <p className="text-[13.5px] font-medium text-slate-500">No positions assigned yet.</p>
            <p className="text-[12.5px] text-slate-400">
              Use "Invite Member" to assign people to chart positions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Name", "Company", "Position", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10.5px] font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <span className="text-[13.5px] font-semibold text-slate-800">{r.name}</span>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-slate-500">{r.company}</span>
                    </td>

                    {/* Position */}
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-slate-700">{r.position}</span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[r.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            STATUS_DOTS[r.status] ?? STATUS_DOTS.pending
                          }`}
                        />
                        {r.status}
                      </span>
                    </td>

                    {/* Actions — View + Remove */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View */}
                        <button
                          onClick={() => handleView(r)}
                          title="View details"
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </button>

                        {/* Divider */}
                        <span className="w-px h-3.5 bg-slate-200" />

                        {/* Remove */}
                        <button
                          onClick={() => onRemove?.(r)}
                          title="Remove assignment"
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Member Details Popup ── */}
      <PositionDetailsModal
        open={!!viewPosition}
        position={viewPosition}
        onClose={() => setViewPosition(null)}
      />
    </>
  );
}