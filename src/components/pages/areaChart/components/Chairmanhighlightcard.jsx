import React from "react";
import { User, Plus } from "lucide-react";

export default function ChairmanHighlightCard({ wardNumber, assigned, dimmed, onAssignClick, isSuperAdmin = false }) {
  return (
    <button
      onClick={() => onAssignClick("ward-chairman", "Chairman")}
      className={`flex flex-col items-center justify-start gap-2 bg-brick px-3 py-3 w-full h-full min-h-[180px] transition-opacity ${isSuperAdmin ? "" : "group"} ${dimmed ? "opacity-25" : "opacity-100"}`}
    >
      <p className="text-white text-[11px] font-bold text-center leading-tight">Chairman</p>

      {/* ✅ bg-[#1a2e5e] instead of bg-ink, bigger box */}
      <div className="relative w-[110px] h-[110px] rounded-lg bg-[#1a2e5e] border-2 border-white flex items-center justify-center overflow-hidden shrink-0">
        {assigned?.photoUrl ? (
          <img src={assigned.photoUrl} alt={assigned.name} className="w-full h-full object-cover" />
        ) : (
          // ✅ size 56 instead of 32
          <User size={56} className="text-white/90" strokeWidth={1.5} fill="white" />
        )}
        {!isSuperAdmin && (
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        )}
      </div>

      {assigned?.name && (
        <p className="text-white text-[10px] font-semibold text-center leading-tight truncate w-full max-w-full px-1">{assigned.name}</p>
      )}
    </button>
  );
}
