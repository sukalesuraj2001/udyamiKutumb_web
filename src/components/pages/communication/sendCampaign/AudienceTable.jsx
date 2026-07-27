import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_BADGE = {
  active:  { label: "Active",  cls: "bg-green-100 text-green-700"  },
  dnd:     { label: "DND",     cls: "bg-amber-100 text-amber-700"  },
  invalid: { label: "Invalid", cls: "bg-red-100 text-red-500"      },
};

const COLUMNS = [
  { key: "name",         label: "Member Name",    sortable: true  },
  { key: "id",           label: "Membership ID",  sortable: true  },
  { key: "ward",         label: "Ward",           sortable: true  },
  { key: "sector",       label: "Sector",         sortable: true  },
  { key: "businessType", label: "Business Type",  sortable: false },
  { key: "mobile",       label: "Mobile",         sortable: false },
  { key: "status",       label: "Status",         sortable: true  },
];

function SortIcon({ col, sortKey, sortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} className="text-gray-300" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="text-blue-600" />
    : <ChevronDown size={12} className="text-blue-600" />;
}

/**
 * AudienceTable
 *
 * Props:
 *   members        – Array of member objects (from mockData or API)
 *   selectedIds    – Set<string>
 *   onSelectionChange – (Set<string>) => void
 *   isResolved     – boolean
 *
 * Reusable across: BulkSmsEmail, WhatsApp Outreach, Auto Dialer, AI IVR
 */
export default function AudienceTable({
  members = [],
  selectedIds,
  onSelectionChange,
  isResolved = false,
}) {
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState("name");
  const [sortDir,  setSortDir]  = useState("asc");
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.mobile.includes(q),
    );
  }, [members, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (!COLUMNS.find((c) => c.key === key)?.sortable) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const allOnPageSelected = paginated.length > 0 && paginated.every((m) => selectedIds.has(m.id));
  const someOnPageSelected = paginated.some((m) => selectedIds.has(m.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allOnPageSelected) paginated.forEach((m) => next.delete(m.id));
    else paginated.forEach((m) => next.add(m.id));
    onSelectionChange(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  if (!isResolved) {
    return console.log("resloved")
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-bold text-gray-800">Member Preview</h3>
          <span className="text-[12px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {sorted.length} members
          </span>
          {selectedIds.size > 0 && (
            <span className="text-[12px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search members…"
              className="border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-[13px]
                         text-gray-800 placeholder:text-gray-400 bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-200 w-52"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-gray-200 rounded-xl px-2.5 py-2 text-[13px]
                       text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="pl-5 pr-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => el && (el.indeterminate = someOnPageSelected && !allOnPageSelected)}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600
                             focus:ring-blue-200 cursor-pointer"
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`pr-5 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap
                              ${col.sortable ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="text-center py-10">
                  <p className="text-[13.5px] font-semibold text-gray-400">No members match your search.</p>
                  <p className="text-[12px] text-gray-300 mt-1">Try adjusting your filters or search term.</p>
                </td>
              </tr>
            ) : (
              paginated.map((member) => {
                const badge = STATUS_BADGE[member.status] || STATUS_BADGE.active;
                const isSelected = selectedIds.has(member.id);
                return (
                  <tr
                    key={member.id}
                    onClick={() => toggleOne(member.id)}
                    className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="pl-5 pr-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(member.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600
                                   focus:ring-blue-200 cursor-pointer"
                      />
                    </td>
                    <td className="pr-5 py-3 text-[13px] font-semibold text-gray-800 whitespace-nowrap">
                      {member.name}
                    </td>
                    <td className="pr-5 py-3 text-[12.5px] text-gray-500 font-mono">{member.id}</td>
                    <td className="pr-5 py-3 text-[12.5px] text-gray-600 whitespace-nowrap">{member.ward}</td>
                    <td className="pr-5 py-3 text-[12.5px] text-gray-600">{member.sector}</td>
                    <td className="pr-5 py-3 text-[12.5px] text-gray-500">{member.businessType}</td>
                    <td className="pr-5 py-3 text-[12.5px] text-gray-500 whitespace-nowrap">{member.mobile}</td>
                    <td className="pr-5 py-3">
                      <span className={`text-[11.5px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p className="text-[12.5px] text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-600">
            {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)}
          </span>{" "}
          of <span className="font-semibold text-gray-600">{sorted.length}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <PaginationButton onClick={() => setPage(1)} disabled={page === 1} label="«" />
          <PaginationButton onClick={() => setPage((p) => p - 1)} disabled={page === 1} label="‹" />
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            if (pageNum > totalPages) return null;
            return (
              <PaginationButton
                key={pageNum}
                onClick={() => setPage(pageNum)}
                active={page === pageNum}
                label={pageNum}
              />
            );
          })}
          <PaginationButton onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} label="›" />
          <PaginationButton onClick={() => setPage(totalPages)} disabled={page === totalPages} label="»" />
        </div>
      </div>
    </div>
  );
}

function PaginationButton({ onClick, disabled, active, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] h-8 px-2 rounded-lg text-[12.5px] font-semibold transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : disabled
          ? "text-gray-300 cursor-not-allowed"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}
