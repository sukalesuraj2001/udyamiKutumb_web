import React from "react";
import { Building2, Calendar, Users, Pencil, Trash2 } from "lucide-react";

const STATUS_MAP = {
  Active:   { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]" },
  Inactive: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]" },
};

export default function CircleCard({ circle, onEdit, onDelete, onManageSeats }) {
  const status = STATUS_MAP[circle.status] ?? STATUS_MAP.Inactive;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-[#3B5BDB]" />
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold text-[#111827] truncate">{circle.name}</p>
            <p className="text-[12.5px] text-[#6B7280] truncate">{circle.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${status.bg} ${status.text}`}>
            {circle.status}
          </span>
          <button
            onClick={() => onEdit(circle)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#3B5BDB] hover:bg-[#EEF2FF] transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(circle)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-[12.5px] text-[#6B7280] mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {circle.meetingDay} {circle.meetingTime}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} /> {circle.seatsFilled} seats filled
        </span>
      </div>

      {/* Action button */}
      <button
        onClick={() => onManageSeats(circle)}
        className="w-full flex items-center justify-center gap-2 border border-[#E5E7EB] text-[13px] font-semibold text-[#374151] py-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
      >
        <Users size={15} className="text-[#6B7280]" /> Manage seats
      </button>
    </div>
  );
}