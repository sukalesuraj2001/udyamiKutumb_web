import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check, ChevronUp, ChevronDown } from "lucide-react";
import useTheme from "./useTheme.js";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Light / Dark / System dropdown.
 *  - variant="full"  : icon + label + chevron (sidebar footer)
 *  - variant="icon"  : icon only (mobile header / collapsed sidebar)
 *  - placement       : which way the menu opens ("up" | "down")
 *  - align           : menu edge alignment ("left" | "right")
 */
export default function ThemeToggle({ variant = "full", placement = "down", align = "right", className = "" }) {
  const { mode, resolved, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.value === mode) || OPTIONS[2];
  // Show the icon of what is actually on screen when following the system.
  const TriggerIcon = mode === "system" ? (resolved === "dark" ? Moon : Sun) : current.icon;

  const menuPos = `${placement === "up" ? "bottom-full mb-2" : "top-full mt-2"} ${align === "left" ? "left-0" : "right-0"}`;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${current.label}`}
        title={variant === "icon" ? `Theme: ${current.label}` : undefined}
        className={
          variant === "icon"
            ? "w-10 h-10 rounded-xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-center text-slate-700 hover:text-[#2563EB] hover:bg-[#EFF6FF] active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            : "w-full flex items-center gap-3 px-3 py-3 rounded-xl min-h-[44px] text-[13px] font-medium text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] transition-all duration-200"
        }
      >
        <TriggerIcon size={variant === "icon" ? 18 : 17} strokeWidth={1.9} className="shrink-0" />
        {variant === "full" && (
          <>
            <span className="truncate min-w-0 flex-1 text-left">Theme: {current.label}</span>
            {placement === "up" ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${menuPos} z-[60] min-w-[168px] rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]`}
        >
          {OPTIONS.map((opt) => {
            const { value, label } = opt;
            const OptionIcon = opt.icon;
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setMode(value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  active ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <OptionIcon size={15} strokeWidth={2} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <Check size={14} strokeWidth={2.5} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
