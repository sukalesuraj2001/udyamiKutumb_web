import React, { useState } from "react";
import { Search, SlidersHorizontal, Bookmark, X } from "lucide-react";

const FILTER_OPTIONS = {
  ward: ["Ward 1", "Ward 2", "Ward 3", "Ward 4"],
  states: ["Karnataka", "Andhra Pradesh", "Tamil Nadu", "Kerala"],
  district: ["Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural"],
  sector: ["Retail", "Manufacturing", "Agriculture", "IT", "Service"],
  leadStatus: ["New", "Interested", "Follow Up", "Converted", "Rejected"],
  lastContact: ["Today", "Yesterday", "This Week", "This Month"],
  taluk: ["Bengaluru North", "Bengaluru South", "Anekal", "Devanahalli", "Hoskote", "Nelamangala", "Mysuru"],
};

const FILTER_FIELDS = [
  { key: "states",   label: "States" },
  { key: "district", label: "District" },
  { key: "sector",   label: "Sector" },
  { key: "ward",     label: "Ward / Hobli" },
  { key: "taluk",    label: "Taluk" },
];

export default function CpFillter({ search, onSearchChange, filters, onFilterChange, onSaveSegment }) {
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleClearFilters = () => {
    const clearedFilters = {};
    FILTER_FIELDS.forEach((f) => { clearedFilters[f.key] = ""; });
    onFilterChange("clear", clearedFilters);
  };

  return (
    <div className="space-y-3">
      {/* Search + Filter toggle row */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px] flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white shadow-sm">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID, business…"
            className="w-full text-[13.5px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 text-[13.5px] font-semibold px-4 py-2.5 rounded-xl border transition-colors shrink-0 shadow-sm ${
            showFilters || activeCount > 0
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FILTER_FIELDS.map((f) => (
              <select
                key={f.key}
                value={filters[f.key] || ""}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[12.5px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-colors"
              >
                <option value="">{f.label}</option>
                {(FILTER_OPTIONS[f.key] || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
            <button
              disabled={activeCount === 0}
              onClick={onSaveSegment}
              className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Bookmark size={13} /> Save as Segment
            </button>
            {activeCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                <X size={13} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}