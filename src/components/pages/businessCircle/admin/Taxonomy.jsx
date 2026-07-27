import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Loader2, AlertCircle } from "lucide-react";
import {
  fetchSectors,
  selectSectors,
  selectCounts,
  selectFetchStatus,
  selectTaxonomyError,
} from "../../../redux/slices/taxonomySlice.js"; // ← path adjust பண்ணு

export default function Taxonomy() {
  const dispatch    = useDispatch();
  const sectors     = useSelector(selectSectors);
  const counts      = useSelector(selectCounts);
  const fetchStatus = useSelector(selectFetchStatus);
  const error       = useSelector(selectTaxonomyError);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchSectors());
  }, [dispatch]);

  const loading = fetchStatus === "loading";

  // ── Search filter — sectorName or subSectorName or tagName ──────
  const filtered = sectors.filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (s.sectorName.toLowerCase().includes(q)) return true;
    return s.subSectors?.some(
      (ss) =>
        ss.subSectorName.toLowerCase().includes(q) ||
        ss.tags?.some((t) => t.tagName.toLowerCase().includes(q))
    );
  });

  // Total tag count across all sectors
  const totalTagCount = sectors.reduce(
    (acc, s) => acc + (s.subSectors?.reduce((a, ss) => a + (ss.tagCount ?? 0), 0) ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827]">Sector taxonomy</h2>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-medium rounded-lg px-4 py-2.5">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Sectors",      value: counts.totalSectorCount    },
          { label: "Sub-sectors",  value: counts.totalSubSectorCount },
          { label: "Tags",         value: counts.totalTagCount       },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-[#F9F7F4] border border-[#EDE9E0] p-4">
            <p className="text-[12px] text-[#9CA3AF] mb-2">{label}</p>
            <p className="text-[28px] font-bold leading-none text-[#111827]">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {/* Search */}
        <div className="flex items-center gap-2.5 border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 mb-4">
          <Search size={14} className="text-[#9CA3AF] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sector, sub-sector or tag"
            className="flex-1 text-[13.5px] text-[#111827] bg-transparent outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading sectors…
          </div>
        ) : (
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Sector", "Sub-sectors", "Tags", "Status"].map((h, i) => (
                  <th
                    key={h}
                    className={`pb-2.5 text-[11.5px] font-medium text-[#9CA3AF] ${i === 0 ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[12.5px] text-gray-400">
                    No sectors found.
                  </td>
                </tr>
              ) : filtered.map(({ sectorId, sectorName, isActive, subSectors, subSectorCount }, i) => {
                const tagCount = subSectors?.reduce((a, ss) => a + (ss.tagCount ?? 0), 0) ?? 0;
                return (
                  <tr key={sectorId} className={i < filtered.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                    <td className="py-3 text-[#374151]">{sectorName}</td>
                    <td className="py-3 text-right text-[#6B7280]">{subSectorCount ?? 0}</td>
                    <td className="py-3 text-right text-[#6B7280]">{tagCount}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block text-[12px] font-medium px-2.5 py-1 rounded-lg ${
                        isActive
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <p className="text-[12px] text-[#9CA3AF] mt-4">
          Showing {filtered.length} of {sectors.length} sectors
        </p>
      </div>
    </div>
  );
}