import React from "react";
import { X } from "lucide-react";

/**
 * FilterChips
 *
 * Props:
 *   chips   – Array<{ key: string, label: string }>
 *   onRemove – (key: string) => void
 *
 * Reusable across: BulkSmsEmail, WhatsApp Outreach, Auto Dialer, AI IVR
 */
export default function FilterChips({ chips = [], onRemove }) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700
                     border border-blue-200 text-[12px] font-semibold
                     px-2.5 py-1 rounded-full"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key)}
            className="text-blue-400 hover:text-blue-700 transition-colors"
            aria-label={`Remove ${chip.label}`}
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </span>
      ))}

      {chips.length > 0 && (
        <button
          onClick={() => chips.forEach((c) => onRemove(c.key))}
          className="text-[12px] font-semibold text-gray-400 hover:text-gray-700
                     px-2.5 py-1 rounded-full border border-gray-200
                     hover:bg-gray-50 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
