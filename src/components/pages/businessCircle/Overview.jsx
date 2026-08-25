import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Circle,
  Users,
  TrendingUp,
  Heart,
  Loader2,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import StatCard from "../businessCircle/StatCard.jsx";
import { selectUser } from "../../redux/slices/authSlice.js";
import {
  getLocationByWardHeadId,
  selectWards,
} from "../../redux/slices/areaChartSlice.js";
import {
  fetchBusinessCircleDashboard,
  selectBusinessCircleData,
  selectBusinessCircleLoading,
  selectBusinessCircleError,
} from "../../redux/slices/businessCircleSlice.js";

// Fallback data from response.js in case API is loading/error
const MOCK_FALLBACK_DATA = {
  summary: {
    totalWards: 10,
    totalMembers: 21,
    basicMembers: 2,
    primeMembers: 19,
    totalLeads: 27,
    totalGratitudeSlips: 15,
    totalGratitudeValue: 10998000,
    totalAttendance: 10,
    uniquePresentMembers: 7,
    attendancePercentage: 33,
  },
  wards: [
    {
      wardId: "fb565c5c-fa8b-4b8c-9607-d4fd1a212bd1",
      wardName: "Aramane Nagara",
      wardNumber: "G5.49",
      members: 6,
      uniquePresentMembers: 3,
      attendancePercentage: 50,
      status: "Live",
    },
    {
      wardId: "825a3f8c-f9fa-40d6-a291-61401fe8a7a2",
      wardName: "Mathikere",
      wardNumber: "G5.48",
      members: 13,
      uniquePresentMembers: 4,
      attendancePercentage: 31,
      status: "Live",
    },
    {
      wardId: "07f8a913-791d-44aa-bddc-3bf9df57aec7",
      wardName: "Rajamahal",
      wardNumber: "G5.51",
      members: 1,
      uniquePresentMembers: 0,
      attendancePercentage: 0,
      status: "Live",
    },
    {
      wardId: "019f746f-eeff-4c23-9632-b04af38f6070",
      wardName: "Sadashiva Nagara",
      wardNumber: "G5.50",
      members: 1,
      uniquePresentMembers: 0,
      attendancePercentage: 0,
      status: "Live",
    },
    {
      wardId: "5d178780-fff2-4b7d-9fd8-7b4897d83020",
      wardName: "Gayathri Nagara",
      wardNumber: "G5.56",
      members: 0,
      uniquePresentMembers: 0,
      attendancePercentage: 0,
      status: "Planned",
    },
    {
      wardId: "eda1b264-0525-4cf1-857b-59a64cb7f816",
      wardName: "Kodandarampura",
      wardNumber: "G5.52",
      members: 0,
      uniquePresentMembers: 0,
      attendancePercentage: 0,
      status: "Planned",
    },
  ],
};

const STATUS_CONFIG = {
  live:     { dot: "bg-green-500",  label: "Live",     text: "text-green-700"  },
  eligible: { dot: "bg-amber-400",  label: "Eligible", text: "text-amber-700"  },
  planned:  { dot: "bg-gray-400",   label: "Planned",  text: "text-gray-500"   },
};

