// ============================================================
// DistrictsHierarchyMonitor - SuperAdmin "Districts Hierarchy" tab
// ------------------------------------------------------------
// One card / row per district with:
//   - how many talukas and wards it has
//   - how many members live in it
//   - seats (district head / taluka heads / ward chairmen) filled vs total
//   - who holds a role in the district (Roles & Access modal)
// Grid and Table views, search, head filter and pagination.
//
// Data: GET /district/hierarchy-overview (super_admin only) for the
// hierarchy numbers; member counts come from the parent (it already holds
// the platform user list).
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Grid,
  InboxIcon,
  List,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import api from "../../service/api.js";

const GRID_PAGE_SIZES = [6, 9, 12, 24];
const TABLE_PAGE_SIZES = [10, 25, 50, 100];

const ROLE_LABELS = {
  district_head: "District Head",
  taluka_head: "Taluka Head",
  ward_chairman: "Ward Chairman",
};

const roleLabel = (holder) => {
  if (ROLE_LABELS[holder.assignmentType]) return ROLE_LABELS[holder.assignmentType];
  const raw = holder.role || holder.assignmentType || "Role";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ROLE_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "district_head", label: "District Head" },
  { id: "taluka_head", label: "Taluka Heads" },
  { id: "ward_chairman", label: "Ward Chairmen" },
  { id: "OTHER", label: "Other Roles" },
];

const roleBadgeClass = (type) =>
  type === "district_head"
    ? "bg-purple-50 text-purple-700 border-purple-200"
    : type === "taluka_head"
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : type === "ward_chairman"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-gray-100 text-gray-600 border-gray-200";

const seatText = (seat) => (seat ? `${seat.filled}/${seat.total}` : "0/0");

