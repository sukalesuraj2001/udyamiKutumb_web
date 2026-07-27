import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

/**
 * Generic right-side slide-over panel with a smooth open/close transition.
 * Unlike a plain `{open && <Panel/>}`, this keeps the panel mounted for the
 * duration of the closing animation instead of yanking it out instantly.
 *
 * @param {boolean} open
 * @param {function} onClose
 * @param {string} title
 * @param {string} [subtitle]
 * @param {React.ReactNode} children
 */
export default function SlideOver({ open, onClose, title, subtitle, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Mount first with the "off-screen" classes, then flip to visible on
      // the next frame so the transition actually has something to animate from.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 300); // matches duration-300 below
    return () => clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between p-6 border-b border-hairline shrink-0">
          <div>
            <h2 className="font-display text-[19px] text-ink">{title}</h2>
            {subtitle && <p className="text-[13px] text-muted mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}