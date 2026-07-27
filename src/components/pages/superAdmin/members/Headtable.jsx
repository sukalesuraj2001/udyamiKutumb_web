import React, { useState, useMemo } from "react";
import {
  Search, SlidersHorizontal, ArrowUpDown,
  ArrowUp, ArrowDown, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, MoreHorizontal,
  Download, ChevronDown, X
} from "lucide-react";

/* ─── COLUMN DEFINITIONS BY TYPE ───────────────────────────── */
const EXTRA_COLS = {
  state:    [],
  district: ["district"],
  taluk:    ["district", "taluk"],
  ward:     ["district", "taluk", "wardHobli"],
};

const COL_LABELS = {
  district:  "District",
  taluk:     "Taluk",
  wardHobli: "Ward / Hobli",
};

/* ─── STATUS BADGE ──────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = status === "active"
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-amber-50 text-amber-700 border border-amber-100";
  return (
    <span className={`inline-flex items-center text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${cfg}`}>
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
};

/* ─── AVATAR INITIALS ───────────────────────────────────────── */
const Avatar = ({ name }) => {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-[#2563EB]">{initials}</span>
    </div>
  );
};

/* ─── ACTION BUTTONS ────────────────────────────────────────── */
/* FIX 4 — justify-center so icons are always centred in their cell;
           gap-2 gives equal breathing room between all three icons  */
