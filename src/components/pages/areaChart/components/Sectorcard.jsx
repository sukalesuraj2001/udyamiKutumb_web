import React from "react";
import { Plus } from "lucide-react";

export default function SectorCard({
  slotId,
  label,
  assigned,
  dimmed,
  onAssignClick,
  showPlus,
  isSuperAdmin = false,
}) {
  const displayLabel = label?.toUpperCase?.() || label;

  const handleClick = () => {
    if (onAssignClick) {
      onAssignClick(slotId, label);
    }
  };

  return (
    <div className={`transition-opacity ${dimmed ? "opacity-25" : "opacity-100"}`}>
      <div className=" rounded-sm overflow-hidden border border-white/10 w-[110px] mx-auto">
        <p className=" text-white text-[6px] font-bold uppercase tracking-wide text-center py-[2px] px-0.5 leading-tight truncate">
          {displayLabel}
        </p>
        <button
          onClick={handleClick}
          className="group relative w-[104px] h-[104px] bg-white border-[3px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden cursor-pointer shrink-0"
        >
          {assigned?.photoUrl ? (
            <img
              src={assigned.photoUrl}
              alt={assigned.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[5px] font-semibold uppercase text-gray-300 text-center px-0.5 leading-tight">
              {displayLabel}
            </span>
          )}

          {showPlus && (
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
              <Plus
                size={12}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </span>
          )}
        </button>
      </div>

      {assigned?.name && (
        <div className="text-center mt-0.5 cursor-pointer" onClick={handleClick}>
          <p className="text-[7px] font-bold text-white leading-tight truncate">
            {assigned.name}
          </p>
          <p className="text-[5px] text-white/70 leading-tight truncate">
            {assigned.company || "Company Name"}
          </p>
        </div>
      )}
    </div>
  );
}