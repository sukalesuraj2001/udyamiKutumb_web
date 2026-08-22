import React from "react";
import { User, Plus } from "lucide-react";

/**
 * showPlus  {boolean} — true = show plus icon on hover (build mode)
 *                       false = hide plus icon (preview mode)
 * onAssignClick — always passed; handler decides what to do internally
 */
export default function ChartSlot({
  slotId,
  label,
  tone = "navy",
  assigned,
  dimmed,
  onAssignClick,
  topLabel,
  numberBadge,
  nameCase = "title",
  textTone = "dark",
  showPlaceholderName = true,
  isSuperAdmin = false,
  variant = "default",
  showPlus = true,           // ← new prop: false hides plus icon in preview
}) {
  const hasAssigned = !!assigned?.name;
  const nameColor =
    textTone === "light"
      ? "text-white"
      : tone === "brick" && nameCase === "upper"
      ? "text-ink"
      : "text-brick";
  const companyColor = textTone === "light" ? "text-white/70" : "text-ink";
  const topLabelColor = textTone === "light" ? "text-white" : "text-brick";

  const handleClick = () => {
    if (onAssignClick) onAssignClick(slotId, label);
  };

  // ── TABBED variant ──────────────────────────────────────────────
  if (variant === "tabbed") {
    return (
      <div
        className={`flex flex-col items-center transition-opacity ${dimmed ? "opacity-25" : "opacity-100"
        }`}
      >
        <div className="w-full flex flex-col items-center">
          <div className="flex items-stretch w-full max-w-[88px]">
            {numberBadge != null && (
              <span className="w-[18px] h-[18px] rounded-full bg-white border border-ink text-ink text-[9px] font-bold flex items-center justify-center shrink-0 z-10 -mr-2 mt-[1px]">
                {numberBadge}
              </span>
            )}
            <div className="flex-1 bg-ink text-white text-[9px] font-semibold text-center py-[3px] px-2 rounded-t-md">
              {topLabel || label}
            </div>
          </div>

          <div
            onClick={handleClick}
            className={`relative w-full max-w-[88px] aspect-square bg-[#E8E8E8] border-2 border-ink rounded-b-md rounded-tr-md flex items-center justify-center overflow-hidden ${onAssignClick ? "cursor-pointer group" : "cursor-default"
            }`}
          >
            {assigned?.photoUrl ? (
              <img
                src={assigned.photoUrl}
                alt={assigned.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={28} className="text-white/90" strokeWidth={1.5} fill="white" />
            )}
            {showPlus && !isSuperAdmin && (
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DEFAULT variant ─────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col items-center gap-[2px] transition-opacity ${dimmed ? "opacity-25" : "opacity-100"
      }`}
    >
      {topLabel && (
        <span className={`text-[10.5px] font-semibold text-center leading-tight ${topLabelColor}`}>
          {topLabel}
        </span>
      )}

      <div
        onClick={handleClick}
        className={`flex flex-col items-center gap-[2px] w-full ${onAssignClick ? "cursor-pointer group" : "cursor-default"
        }`}
      >
        <div
          className={`relative w-[94px] h-[94px] rounded-lg border-[2.5px] border-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${tone === "brick" ? "bg-[#AE0E14]" : "bg-[#0C1757]"
          }`}
        >
          {assigned?.photoUrl ? (
            <img
              src={assigned.photoUrl}
              alt={assigned.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={58} className="text-white" strokeWidth={1.4} fill="white" />
          )}
          {/* Plus icon — only in build mode (showPlus=true) */}
          {showPlus && !isSuperAdmin && (
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          )}
        </div>

        {(hasAssigned || showPlaceholderName) && (
          <div className="text-center max-w-[90px]">
            <p
              className={`text-[10px] font-bold leading-tight truncate ${nameColor} ${nameCase === "upper" ? "uppercase" : ""
              }`}
            >
              {assigned?.name || (nameCase === "upper" ? "NAME" : "Name")}
            </p>
            <p className={`text-[6.5px] leading-tight truncate ${companyColor}`}>
              {assigned?.company}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}