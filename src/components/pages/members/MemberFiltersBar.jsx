// MemberFiltersBar.jsx - Add clear filters button
import React, { useState } from "react";
import { Search, SlidersHorizontal, Bookmark, X } from "lucide-react";

const FILTER_OPTIONS = {
  constituency: ["Chennai South", "Chennai Central", "Madurai", "Coimbatore"],
  ward: ["Ward 1", "Ward 2", "Ward 3", "Ward 4"],
  district: ["Chennai", "Madurai", "Salem", "Coimbatore", "Tirunelveli"],
  plan: ["Free", "Silver", "Gold", "Premium"],
  sector: ["Retail", "Manufacturing", "Agriculture", "IT", "Service"],
  businessType: ["Proprietor", "Partnership", "Private Limited", "Startup"],
  stage: ["Idea", "Started", "Growing", "Established"],
  gender: ["Male", "Female", "Other"],
  ageBand: ["18-25", "26-35", "36-45", "46-60", "60+"],
  leadStatus: ["New", "Interested", "Follow Up", "Converted", "Rejected"],
  lastContact: ["Today", "Yesterday", "This Week", "This Month"],
  turnover: ["< 1 Lakh", "1-5 Lakhs", "5-25 Lakhs", "25L+"],
  income: ["< 25K", "25K-50K", "50K-1L", "1L+"],
  tag: ["Volunteer", "Donor", "Influencer", "Business Owner"]
};

const FILTER_FIELDS = [
  { key: "constituency", label: "All Constituencies" },
  { key: "ward", label: "All Wards…" },
  { key: "district", label: "District" },
  { key: "plan", label: "Plan" },
  { key: "sector", label: "Sector" },
  { key: "businessType", label: "Business Type" },
  { key: "stage", label: "Stage" },
  { key: "gender", label: "Gender" },
  { key: "ageBand", label: "Age Band" },
  { key: "leadStatus", label: "Lead Status" },
  { key: "lastContact", label: "Last Contact" },
  { key: "turnover", label: "Turnover" },
  { key: "income", label: "Income" },
  { key: "tag", label: "Tag" },
];

export default function MemberFiltersBar({ search, onSearchChange, filters, onFilterChange, onSaveSegment }) {
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {};
    FILTER_FIELDS.forEach(f => {
      clearedFilters[f.key] = "";
    });
    onFilterChange("clear", clearedFilters);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px] flex items-center gap-2 border border-hairline rounded-xl px-3.5 py-2.5 bg-white">
          <Search size={16} className="text-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, ID, business…"
            className="w-full text-[13.5px] text-ink placeholder:text-muted focus:outline-none bg-transparent"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 text-[13.5px] font-semibold px-4 py-2.5 rounded-xl border transition-colors shrink-0 ${
            showFilters || activeCount > 0 ? "bg-amber-tint text-amber border-amber/30" : "border-hairline text-ink hover:bg-ink/5"
          }`}
        >
          <SlidersHorizontal size={15} /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-2xl border border-hairline bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {FILTER_FIELDS.map((f) => (
              <select
                key={f.key}
                value={filters[f.key] || ""}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className="w-full min-w-0 border border-hairline rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
              >
                <option value="">{f.label}</option>
                {(FILTER_OPTIONS[f.key] || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                disabled={activeCount === 0}
                onClick={onSaveSegment}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Bookmark size={14} /> Save as Segment
              </button>
            </div>
            {activeCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-brick hover:text-brick/80 transition-colors"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}