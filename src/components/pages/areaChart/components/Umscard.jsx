import React from "react";
import { User, Plus } from "lucide-react";

export default function UmsCard({ slotId, label, assigned, dimmed, onAssignClick, iconUrl, isSuperAdmin = false }) {
  return (
    <div className={`transition-opacity ${dimmed ? "opacity-25" : "opacity-100"}`}>
      <p className="text-[11px] font-semibold text-brick mb-1.5 text-center truncate">{label}</p>
      <button
        onClick={() => onAssignClick(slotId, label)}
        className="group relative w-full aspect-[5/4] bg-hairline/70 border-2 border-brick rounded-lg flex items-center justify-center overflow-hidden"
      >
        {assigned?.photoUrl ? (
          <img src={assigned.photoUrl} alt={assigned.name} className="w-full h-full object-cover" />
        ) : assigned?.name ? (
          <User size={24} className="text-slate-600" />
        ) : iconUrl ? (
          <img src={iconUrl} alt={label} className="w-3/4 h-3/4 object-contain" />
        ) : null}
        {!isSuperAdmin && (
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <Plus
              size={16}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </span>
        )}
      </button>
      {assigned?.name && <p className="text-[10.5px] font-medium text-ink mt-1.5 text-center truncate">{assigned.name}</p>}
    </div>
  );
}