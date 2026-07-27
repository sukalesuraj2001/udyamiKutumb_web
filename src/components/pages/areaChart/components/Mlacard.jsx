import React from "react";
import { User, Plus } from "lucide-react";

export default function MlaCard({ mlaLabel, assigned, dimmed, onAssignClick, isSuperAdmin = false }) {
  return (
    <div className={`w-[270px] h-[170px] bg-[#A01016] transition-opacity ${dimmed ? "opacity-25" : "opacity-100"}`}>
      <button
        onClick={() => onAssignClick("mla", mlaLabel)}
        className={`block mx-auto ${isSuperAdmin ? "" : "group"}`}
      >
        <div className="bg-brick rounded-md mt-8 mx-auto w-fit">
          <div className="relative w-[88px] h-[88px] rounded-sm overflow-hidden bg-[#0C1757] border-2 border-white flex items-center justify-center">            {assigned?.photoUrl ? (
            <img src={assigned.photoUrl} alt={assigned.name} className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-white/80" strokeWidth={1.5} fill="white" />
          )}
            {!isSuperAdmin && (
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </div>
        </div>
        <p className="text-white text-[10px] font-bold text-center leading-tight mt-[6px]">
          {assigned?.name || "Name"}
        </p>

        <p className="text-white/80 text-[7px] text-center mt-[2px] leading-tight max-w-[200px] mx-auto">
          {mlaLabel}
        </p>      </button>
    </div>
  );
}
