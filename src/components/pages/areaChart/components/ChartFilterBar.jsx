import React from "react";
import { Search } from "lucide-react";

const SECTION_OPTIONS = [
  { value: "all", label: "All Sections" },
  { value: "patrons", label: "Udyami Patron" },
  { value: "chairmen", label: "Chairman" },
  { value: "advisories", label: "Advisory" },
  { value: "mentors", label: "Mentor" },
  { value: "core", label: "Core Committee" },
  { value: "sectors", label: "Sectors" },
  { value: "ums", label: "UMS Roles" },
];

export default function ChartFilterBar({
  search,
  onSearchChange,
  sectionFilter,
  onSectionFilterChange,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search input */}
      {/* <div className="flex-1 min-w-[220px] flex items-center gap-2.5 h-10 border border-slate-200 rounded-lg px-3.5 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or company…"
          className="w-full text-[13.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div> */}

      {/* Section dropdown */}
      {/* <select
        value={sectionFilter}
        onChange={(e) => onSectionFilterChange(e.target.value)}
        className="h-10 text-[13px] font-medium text-slate-700 border border-slate-200 rounded-lg px-3.5 pr-9 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer"
      >
        {SECTION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select> */}
    </div>
  );
}