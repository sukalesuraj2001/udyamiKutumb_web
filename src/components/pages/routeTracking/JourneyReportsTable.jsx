import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCPJourneyReports,
  selectJourneyReports,
  selectJourneyReportsStatus,
  selectAllRoutes,
} from "../../redux/slices/Routetrackingslice.js";
import { selectToken } from "../../redux/slices/authSlice";

const STATUS_CONFIG = {
  MATCHED:   { label: "Matched",   cls: "bg-green-50 text-green-700 border-green-200" },
  PARTIAL:   { label: "Partial",   cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  COMPLETED: { label: "Completed", cls: "bg-green-50 text-green-700 border-green-200" },
  UNMATCHED: { label: "Unmatched", cls: "bg-red-50 text-red-700 border-red-200" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function formatDistance(distMeters) {
  if (distMeters == null || isNaN(distMeters)) return "—";
  if (distMeters >= 1000) {
    return `${(distMeters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(distMeters)} m`;
}

export default function JourneyReportsTable() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const allRoutes = useSelector(selectAllRoutes);
  const reports = useSelector(selectJourneyReports);
  const reportsStatus = useSelector(selectJourneyReportsStatus);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const PAGE_SIZE = 8;

  // Map channelPartnerId to channelPartnerName from allRoutes
  const cpNameMap = useMemo(() => {
    const map = {};
    allRoutes.forEach((r) => {
      if (r.channelPartnerId && r.channelPartnerName) {
        map[r.channelPartnerId] = r.channelPartnerName;
      }
    });
    return map;
  }, [allRoutes]);

  // Fetch journey reports for every unique CP in routes
  useEffect(() => {
    if (!token || allRoutes.length === 0) return;

    const uniqueCpIds = [
      ...new Set(
        allRoutes
          .map((r) => r.channelPartnerId)
          .filter(Boolean)
      ),
    ];

    uniqueCpIds.forEach((channelPartnerId) => {
      dispatch(fetchCPJourneyReports({ channelPartnerId, token }));
    });
  }, [token, allRoutes, dispatch]);

  // Filter & search
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const isMatched = r.isRouteMatched || r.status?.toUpperCase() === "MATCHED";
      const statusKey = isMatched ? "MATCHED" : (r.status || "COMPLETED").toUpperCase();
      const matchesFilter = filter === "ALL" || statusKey === filter;

      const cpName = r.channelPartnerName || cpNameMap[r.channelPartnerId] || "";
      const matchesSearch =
        !search ||
        r.routeName?.toLowerCase().includes(search.toLowerCase()) ||
        cpName.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [reports, filter, search, cpNameMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  // Summary stats
  const avgCoverage = useMemo(() => {
    if (reports.length === 0) return 0;
    const sum = reports.reduce((acc, r) => {
      const cov = r.coveragePercentage ?? r.coveragePercent ?? r.coverage ?? 0;
      return acc + Number(cov);
    }, 0);
    return (sum / reports.length).toFixed(1);
  }, [reports]);

  const matchedCount = useMemo(() => {
    return reports.filter(
      (r) => r.isRouteMatched || (r.status || "").toUpperCase() === "MATCHED"
    ).length;
  }, [reports]);

  const totalDistanceCovered = useMemo(() => {
    const sumMeters = reports.reduce((acc, r) => acc + (Number(r.actualDistance) || 0), 0);
    return (sumMeters / 1000).toFixed(1);
  }, [reports]);

  const isLoading = reportsStatus === "loading";

  return (
    <div>
      {/* Summary Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Total Journeys</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-2xl font-bold text-indigo-600">{avgCoverage}%</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Avg. Coverage</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Fully Matched</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{totalDistanceCovered} km</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Total Traveled</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {["ALL", "MATCHED", "PARTIAL", "UNMATCHED"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                filter === f
                  ? "bg-white text-indigo-600 font-semibold shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 w-64 bg-white"
            placeholder="Search route or partner…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table Body */}
      {isLoading && reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading journey reports…</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#94a3b8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-700 font-medium">No journey reports yet</p>
          <p className="text-gray-400 text-sm">Reports appear after a Channel Partner completes a journey</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Channel Partner</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Route Name</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Coverage %</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Distance (Actual / Plan)</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Duration (Actual / Plan)</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Points (Covered / Total)</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Deviation</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Completed</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((report, i) => {
                  const rid = report.reportId || report._id || report.id || i;
                  const isMatched = report.isRouteMatched || report.status?.toUpperCase() === "MATCHED";
                  const statusKey = isMatched ? "MATCHED" : (report.status || "COMPLETED").toUpperCase();
                  const badge = STATUS_CONFIG[statusKey] || STATUS_CONFIG.COMPLETED;

                  // Fields matching backend API response
                  const rawCoverage = report.coveragePercentage ?? report.coveragePercent ?? report.coverage ?? 0;
                  const coveragePct = Number(rawCoverage).toFixed(1);
                  const cpName = report.channelPartnerName || cpNameMap[report.channelPartnerId] || "Channel Partner";
                  const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                  const plannedDist = report.plannedDistance != null ? formatDistance(report.plannedDistance) : "—";
                  const actualDist = report.actualDistance != null ? formatDistance(report.actualDistance) : "—";

                  const plannedDur = report.plannedDuration != null ? `${report.plannedDuration}m` : "—";
                  const actualDur = report.actualDuration != null ? `${report.actualDuration}m` : "—";

                  const totalPts = report.totalTrackingPoints ?? 0;
                  const coveredPts = report.coveredPoints ?? 0;
                  const devPts = report.deviatedPoints ?? 0;
                  const devDist = report.totalDeviationDistance ?? 0;

                  return (
                    <tr key={rid} className="hover:bg-gray-50/80 transition-colors">
                      {/* CP Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <span className="font-semibold text-gray-900 whitespace-nowrap">{cpName}</span>
                        </div>
                      </td>

                      {/* Route Name */}
                      <td className="py-3.5 px-4 font-medium text-gray-800 max-w-[180px]">
                        <span className="truncate block" title={report.routeName}>
                          {report.routeName || "—"}
                        </span>
                      </td>

                      {/* Coverage % */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(Number(rawCoverage), 100)}%`,
                                background: Number(rawCoverage) >= 90 ? "#16a34a" : Number(rawCoverage) >= 70 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-gray-900 font-bold text-xs">{coveragePct}%</span>
                        </div>
                      </td>

                      {/* Distance */}
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-700 whitespace-nowrap">
                        <span className="text-gray-900 font-semibold">{actualDist}</span>
                        <span className="text-gray-400 text-[11px] block">Plan: {plannedDist}</span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-700 whitespace-nowrap">
                        <span className="text-indigo-600 font-semibold">{actualDur}</span>
                        <span className="text-gray-400 text-[11px] block">Plan: {plannedDur}</span>
                      </td>

                      {/* Points */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{coveredPts} / {totalPts}</span>
                        {devPts > 0 && <span className="text-amber-600 font-medium block text-[11px]">({devPts} deviated)</span>}
                      </td>

                      {/* Deviation Distance */}
                      <td className="py-3.5 px-4 text-xs font-medium whitespace-nowrap">
                        {devDist === 0 ? (
                          <span className="text-emerald-600 font-semibold">0 m ✓</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">{devDist.toFixed(1)} m</span>
                        )}
                      </td>

                      {/* Completed At */}
                      <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(report.completedAt || report.createdAt || report.startedAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Details Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-400">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Journey Report Detail Modal ────────────────────────────────────── */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={(e) => e.target === e.currentTarget && setSelectedReport(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Journey Report Details
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedReport.routeName || "Route Report"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-semibold">Coverage Percentage</p>
                  <p className="text-xl font-bold text-indigo-900 mt-0.5">
                    {(selectedReport.coveragePercentage ?? selectedReport.coveragePercent ?? 0).toFixed(2)}%
                  </p>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold">Route Matched</p>
                  <p className="text-xl font-bold text-emerald-900 mt-0.5">
                    {selectedReport.isRouteMatched ? "Yes ✓" : "No ✕"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Report ID:</span>
                  <span className="font-mono text-gray-800">{selectedReport.reportId || selectedReport._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Channel Partner ID:</span>
                  <span className="font-mono text-gray-800">{selectedReport.channelPartnerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Actual Distance:</span>
                  <span className="font-semibold text-gray-900">{formatDistance(selectedReport.actualDistance)} (Planned: {formatDistance(selectedReport.plannedDistance)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Actual Duration:</span>
                  <span className="font-semibold text-gray-900">{selectedReport.actualDuration} mins (Planned: {selectedReport.plannedDuration} mins)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Tracking Points:</span>
                  <span className="font-semibold text-gray-900">{selectedReport.coveredPoints} covered / {selectedReport.totalTrackingPoints} total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Deviation Distance:</span>
                  <span className="font-semibold text-amber-600">{selectedReport.totalDeviationDistance} m ({selectedReport.deviatedPoints} dev pts)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Started At:</span>
                  <span className="text-gray-800">{formatDate(selectedReport.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Completed At:</span>
                  <span className="text-gray-800">{formatDate(selectedReport.completedAt)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}