const formatCurrency = (val) => {
  if (!val || isNaN(val)) return "₹0";
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function Overview() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const areaChartWards = useSelector(selectWards);
  const dashboardRes = useSelector(selectBusinessCircleData);
  const loading = useSelector(selectBusinessCircleLoading);
  const error = useSelector(selectBusinessCircleError);

  // Table interactive state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const userId = user?.userId || user?.id;

  // Dispatch location lookup if locationData is missing
  useEffect(() => {
    const locData = localStorage.getItem("locationData");
    if (!locData && userId) {
      dispatch(getLocationByWardHeadId(userId));
    }
  }, [dispatch, userId]);

  // Determine user location ID and role type (district vs taluka)
  const { entityId, entityType } = useMemo(() => {
    let locData = null;
    try {
      locData = JSON.parse(localStorage.getItem("locationData"));
    } catch (e) {
      locData = null;
    }

    const role = user?.role || user?.roles?.[0] || "";
    const isDistrictHead =
      role === "DistrictHead" || role === "district_head";
    const isTalukHead =
      role === "TalukHead" || role === "TalukaHead" || role === "taluka_head";

    let id = null;
    let type = "taluka";

    if (isDistrictHead) {
      type = "district";
      id = locData?.districtId || user?.districtId || user?.district_id || "3a4b9264-bc85-4d60-b74a-32ea61304150";
    } else if (isTalukHead) {
      type = "taluka";
      id = locData?.talukaId || user?.talukaId || user?.taluka_id || "f9a6257c-7cbe-4c1c-a25a-8403ee801110";
    } else {
      if (locData?.districtId) {
        type = "district";
        id = locData.districtId;
      } else if (locData?.talukaId) {
        type = "taluka";
        id = locData.talukaId;
      }
    }

    if (!id) {
      id = user?.districtId || user?.talukaId || "3a4b9264-bc85-4d60-b74a-32ea61304150";
      type = "district";
    }

    return { entityId: id, entityType: type };
  }, [user, areaChartWards]);

  // Fetch dashboard data
  useEffect(() => {
    if (entityId && entityType) {
      dispatch(fetchBusinessCircleDashboard({ id: entityId, type: entityType }));
    }
  }, [dispatch, entityId, entityType]);

  // Extract nested data safely
  const dataObj = dashboardRes?.data || dashboardRes || {};
  const rawSummary = dataObj.summary || dashboardRes?.summary;

  const summary = rawSummary || (error ? MOCK_FALLBACK_DATA.summary : {});

  // Support both assemblies (District Head - 28 assemblies) and wards (Taluka Head)
  const rawCirclesList = useMemo(() => {
    if (Array.isArray(dataObj.assemblies) && dataObj.assemblies.length > 0) {
      return dataObj.assemblies.map((a) => ({
        id: a.assemblyId || a.talukaId,
        name: a.assemblyName || a.talukaName,
        level: "Constituency",
        members: a.totalMembers ?? a.members ?? 0,
        attendancePercentage: a.attendancePercentage ?? 0,
        uniquePresentMembers: a.uniquePresentMembers ?? 0,
        status: a.status || "Planned",
      }));
    }

    if (Array.isArray(dataObj.wards) && dataObj.wards.length > 0) {
      return dataObj.wards.map((w) => ({
        id: w.wardId,
        name: `${w.wardNumber ? w.wardNumber + " " : ""}${w.wardName}`,
        level: "Ward",
        members: w.members ?? 0,
        attendancePercentage: w.attendancePercentage ?? 0,
        uniquePresentMembers: w.uniquePresentMembers ?? 0,
        status: w.status || "Planned",
      }));
    }

    if (error) {
      return MOCK_FALLBACK_DATA.wards.map((w) => ({
        id: w.wardId,
        name: `${w.wardNumber ? w.wardNumber + " " : ""}${w.wardName}`,
        level: "Ward",
        members: w.members ?? 0,
        attendancePercentage: w.attendancePercentage ?? 0,
        uniquePresentMembers: w.uniquePresentMembers ?? 0,
        status: w.status || "Planned",
      }));
    }

    return [];
  }, [dataObj, error]);

  // Filter & Sort circles
  const filteredAndSortedCircles = useMemo(() => {
    let result = [...rawCirclesList];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.level.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (c) => c.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "name" || sortBy === "status") {
        valA = (valA || "").toString().toLowerCase();
        valB = (valB || "").toString().toLowerCase();
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Numeric sort (members, attendancePercentage)
      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [rawCirclesList, searchTerm, statusFilter, sortBy, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Pagination calculation
  const totalItems = filteredAndSortedCircles.length;
  const isAllPages = pageSize === "all";
  const effectivePageSize = isAllPages ? totalItems || 1 : Number(pageSize);
  const totalPages = Math.ceil(totalItems / effectivePageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedCircles = useMemo(() => {
    if (isAllPages) return filteredAndSortedCircles;
    const startIndex = (validCurrentPage - 1) * effectivePageSize;
    return filteredAndSortedCircles.slice(startIndex, startIndex + effectivePageSize);
  }, [filteredAndSortedCircles, isAllPages, validCurrentPage, effectivePageSize]);

  // Live circles count from raw data
  const liveCirclesCount = useMemo(() => {
    if (!rawCirclesList || !rawCirclesList.length) return 0;
    return rawCirclesList.filter((c) => c.status?.toLowerCase() === "live").length;
  }, [rawCirclesList]);

  // Eligible circle for spin-off banner
  const eligibleCircle = useMemo(() => {
    if (!rawCirclesList) return null;
    return rawCirclesList.find((c) => c.status?.toLowerCase() === "eligible");
  }, [rawCirclesList]);

  // Header column click toggle sort
  const handleSortClick = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (!filteredAndSortedCircles.length) return;
    const headers = ["Circle Name", "Level", "Members", "Attendance (%)", "Coverage", "Status"];
    const rows = filteredAndSortedCircles.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.level}"`,
      c.members ?? 0,
      c.attendancePercentage != null ? `${c.attendancePercentage}%` : "—",
      c.members > 0 && c.uniquePresentMembers != null ? `${c.uniquePresentMembers}/${c.members}` : "—",
      `"${c.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `business_circle_health_${entityType}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Phase banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-[13px] text-gray-500">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-400"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Phase 1 — constituency circles form as membership grows (Spin-off tab).
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Live circles"
          value={liveCirclesCount}
          icon={Circle}
          tone="steel"
        />
        <StatCard
          label="Members"
          value={summary.totalMembers ?? 0}
          icon={Users}
          tone="steel"
        />
        <StatCard
          label="Leads · Q2"
          value={summary.totalLeads ?? 0}
          icon={TrendingUp}
          tone="steel"
        />
        <StatCard
          label="Gratitude · Q2"
          value={formatCurrency(summary.totalGratitudeValue)}
          icon={Heart}
          tone="steel"
        />
      </div>

      {/* Circle health table container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        {/* Header & Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <p className="text-[15px] font-semibold text-gray-800">Circle health</p>
            <span className="text-xs bg-blue-50 text-[#3B5BDB] px-2.5 py-0.5 rounded-full font-semibold">
              {rawCirclesList.length} {entityType === "district" ? "Assemblies" : "Wards"}
            </span>
            {loading && (
              <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
              </span>
            )}
          </div>

          {/* Search, Filters & Export Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search circles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-7 py-1.5 text-[12.5px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 w-44 sm:w-56"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px]">
              <Filter size={13} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-gray-700 font-medium text-[12px]"
              >
                <option value="all">All Statuses</option>
                <option value="live">Live</option>
                <option value="eligible">Eligible</option>
                <option value="planned">Planned</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[12px]">
              <ArrowUpDown size={13} className="text-gray-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split("-");
                  setSortBy(f);
                  setSortOrder(o);
                }}
                className="bg-transparent focus:outline-none cursor-pointer text-gray-700 font-medium text-[12px]"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="members-desc">Members (High-Low)</option>
                <option value="members-asc">Members (Low-High)</option>
                <option value="attendancePercentage-desc">Attendance (High-Low)</option>
                <option value="status-asc">Status</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={!filteredAndSortedCircles.length}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Export CSV"
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Table View */}
        {paginatedCircles.length === 0 ? (
          <div className="text-center py-10 text-[13px] text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "No circles match your filter criteria"
              : "No circles available"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    onClick={() => handleSortClick("name")}
                    className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-left cursor-pointer hover:text-gray-800 transition-colors"
                  >
                    Circle {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-right">
                    Level
                  </th>
                  <th
                    onClick={() => handleSortClick("members")}
                    className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-right cursor-pointer hover:text-gray-800 transition-colors"
                  >
                    Members {sortBy === "members" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSortClick("attendancePercentage")}
                    className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-right cursor-pointer hover:text-gray-800 transition-colors"
                  >
                    Attendance {sortBy === "attendancePercentage" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-right">
                    Coverage
                  </th>
                  <th
                    onClick={() => handleSortClick("status")}
                    className="pb-2.5 text-[11.5px] font-semibold text-gray-500 text-right cursor-pointer hover:text-gray-800 transition-colors"
                  >
                    Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCircles.map((circle, idx) => {
                  const statusKey = (circle.status || "planned").toLowerCase();
                  const s = STATUS_CONFIG[statusKey] || STATUS_CONFIG.planned;

                  return (
                    <tr
                      key={circle.id || idx}
                      className={idx < paginatedCircles.length - 1 ? "border-b border-gray-100 hover:bg-gray-50/50 transition-colors" : "hover:bg-gray-50/50 transition-colors"}
                    >
                      <td className="py-3 font-medium text-gray-800">{circle.name}</td>
                      <td className="py-3 text-right text-gray-500">{circle.level}</td>
                      <td className="py-3 text-right text-gray-800 font-semibold">{circle.members ?? 0}</td>
                      <td className="py-3 text-right text-gray-500">
                        {circle.attendancePercentage != null ? `${circle.attendancePercentage}%` : "—"}
                      </td>
                      <td className="py-3 text-right text-gray-500">
                        {circle.members > 0 && circle.uniquePresentMembers != null
                          ? `${circle.uniquePresentMembers}/${circle.members}`
                          : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center justify-end gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                          <span className={s.text}>{s.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer & Pagination Toolbar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100 text-[12.5px] text-gray-500">
            {/* Range info */}
            <div>
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {isAllPages ? 1 : (validCurrentPage - 1) * effectivePageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {isAllPages ? totalItems : Math.min(validCurrentPage * effectivePageSize, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-gray-700">{totalItems}</span> circles
            </div>

            {/* Pagination Controls & Page Size Selector */}
            <div className="flex items-center gap-3">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5">
                <span>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-[12px] font-medium text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value="all">All</option>
                </select>
              </div>

              {/* Prev / Page numbers / Next */}
              {!isAllPages && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={validCurrentPage === 1}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <span className="px-2 font-medium text-gray-700">
                    {validCurrentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={validCurrentPage === totalPages}
                    className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spin-off action banner */}
      {eligibleCircle && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-teal-700">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            {eligibleCircle.name} reached {eligibleCircle.members} members — eligible to spin off
          </div>
          <button className="shrink-0 rounded-lg bg-teal-700 px-4 py-2 text-[13px] font-semibold text-white hover:bg-teal-800 transition-colors">
            Start spin-off
          </button>
        </div>
      )}
    </div>
  );
}