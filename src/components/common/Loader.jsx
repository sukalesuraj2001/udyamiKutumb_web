import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Shared loading indicator, built on the ink/amber design tokens.
 *
 * Variants:
 * - "inline": small spinner + optional label, for use INSIDE a button (e.g. "Buy Now" while processing)
 * - "card": centered spinner + label filling a card/section, for loading a whole panel
 * - "overlay": spinner over a semi-transparent backdrop, for blocking an entire modal/section during an async action
 *
 * @param {"inline"|"card"|"overlay"} [variant="inline"]
 * @param {string} [label] - optional text next to/under the spinner
 * @param {"light"|"dark"} [tone="dark"] - "light" for use on dark/colored backgrounds (e.g. inside an amber button)
 * @param {number} [size] - spinner pixel size, defaults per variant
 */
export default function Loader({ variant = "inline", label, tone = "dark", size }) {
  const spinnerColor = tone === "light" ? "text-white" : "text-amber";

  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2">
        <Loader2 size={size || 15} className={`animate-spin ${spinnerColor}`} />
        {label && <span>{label}</span>}
      </span>
    );
  }

  if (variant === "card") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14">
        <Loader2 size={size || 26} className="animate-spin text-amber" />
        {label && <p className="text-[13px] text-muted">{label}</p>}
      </div>
    );
  }

  // overlay
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[1px] rounded-2xl">
      <Loader2 size={size || 26} className="animate-spin text-amber" />
      {label && <p className="text-[13px] font-medium text-ink">{label}</p>}
    </div>
  );
}