import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCPJourneyReports,
  selectJourneyReports,
  selectJourneyReportsStatus,
  selectAllRoutes,
} from "../../redux/slices/Routetrackingslice.js";
import { selectToken } from "../../redux/slices/authSlice";

const STATUS_CONFIG = {
  MATCHED:   { label: "Matched",   cls: "bg-green-50 text-green-700" },
  PARTIAL:   { label: "Partial",   cls: "bg-yellow-50 text-yellow-700" },
  COMPLETED: { label: "Completed", cls: "bg-green-50 text-green-700" },
  UNMATCHED: { label: "Unmatched", cls: "bg-red-50 text-red-700" },
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(start, end) {
  if (!start || !end) return "—";
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
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
  const PAGE_SIZE = 8;

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
  const filtered = reports.filter((r) => {
    const statusKey = (r.status || "COMPLETED").toUpperCase();
    const matchesFilter = filter === "ALL" || statusKey === filter;
    const matchesSearch =
      !search ||
      r.routeName?.toLowerCase().includes(search.toLowerCase()) ||
      r.channelPartnerName?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats
  const avgCoverage =
    reports.length > 0
      ? Math.round(
          reports.reduce((acc, r) => acc + (r.coveragePercent ?? r.coverage ?? 0), 0) /
            reports.length
        )
      : 0;
  const matched = reports.filter(
    (r) => r.isRouteMatched || (r.status || "").toUpperCase() === "MATCHED"
  ).length;

  const isLoading = reportsStatus === "loading";

  return (
    <div>
      {/* Summary bar */}
      <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
        <div>
          <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Total Journeys</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{avgCoverage}%</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Avg. Coverage</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{matched}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-1">Fully Matched</p>
        </div>
      </div>

      {/* Filter bar */}
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
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 w-56 bg-white"
            placeholder="Search route or partner…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Loading */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Channel Partner", "Route", "Coverage", "Deviation", "Points", "Duration", "Completed", "Status"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 px-3 first:pl-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((report, i) => {
                  const rid = report._id || report.id || report.reportId || i;
                  const statusKey = report.isRouteMatched
                    ? "MATCHED"
                    : (report.status || "COMPLETED").toUpperCase();
                  const badge = STATUS_CONFIG[statusKey] || STATUS_CONFIG.COMPLETED;
                  const coverage = report.coveragePercent ?? report.coverage ?? 0;
                  const deviation = report.totalDeviationDistance ?? report.deviation ?? 0;
                  const cpName = report.channelPartnerName || "—";
                  const initials = cpName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const points = report.rewardPoints ?? report.points ?? "—";

                  return (
                    <tr key={rid} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* CP */}
                      <td className="py-3 px-3 pl-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{cpName}</span>
                        </div>
                      </td>
                      {/* Route */}
                      <td className="py-3 px-3 text-gray-600 max-w-[160px]">
                        <span className="truncate block">{report.routeName || "—"}</span>
                      </td>
                      {/* Coverage */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(coverage, 100)}%`,
                                background: coverage >= 90 ? "#16a34a" : coverage >= 70 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-gray-700 font-medium whitespace-nowrap">{coverage}%</span>
                        </div>
                      </td>
                      {/* Deviation */}
                      <td className="py-3 px-3">
                        <span className={deviation === 0 ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
                          {deviation === 0 ? "0 m ✓" : `${deviation} m`}
                        </span>
                      </td>
                      {/* Points */}
                      <td className="py-3 px-3">
                        {points !== "—" ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                            ⭐ {points}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      {/* Duration */}
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {formatDuration(report.startTime || report.createdAt, report.endTime || report.completedAt)}
                      </td>
                      {/* Date */}
                      <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(report.endTime || report.completedAt)}
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
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
    </div>
  );
}