const Actions = ({ row, onView, onEdit, onDelete }) => (
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => onView?.(row)}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-blue-50 hover:text-[#2563EB] transition-colors"
      title="View"
    >
      <Eye size={13} strokeWidth={2} />
    </button>
    <button
      onClick={() => onEdit?.(row)}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-slate-100 hover:text-[#475569] transition-colors"
      title="Edit"
    >
      <Pencil size={13} strokeWidth={2} />
    </button>
    <button
      onClick={() => onDelete?.(row)}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors"
      title="Delete"
    >
      <Trash2 size={13} strokeWidth={2} />
    </button>
  </div>
);

/* ─── MAIN COMPONENT ────────────────────────────────────────── */
export default function HeadTable({
  title,
  subtitle,
  icon: Icon,
  type = "state",   // "state" | "district" | "taluk" | "ward"
  data = [],
  onView,
  onEdit,
  onDelete,
}) {
  const [search, setSearch]   = useState("");
  const [sortDir, setSortDir] = useState(null); // null | "asc" | "desc"
  const [limit, setLimit]     = useState(10);
  const [page, setPage]       = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  /* ── Filter fields — all driven by type ── */
  const FILTER_KEYS = {
    state:    ["state", "status"],
    district: ["state", "district", "status"],
    taluk:    ["state", "district", "taluk", "status"],
    ward:     ["state", "district", "taluk", "wardHobli", "status"],
  };
  const FILTER_LABELS = {
    state: "State", district: "District", taluk: "Taluk",
    wardHobli: "Ward / Hobli", status: "Status",
  };
  const filterKeys = FILTER_KEYS[type] ?? ["state", "status"];

  const emptyFilters = () => Object.fromEntries(filterKeys.map((k) => [k, "all"]));
  const [filters, setFilters] = useState(emptyFilters);

  /* ── Dynamic options from data ── */
  const options = useMemo(() => {
    const result = {};
    filterKeys.forEach((k) => {
      const unique = [...new Set(data.map((r) => r[k]).filter(Boolean))].sort();
      result[k] = unique;
    });
    return result;
  }, [data, type]);

  /* ── Active filter count (excluding "all") ── */
  const activeCount = Object.values(filters).filter((v) => v !== "all").length;

  const resetFilters = () => { setFilters(emptyFilters()); setPage(1); };

  const setFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const extraKeys = EXTRA_COLS[type] ?? [];

  /* ── Filter + Search ── */
  const afterSearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      const matchSearch = !q || [r.name, r.email, r.mobile, r.memberId]
        .some((v) => v?.toLowerCase().includes(q));
      const matchFilters = filterKeys.every((k) =>
        filters[k] === "all" || r[k] === filters[k]
      );
      return matchSearch && matchFilters;
    });
  }, [data, search, filters]);

  /* ── Sort ── */
  const afterSort = useMemo(() => {
    if (!sortDir) return afterSearch;
    return [...afterSearch].sort((a, b) =>
      sortDir === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [afterSearch, sortDir]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(afterSort.length / limit));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = afterSort.slice((safePage - 1) * limit, safePage * limit);

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const cycleSort = () => {
    setSortDir((d) => (d === null ? "asc" : d === "asc" ? "desc" : null));
    setPage(1);
  };

  const SortIcon = sortDir === "asc" ? ArrowUp : sortDir === "desc" ? ArrowDown : ArrowUpDown;

  /* ── Page number list ── */
  const pageNums = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3)   return [1, 2, 3, 4, "…", totalPages];
    if (safePage >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", safePage - 1, safePage, safePage + 1, "…", totalPages];
  };

  /* ── TH helper — FIX 4: accepts optional className for per-column alignment ── */
  const TH = ({ children, className = "" }) => (
    <th className={`text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8] px-5 py-3 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)]">

      {/* ── TOOLBAR ─────────────────────────────────────────── */}
      <div className="border-b border-[#F1F5F9]">

        {/* Row 1 — Title + right-side controls */}
        <div className="flex flex-wrap items-center gap-3 justify-between px-5 py-4">

          {/* Title */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Icon size={15} className="text-[#2563EB]" strokeWidth={2.2} />
              </div>
            )}
            <div>
              <h2 className="text-[14px] font-semibold text-[#1E293B] leading-tight">{title}</h2>
              {subtitle && <p className="text-[11px] text-[#94A3B8] mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Sort */}
            <button
              onClick={cycleSort}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] border rounded-lg transition-colors ${
                sortDir
                  ? "bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]"
                  : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              <SortIcon size={13} />
              {sortDir === "asc" ? "A → Z" : sortDir === "desc" ? "Z → A" : "Sort"}
            </button>

            {/* Limit */}
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-white text-[#475569] outline-none cursor-pointer hover:bg-[#F1F5F9] transition-colors"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>Show {n}</option>
              ))}
            </select>

            {/* Export */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-white text-[#475569] hover:bg-[#F1F5F9] transition-colors">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Row 2 — Search + Filter toggle */}
        <div className="flex items-center gap-2 px-5 pb-4">

          {/* Search — full width */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search name, email, mobile, ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:bg-white transition-all"
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] border rounded-lg transition-colors shrink-0 ${
              activeCount > 0
                ? "bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]"
                : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-bold">
                {activeCount}
              </span>
            )}
            <ChevronDown
              size={12}
              className={`ml-0.5 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── FILTER PANEL (expand/collapse) ─────────────────── */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            filterOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-5 pb-5">
            {/*
              FIX 1 — Filter Panel
              · p-5 (was p-4): more breathing room inside the card
              · gap-4 (was gap-3): equal, larger gap between every dropdown
              · min-w-[160px] (was 140px): prevents narrow shrinking on mid-size screens
              · flex-1 + flex-wrap: natural wrapping on small screens at full width
              · gap-1.5 (was gap-1): tighter label-to-select rhythm
            */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
              {/* FIX 1 — justify-start keeps all dropdowns anchored left.
                    Removed flex-1 from child; replaced with w-full max-w-[240px]
                    so each dropdown has a controlled, consistent width and 2-field
                    pages (State Heads) no longer stretch to opposite edges. */}
              <div className="flex flex-wrap items-end justify-start gap-4">

                {/* One native <select> per filter key */}
                {filterKeys.map((key) => (
                  <div key={key} className="flex flex-col gap-1.5 w-full min-w-[160px] max-w-[240px]">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                      {FILTER_LABELS[key]}
                    </label>
                    <div className="relative">
                      <select
                        value={filters[key]}
                        onChange={(e) => setFilter(key, e.target.value)}
                        className={`w-full appearance-none pl-3 pr-7 py-1.5 text-[12px] border rounded-lg outline-none cursor-pointer transition-colors ${
                          filters[key] !== "all"
                            ? "border-[#DBEAFE] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9]"
                        }`}
                      >
                        {/* FIX 2 — "status" → "Statuses"; all other keys append "s" normally */}
                        <option value="all">
                          All {key === "status" ? "Statuses" : `${FILTER_LABELS[key]}s`}
                        </option>
                        {key === "status"
                          ? ["active", "inactive"].map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))
                          : (options[key] ?? []).map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))
                        }
                      </select>
                      <ChevronDown
                        size={11}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                      />
                    </div>
                  </div>
                ))}

                {/* Clear button — only shown when filters are active */}
                {activeCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-[12px] border border-[#E2E8F0] rounded-lg bg-white text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors shrink-0"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── TABLE ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <TH>Name</TH>
              {/* FIX 2 — Mobile col: min-w keeps the header wide enough */}
              <TH className="min-w-[130px]">Mobile</TH>
              {/* FIX 3 — Member ID col: min-w prevents badge from being squeezed */}
              <TH className="min-w-[120px]">Member ID</TH>
              <TH>State</TH>
              {extraKeys.map((k) => <TH key={k}>{COL_LABELS[k]}</TH>)}
              <TH>Status</TH>
              {/* FIX 4 — Actions header: text-center aligns it over the centred icons */}
              <TH className="text-center min-w-[100px]">Actions</TH>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((row, i) => (
              <tr key={row.memberId ?? i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">

                {/* Name + Email */}
                <td className="px-5 py-3.5 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar name={row.name} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1E293B] leading-tight truncate">{row.name}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{row.email}</p>
                    </div>
                  </div>
                </td>

                {/*
                  FIX 2 — Mobile Number Column
                  · min-w-[130px] on td reserves space for a full number
                  · whitespace-nowrap on span prevents wrapping mid-number
                */}
                <td className="px-5 py-3.5 align-middle min-w-[130px]">
                  <span className="text-[12.5px] text-[#475569] tabular-nums whitespace-nowrap">
                    {row.mobile}
                  </span>
                </td>

                {/*
                  FIX 3 — Member ID Badge
                  · whitespace-nowrap: "UDY-4001" always stays on one line
                  · inline-flex + min-w-[72px] + justify-center: compact but never clipped
                */}
                <td className="px-5 py-3.5 align-middle min-w-[120px]">
                  <span className="inline-flex items-center justify-center text-[12px] font-mono font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-md whitespace-nowrap min-w-[72px]">
                    {row.memberId}
                  </span>
                </td>

                {/* State */}
                <td className="px-5 py-3.5 align-middle">
                  <span className="text-[12.5px] text-[#64748B]">{row.state}</span>
                </td>

                {/* Extra columns */}
                {extraKeys.map((k) => (
                  <td key={k} className="px-5 py-3.5 align-middle">
                    <span className="text-[12.5px] text-[#64748B]">{row[k] ?? "—"}</span>
                  </td>
                ))}

                {/* Status */}
                <td className="px-5 py-3.5 align-middle">
                  <StatusBadge status={row.status} />
                </td>

                {/*
                  FIX 4 — Actions Column
                  · text-center on td + justify-center inside <Actions>
                    keeps the three icon buttons perfectly centred
                */}
                <td className="px-5 py-3.5 align-middle text-center min-w-[100px]">
                  <Actions row={row} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}

            {pageSlice.length === 0 && (
              <tr>
                <td colSpan={7 + extraKeys.length} className="px-5 py-12 text-center text-[13px] text-[#94A3B8]">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-[#F1F5F9]">
        <p className="text-[12px] text-[#94A3B8]">
          Showing <span className="font-semibold text-[#475569]">{afterSort.length === 0 ? 0 : (safePage - 1) * limit + 1}</span>
          {" – "}
          <span className="font-semibold text-[#475569]">{Math.min(safePage * limit, afterSort.length)}</span>
          {" of "}
          <span className="font-semibold text-[#475569]">{afterSort.length}</span> results
        </p>

        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page numbers */}
          {pageNums().map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[12px] text-[#94A3B8]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-colors ${
                  safePage === p
                    ? "bg-[#2563EB] text-white border border-[#2563EB]"
                    : "border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}