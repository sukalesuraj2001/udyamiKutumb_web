import React from "react";
import { User, Plus } from "lucide-react";

export default function ChairmanHighlightCard({ wardNumber, assigned, dimmed, onAssignClick, isSuperAdmin = false }) {
  const displayName = assigned?.name || assigned?.memberName || assigned?.assignedUserName || "NAME";
  const displayCompany = assigned?.company || assigned?.companyName || "";

  return (
    <button
      onClick={() => onAssignClick("ward-chairman", "Chairman")}
      className={`flex flex-col items-center justify-center h-[140px] gap-0.5 bg-brick p-1.5 rounded-lg w-full transition-opacity ${isSuperAdmin ? "" : "group"} ${dimmed ? "opacity-25" : "opacity-100"}`}
    >
      <p className="text-white text-[10.5px] font-bold text-center leading-tight mb-0.5">Chairman</p>

      <div className="relative w-[86px] h-[86px] rounded-lg bg-[#1a2e5e] border-2 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
        {assigned?.photoUrl ? (
          <img src={assigned.photoUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <User size={46} className="text-white/90" strokeWidth={1.5} fill="white" />
        )}
        {!isSuperAdmin && (
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        )}
      </div>

      <p className="mt-1 text-[9.5px] font-bold text-white uppercase text-center leading-tight truncate max-w-[110px]">
        {displayName}
      </p>
      {/* {displayCompany && (
        <p className="text-[7.5px] text-white/70 text-center leading-tight truncate max-w-[110px]">
          {displayCompany}
        </p>
      )} */}
    </button>
  );
}
