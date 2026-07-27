import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  ChevronDown, ChevronUp, SlidersHorizontal, Search, X,
} from "lucide-react";
import { MOCK_FILTERS } from "../mockData.js";
import FilterChips from "./FilterChips.jsx";
import CsvDataTable from "./CsvDataTable.jsx";
import { selectUploadStatus } from "../../../redux/slices/sendMessageSlice.js";
import { useSelector } from "react-redux";

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
  "text-gray-800 placeholder:text-gray-400 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSelect({ label, value, onChange, options, placeholder = "All" }) {
  return (
    <div>
      <label className="text-[12.5px] font-semibold text-gray-600 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectPills({ label, options, selected, onChange }) {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  return (
    <div>
      <label className="text-[12.5px] font-semibold text-gray-600 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => toggle(o.value)}
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${selected.includes(o.value)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-[13px] font-semibold text-gray-700 hover:text-gray-900"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="mt-3 space-y-4">{children}</div>}
    </div>
  );
}

// ── Main AudienceFilters ──────────────────────────────────────────────────────

/**
 * AudienceFilters
 *
 * Props:
 *   filters     – current filter state object
 *   onChange    – (key, value) => void
 *   onResolve   – () => void
 *   isResolving – boolean
 */
export default function AudienceFilters({ filters, onChange, onResolve, isResolving = false }) {
  const [collapsed, setCollapsed] = useState(false);

  const uploadStatus = useSelector(selectUploadStatus);
  const uploadSucceeded = uploadStatus === "succeeded";

  // ── Filter chip helpers ────────────────────────────────────────────────────

  const districtOptions = filters.state
    ? MOCK_FILTERS.districts.filter((d) => d.state === filters.state)
    : MOCK_FILTERS.districts;

  const talukOptions = filters.district
    ? MOCK_FILTERS.taluks.filter((t) => t.district === filters.district)
    : MOCK_FILTERS.taluks;

  const wardOptions = filters.taluk
    ? MOCK_FILTERS.wards.filter((w) => w.taluk === filters.taluk)
    : MOCK_FILTERS.wards;

  const buildChips = useCallback(() => {
    const chips = [];

    const addSelect = (key, options) => {
      if (filters[key]) {
        const opt = options.find((o) => o.value === filters[key]);
        if (opt) chips.push({ key, label: opt.label });
      }
    };

    addSelect("state", MOCK_FILTERS.states);
    addSelect("district", MOCK_FILTERS.districts);
    addSelect("taluk", MOCK_FILTERS.taluks);
    addSelect("ward", MOCK_FILTERS.wards);
    addSelect("sector", MOCK_FILTERS.sectors);
    addSelect("plan", MOCK_FILTERS.plans);
    addSelect("businessType", MOCK_FILTERS.businessTypes);

    const addMulti = (key, options) => {
      (filters[key] || []).forEach((val) => {
        const opt = options.find((o) => o.value === val);
        if (opt) chips.push({ key: `${key}__${val}`, label: opt.label });
      });
    };

    addMulti("chapter", MOCK_FILTERS.chapters);
    addMulti("membershipType", MOCK_FILTERS.membershipTypes);
    addMulti("businessCategory", MOCK_FILTERS.businessCategories);
    addMulti("tags", MOCK_FILTERS.tags);

    if (filters.memberSearch) {
      chips.push({ key: "memberSearch", label: `"${filters.memberSearch}"` });
    }

    return chips;
  }, [filters]);

  const handleChipRemove = (chipKey) => {
    if (chipKey.includes("__")) {
      const [filterKey, val] = chipKey.split("__");
      onChange(filterKey, (filters[filterKey] || []).filter((v) => v !== val));
    } else {
      if (["chapter", "membershipType", "businessCategory", "tags"].includes(chipKey)) {
        onChange(chipKey, []);
      } else {
        onChange(chipKey, "");
      }
    }
  };

  const chips = buildChips();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-blue-600" />
            <h2 className="text-[15px] font-bold text-gray-800">Audience Filters</h2>
            {chips.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {chips.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-[12.5px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            {collapsed ? "Expand" : "Collapse"}
          </button>
        </div>

        {/* Active chips – always visible */}
        {chips.length > 0 && (
          <div className="px-6 pt-3 pb-0">
            <FilterChips chips={chips} onRemove={handleChipRemove} />
          </div>
        )}

        {!collapsed && (
          <div className="px-6 py-5 space-y-5">

            {/* Member Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.memberSearch || ""}
                onChange={(e) => onChange("memberSearch", e.target.value)}
                placeholder="Search by name, mobile, or membership ID…"
                className={`${inputCls} pl-9`}
              />
              {filters.memberSearch && (
                <button
                  onClick={() => onChange("memberSearch", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filters section */}
            <CollapsibleSection title="Filters">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FilterSelect
                  label="Ward"
                  value={filters.ward || ""}
                  onChange={(v) => onChange("ward", v)}
                  options={wardOptions}
                />
              </div>
            </CollapsibleSection>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={onResolve}
                disabled={isResolving}
                className="flex items-center gap-2 bg-blue-600 text-white text-[13px] font-semibold
                         px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98]
                         disabled:opacity-60 transition-all shadow-sm shadow-blue-100"
              >
                {isResolving ? "Resolving…" : "Resolve Audience"}
              </button>
              <button
                onClick={() => {
                  const keys = ["state", "district", "taluk", "ward", "chapter", "membershipType",
                    "businessCategory", "sector", "plan", "tags", "businessType", "memberSearch"];
                  keys.forEach((k) => onChange(k, Array.isArray(filters[k]) ? [] : ""));
                }}
                className="text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Reset filters
              </button>
            </div>

          </div>
        )}
      </div>

      {/* CSV Data Table — shown after upload succeeds */}
      <CsvDataTable fetchTrigger={uploadSucceeded} />
    </>
  );
}