// ── Pagination bar ───────────────────────────────────────────
function PaginationBar({ page, totalPages, totalItems, pageSize, onPage, noun }) {
  if (totalItems === 0) return null;

  let pages;
  if (totalPages <= 7) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (page <= 4) {
    pages = [1, 2, 3, 4, 5, "...", totalPages];
  } else if (page >= totalPages - 3) {
    pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  } else {
    pages = [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <span className="text-gray-500">
        Showing <span className="font-semibold text-gray-800">{from}</span> to{" "}
        <span className="font-semibold text-gray-800">{to}</span> of{" "}
        <span className="font-semibold text-gray-800">{totalItems.toLocaleString()}</span> {noun}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
        >
          <ChevronLeft size={13} />
          <span>Prev</span>
        </button>

        {pages.map((pg, idx) => (
          <button
            key={idx}
            onClick={() => typeof pg === "number" && onPage(pg)}
            disabled={typeof pg !== "number"}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
              pg === page
                ? "bg-purple-600 text-white shadow-sm"
                : pg === "..."
                ? "bg-transparent text-gray-400 cursor-default"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {pg}
          </button>
        ))}

        <button
          onClick={() => onPage(Math.min(page + 1, totalPages))}
          disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 flex items-center gap-1 transition-all"
        >
          <span>Next</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Roles & Access modal ─────────────────────────────────────
function RolesAccessModal({ row, onClose }) {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [talukaFilter, setTalukaFilter] = useState("ALL"); // ALL | <talukaId> | NONE (district level)
  const [query, setQuery] = useState("");

  const holders = useMemo(() => row.overview?.roleHolders || [], [row.overview]);
  const talukas = useMemo(() => row.overview?.talukas || [], [row.overview]);

  // Holders per taluka (for chip counts) + district-level holders without a taluka
  const holderCountByTaluka = useMemo(() => {
    const map = new Map();
    let none = 0;
    holders.forEach((h) => {
      const id = h.taluka?.talukaId;
      if (id === undefined || id === null) none += 1;
      else map.set(String(id), (map.get(String(id)) || 0) + 1);
    });
    return { map, none };
  }, [holders]);

  const selectedTaluka = useMemo(
    () => talukas.find((t) => String(t.talukaId) === talukaFilter) || null,
    [talukas, talukaFilter]
  );

  // Seat summary for the selected taluka
  const talukaSummary = useMemo(() => {
    if (!selectedTaluka) return null;
    const inTaluka = holders.filter((h) => String(h.taluka?.talukaId) === talukaFilter);
    const head = inTaluka.find((h) => h.assignmentType === "taluka_head");
    const chairmanWards = new Set(
      inTaluka
        .filter((h) => h.assignmentType === "ward_chairman")
        .map((h) => h.ward?.wardId ?? h.userId)
    );
    return {
      headName: head?.name || null,
      chairmen: chairmanWards.size,
      totalWards: selectedTaluka.wardCount,
    };
  }, [holders, selectedTaluka, talukaFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return holders.filter((h) => {
      const known = ROLE_LABELS[h.assignmentType] ? h.assignmentType : "OTHER";
      if (roleFilter !== "ALL" && known !== roleFilter) return false;
      if (talukaFilter === "NONE") {
        if (h.taluka?.talukaId !== undefined && h.taluka?.talukaId !== null) return false;
      } else if (talukaFilter !== "ALL" && String(h.taluka?.talukaId) !== talukaFilter) {
        return false;
      }
      if (!q) return true;
      return [h.name, h.mobileNumber, h.email, h.taluka?.talukaName, h.ward?.wardName, h.positionName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [holders, roleFilter, talukaFilter, query]);

  const seats = row.overview?.seats;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <ShieldCheck size={17} className="text-purple-600" />
              Roles &amp; Access - {row.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {row.overview?.roleHolderCount ?? 0} people hold a role in this district
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Seats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {[
              { label: "Talukas", value: row.overview?.talukaCount ?? 0 },
              { label: "Wards", value: row.overview?.wardCount ?? 0 },
              { label: "Taluka Heads", value: seatText(seats?.talukaHead), hint: "filled / total" },
              { label: "Ward Chairmen", value: seatText(seats?.wardChairman), hint: "filled / total" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                <p className="text-gray-400">{s.label}</p>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
                {s.hint && <p className="text-[10px] text-gray-400">{s.hint}</p>}
              </div>
            ))}
          </div>

          {/* Talukas */}
          {talukas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Talukas ({talukas.length}){" "}
                <span className="normal-case font-normal text-gray-400">- click a taluka to filter</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTalukaFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                    talukaFilter === "ALL"
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-slate-50 border-slate-100 text-gray-700 hover:border-purple-300"
                  }`}
                >
                  All talukas
                </button>
                {talukas.map((t) => {
                  const active = talukaFilter === String(t.talukaId);
                  return (
                    <button
                      type="button"
                      key={t.talukaId}
                      onClick={() => setTalukaFilter(active ? "ALL" : String(t.talukaId))}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                        active
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-slate-50 border-slate-100 text-gray-700 hover:border-purple-300"
                      }`}
                    >
                      {t.talukaName}{" "}
                      <span className={active ? "text-purple-100" : "text-gray-400"}>
                        · {t.wardCount} wards · {holderCountByTaluka.map.get(String(t.talukaId)) || 0} holders
                      </span>
                    </button>
                  );
                })}
                {holderCountByTaluka.none > 0 && (
                  <button
                    type="button"
                    onClick={() => setTalukaFilter(talukaFilter === "NONE" ? "ALL" : "NONE")}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                      talukaFilter === "NONE"
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-slate-50 border-slate-100 text-gray-700 hover:border-purple-300"
                    }`}
                  >
                    District level{" "}
                    <span className={talukaFilter === "NONE" ? "text-purple-100" : "text-gray-400"}>
                      · {holderCountByTaluka.none} holders
                    </span>
                  </button>
                )}
              </div>
              {talukaSummary && (
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 text-purple-900">
                  <span className="font-semibold">{selectedTaluka.talukaName}</span>
                  <span>
                    Taluka Head:{" "}
                    <b>{talukaSummary.headName || "Vacant"}</b>
                  </span>
                  <span>
                    Ward Chairmen:{" "}
                    <b>
                      {talukaSummary.chairmen}/{talukaSummary.totalWards}
                    </b>{" "}
                    filled
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Role holders */}
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role holders ({filtered.length})
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
                  {ROLE_FILTERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoleFilter(r.id)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        roleFilter === r.id ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {talukas.length > 0 && (
                  <select
                    value={talukaFilter}
                    onChange={(e) => setTalukaFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                    aria-label="Filter by taluka"
                  >
                    <option value="ALL">All talukas</option>
                    {talukas.map((t) => (
                      <option key={t.talukaId} value={String(t.talukaId)}>
                        {t.talukaName}
                      </option>
                    ))}
                    {holderCountByTaluka.none > 0 && <option value="NONE">District level</option>}
                  </select>
                )}
                <div className="relative w-full md:w-52">
                  <input
                    type="text"
                    placeholder="Search name, mobile, ward..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <InboxIcon size={28} />
                <p className="text-xs mt-2">No role holders match.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="p-3">Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Taluka</th>
                      <th className="p-3">Ward</th>
                      <th className="p-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((h, i) => (
                      <tr key={`${h.userId}-${h.assignmentType}-${h.ward?.wardId || h.taluka?.talukaId || i}`}>
                        <td className="p-3 font-semibold text-gray-800">{h.name || "—"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeClass(
                              h.assignmentType
                            )}`}
                          >
                            {roleLabel(h)}
                          </span>
                          {h.positionName && h.positionName !== roleLabel(h) && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{h.positionName}</p>
                          )}
                        </td>
                        <td className="p-3 text-gray-600">{h.taluka?.talukaName || "—"}</td>
                        <td className="p-3 text-gray-600">{h.ward?.wardName || "—"}</td>
                        <td className="p-3 text-gray-600">
                          <p>{h.mobileNumber || "—"}</p>
                          {h.email && <p className="text-[10px] text-gray-400">{h.email}</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function DistrictsHierarchyMonitor({
  districts,
  districtHeads,
  memberCountByDistrict,
  onViewMembers,
}) {
  const [overview, setOverview] = useState({ data: null, loading: true, error: null });
  const [query, setQuery] = useState("");
  const [headFilter, setHeadFilter] = useState("ALL"); // ALL | ACTIVE | VACANT
  const [viewMode, setViewMode] = useState("grid"); // grid | table
  const [pageSize, setPageSize] = useState(9);
  const [page, setPage] = useState(1);
  const [rolesRow, setRolesRow] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/district/hierarchy-overview");
      setOverview({ data: res.data, loading: false, error: null });
    } catch (err) {
      setOverview((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || "Could not load district hierarchy details.",
      }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setOverview((prev) => ({ ...prev, loading: true, error: null }));
    load();
  };

  // Merge: master district list (name/state) + hierarchy overview + members
  const rows = useMemo(() => {
    const overviewByName = new Map();
    (overview.data?.data || []).forEach((d) => {
      overviewByName.set(String(d.districtName).trim().toLowerCase(), d);
    });

    return (districts || []).map((d) => {
      const key = d.name.trim().toLowerCase();
      const ov = overviewByName.get(key) || null;

      const headFromOverview = ov?.roleHolders?.find((h) => h.assignmentType === "district_head");
      const headFromList = districtHeads.find(
        (dh) => (dh.district || dh.districtName)?.toLowerCase() === key
      );
      const head = headFromOverview
        ? {
            name: headFromOverview.name,
            contact: headFromOverview.mobileNumber || headFromOverview.email,
          }
        : headFromList
        ? { name: headFromList.name, contact: headFromList.mobile || headFromList.email }
        : null;

      return {
        key,
        name: d.name,
        state: d.state,
        overview: ov,
        head,
        members: memberCountByDistrict?.[key] || 0,
      };
    });
  }, [districts, districtHeads, overview.data, memberCountByDistrict]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q)) return false;
      if (headFilter === "ACTIVE" && !r.head) return false;
      if (headFilter === "VACANT" && r.head) return false;
      return true;
    });
  }, [rows, query, headFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  const switchView = (mode) => {
    setViewMode(mode);
    setPageSize(mode === "grid" ? 9 : 10);
    setPage(1);
  };

  const totals = overview.data?.totals;
  const overviewReady = !overview.loading && !overview.error;
  const num = (v) => (overview.loading ? "…" : overviewReady ? (v ?? 0).toLocaleString() : "—");

  const HeadBadge = ({ head }) =>
    head ? (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Active Head
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Vacant Head
      </span>
    );

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Districts Hierarchy Monitor</h2>
            <p className="text-xs text-gray-400">
              {rows.length} districts
              {totals ? ` · ${totals.talukas.toLocaleString()} talukas · ${totals.wards.toLocaleString()} wards` : ""}
              {" "}— members, talukas, wards and role access per district
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search district name..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              {[
                { id: "ALL", label: "All" },
                { id: "ACTIVE", label: "Active Head" },
                { id: "VACANT", label: "Vacant Head" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setHeadFilter(f.id);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    headFilter === f.id ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-600 font-medium">
              <span className="text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent font-semibold text-gray-800 focus:outline-none cursor-pointer"
              >
                {(viewMode === "grid" ? GRID_PAGE_SIZES : TABLE_PAGE_SIZES).map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              <button
                onClick={() => switchView("grid")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === "grid" ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <Grid size={15} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => switchView("table")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === "table" ? "bg-white text-purple-600 shadow-sm" : "hover:text-gray-900"
                }`}
                title="Table View"
              >
                <List size={15} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {overview.error && (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-3 py-2 text-xs">
            <span className="flex items-center gap-2">
              <AlertCircle size={14} />
              {overview.error}
            </span>
            <button
              onClick={retry}
              className="flex items-center gap-1 font-semibold hover:underline"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <InboxIcon size={32} />
          <p className="text-sm mt-2">No districts found.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <InboxIcon size={32} />
          <p className="text-sm mt-2">No districts match your search / filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageRows.map((r) => {
            const seats = r.overview?.seats;
            return (
              <div
                key={r.key}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                        <Globe size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-800 truncate">{r.name}</h3>
                        <p className="text-xs text-gray-400">{r.state}</p>
                      </div>
                    </div>
                    <HeadBadge head={r.head} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Assigned District Head
                    </p>
                    {r.head ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                          {r.head.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-xs overflow-hidden">
                          <p className="font-semibold text-gray-800 truncate">{r.head.name}</p>
                          <p className="text-gray-400 truncate">{r.head.contact}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 italic">No District Head assigned yet.</p>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-gray-400">Talukas</span>
                      <p className="font-bold text-gray-800">{num(r.overview?.talukaCount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Wards</span>
                      <p className="font-bold text-gray-800">{num(r.overview?.wardCount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Members</span>
                      <p className="font-bold text-gray-800">{r.members.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Roles</span>
                      <p className="font-bold text-gray-800">{num(r.overview?.roleHolderCount)}</p>
                    </div>
                  </div>

                  {overviewReady && seats && (
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        Taluka Heads {seatText(seats.talukaHead)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Ward Chairmen {seatText(seats.wardChairman)}
                      </span>
                      {seats.other.total > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                          Other Roles {seatText(seats.other)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewMembers(r.name)}
                    className="py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Users size={13} />
                    <span>View Members</span>
                  </button>
                  <button
                    onClick={() => setRolesRow(r)}
                    disabled={!overviewReady || !r.overview}
                    className="py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck size={13} />
                    <span>Roles &amp; Access</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">District</th>
                  <th className="p-3.5 text-right">Talukas</th>
                  <th className="p-3.5 text-right">Wards</th>
                  <th className="p-3.5 text-right">Members</th>
                  <th className="p-3.5">District Head</th>
                  <th className="p-3.5 text-right">Taluka Heads</th>
                  <th className="p-3.5 text-right">Ward Chairmen</th>
                  <th className="p-3.5 text-right">Role Holders</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageRows.map((r) => {
                  const seats = r.overview?.seats;
                  return (
                    <tr key={r.key} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        <p className="text-[11px] text-gray-400">{r.state}</p>
                      </td>
                      <td className="p-3.5 text-right font-medium text-gray-700">{num(r.overview?.talukaCount)}</td>
                      <td className="p-3.5 text-right font-medium text-gray-700">{num(r.overview?.wardCount)}</td>
                      <td className="p-3.5 text-right font-semibold text-gray-800">{r.members.toLocaleString()}</td>
                      <td className="p-3.5">
                        {r.head ? (
                          <div>
                            <p className="font-semibold text-gray-800">{r.head.name}</p>
                            <p className="text-[11px] text-gray-400">{r.head.contact}</p>
                          </div>
                        ) : (
                          <HeadBadge head={null} />
                        )}
                      </td>
                      <td className="p-3.5 text-right text-gray-700">
                        {overviewReady ? seatText(seats?.talukaHead) : "—"}
                      </td>
                      <td className="p-3.5 text-right text-gray-700">
                        {overviewReady ? seatText(seats?.wardChairman) : "—"}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-gray-800">
                        {num(r.overview?.roleHolderCount)}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => onViewMembers(r.name)}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg flex items-center gap-1"
                          >
                            <Users size={12} /> Members
                          </button>
                          <button
                            onClick={() => setRolesRow(r)}
                            disabled={!overviewReady || !r.overview}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck size={12} /> Roles
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PaginationBar
        page={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
        noun="Districts"
      />

      {rolesRow && <RolesAccessModal row={rolesRow} onClose={() => setRolesRow(null)} />}
    </div>
  );
}
