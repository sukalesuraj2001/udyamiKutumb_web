import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-hairline flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-muted px-1">…</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
              p === page ? "bg-ink text-white" : "text-ink hover:bg-ink/5"
            }`}
          >
            {p}
          </button>
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 rounded-lg border border-hairline flex items-center justify-center text-muted hover:text-ink hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}