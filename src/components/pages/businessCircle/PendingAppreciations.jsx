import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function PendingAppreciations({ items = [] }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink mb-4">
        <CheckCircle2 size={18} className="text-steel" /> Pending appreciations ({items.length})
      </h2>

      {items.length === 0 ? (
        <p className="text-[13px] text-muted text-center py-8">Nothing waiting for review.</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-hairline bg-white p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-medium text-ink">
                  {a.from} → {a.to}
                </p>
                <p className="text-[13px] text-muted mt-1">{a.message}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-[12.5px] font-semibold text-forest hover:text-ink transition-colors">Approve</button>
                <button className="text-[12.5px] font-semibold text-brick hover:text-ink transition-colors">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}