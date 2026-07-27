import React from "react";

export default function SelectAudience({
  constituency, setConstituency,
  ward, setWard,
  plan, setPlan,
  sector, setSector,
  tag, setTag,
  businessType, setBusinessType,
  estimatedReach,
  excludeDnd, setExcludeDnd,
  dndExcludedCount,
  onClearFilters,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

      {/* Header */}
      <h2 className="text-[17px] font-bold text-gray-800 mb-5">Select Audience</h2>

      {/* Filter dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 min-w-0">
        <FilterSelect value={constituency} onChange={setConstituency} placeholder="All Constituencies" options={[]} />
        <FilterSelect value={ward}         onChange={setWard}         placeholder="All Wards"          options={[]} />
        <FilterSelect value={plan}         onChange={setPlan}         placeholder="Plan"               options={["Basic", "Prime", "Basic + Prime"]} />
        <FilterSelect value={sector}       onChange={setSector}       placeholder="Sector"             options={[]} />
        <FilterSelect value={tag}          onChange={setTag}          placeholder="Tag"                options={[]} />
        <FilterSelect value={businessType} onChange={setBusinessType} placeholder="Business Type"      options={[]} />
      </div>

      {/* Estimated Reach banner */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-4">
        <div>
          <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 mb-1">
            Estimated Reach
          </p>
          <p className="text-[26px] font-bold text-blue-600 leading-none tabular-nums">
            {estimatedReach.toLocaleString()}
          </p>
        </div>
        <button
          onClick={onClearFilters}
          className="text-[13px] font-semibold text-gray-500 hover:text-blue-600 transition-colors"
        >
          Clear filters
        </button>
      </div>

      {/* DND toggle row */}
      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4">
        <div>
          <p className="text-[13.5px] font-semibold text-gray-800">Exclude DND numbers</p>
          <p className="text-[11.5px] text-gray-400 mt-0.5">
            DND list: {dndExcludedCount} numbers excluded
          </p>
        </div>
        <Toggle checked={excludeDnd} onChange={setExcludeDnd} />
      </div>

    </div>
  );
}

// ── FilterSelect ─────────────────────────────────────────────────────────────

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5
                 text-[12.5px] font-medium text-gray-700
                 focus:outline-none focus:ring-2 focus:ring-blue-200
                 bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}