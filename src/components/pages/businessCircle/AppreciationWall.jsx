import React, { useMemo, useState } from "react";
import { Quote, Search } from "lucide-react";

export default function AppreciationWall({ appreciations = [] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appreciations;
    return appreciations.filter(
      (a) => a.to.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q)
    );
  }, [appreciations, search]);

  return (
    <div>
      <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink mb-4">
        <Quote size={18} className="text-steel" /> Appreciation Wall
      </h2>

      <div className="flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5 bg-white mb-4 max-w-md">
        <Search size={15} className="text-muted shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by member or category"
          className="w-full text-[13px] text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-hairline bg-white">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-muted text-center py-10">No published appreciations yet.</p>
        ) : (
          <div className="divide-y divide-hairline">
            {filtered.map((a) => (
              <div key={a.id} className="px-6 py-4">
                <p className="text-[13.5px] font-medium text-ink">
                  {a.from} → {a.to}
                  {a.category && (
                    <span className="ml-2 text-[11px] font-medium border border-hairline text-muted px-2 py-0.5 rounded-full align-middle">
                      {a.category}
                    </span>
                  )}
                </p>
                <p className="text-[13px] text-muted mt-1.5">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}