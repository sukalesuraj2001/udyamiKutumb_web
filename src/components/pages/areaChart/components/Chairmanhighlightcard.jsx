import React from "react";
import { User, Plus } from "lucide-react";

export default function ChairmanHighlightCard({ wardNumber, assigned, dimmed, onAssignClick, isSuperAdmin = false }) {
  return (
    <button
      onClick={() => onAssignClick("ward-chairman", "Chairman")}
      className={`flex flex-col items-center justify-center h-[148px] gap-1 bg-brick p-2 rounded-lg w-full transition-opacity ${isSuperAdmin ? "" : "group"} ${dimmed ? "opacity-25" : "opacity-100"}`}
    >
      <p className="text-white text-[11px] font-bold text-center leading-tight mb-1">Chairman</p>

      <div className="relative w-[95px] h-[95px] rounded-lg bg-[#1a2e5e] border-2 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
        {assigned?.photoUrl ? (
          <img src={assigned.photoUrl} alt={assigned.name} className="w-full h-full object-cover" />
        ) : (
          <User size={52} className="text-white/90" strokeWidth={1.5} fill="white" />
        )}
        {!isSuperAdmin && (
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[9.5px] font-bold text-white uppercase text-center leading-tight truncate max-w-[100px]">
        {assigned?.name || "NAME"}
      </p>
      <p className="text-[7.5px] text-white/70 text-center leading-tight truncate max-w-[100px]">
        {assigned?.company || ""}
      </p>
    </button>
  );
}
