import React from "react";
import { FileDown, Send } from "lucide-react";

export default function ManagementActions({ onExportCircles, onExportMembers, onSendAnnouncement }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <p className="text-[15px] font-semibold text-[#111827] mb-4">Management actions</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExportCircles}
          className="flex items-center gap-2 border border-[#E5E7EB] text-[13px] font-medium text-[#374151] px-4 py-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
        >
          <FileDown size={15} className="text-[#6B7280]" /> Export all circles (Excel)
        </button>
        <button
          onClick={onExportMembers}
          className="flex items-center gap-2 border border-[#E5E7EB] text-[13px] font-medium text-[#374151] px-4 py-2.5 rounded-xl hover:bg-[#F9FAFB] transition-colors"
        >
          <FileDown size={15} className="text-[#6B7280]" /> Export member list (Excel)
        </button>
        <button
          onClick={onSendAnnouncement}
          className="flex items-center gap-2 bg-[#3B5BDB] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3451C7] transition-colors"
        >
          <Send size={15} /> Send platform announcement
        </button>
      </div>
    </div>
  );
}