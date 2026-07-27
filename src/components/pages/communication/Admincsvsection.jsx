import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock, Activity, CheckCircle,
  RefreshCw, ChevronLeft, ChevronRight,
  Check, X, ChevronDown, ChevronUp, Users,
} from "lucide-react";

import {
  fetchUserCsvTable,
  fetchCampaignCounts,
  reviewCsvUploads,
  selectUserCsvStats,
  selectUserCsvStatsStatus,
  selectUserCsvRows,
  selectUserCsvTotal,
  selectUserCsvTotalPages,
  selectIsUserCsvTableLoading,
  selectUserCsvTableError,
} from "../../redux/slices/sendMessageSlice";
import { selectUser } from "../../redux/slices/authSlice";

const LIMIT = 10;
const ADMIN_STATUS_TABS = ["PENDING", "IN_PROGRESS", "COMPLETED"];

const STATUS_BADGE = {
  PENDING: "bg-amber-50  text-amber-700  border-amber-200",
  IN_PROGRESS: "bg-blue-50   text-blue-700   border-blue-200",
  APPROVED: "bg-green-50  text-green-700  border-green-200",
  COMPLETED: "bg-green-50  text-green-700  border-green-200",
  REJECTED: "bg-red-50    text-red-600    border-red-200",
  DRAFT: "bg-slate-100 text-slate-500  border-slate-200",
};

function Badge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, borderColor, loading }) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm p-4 flex items-center gap-3.5`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        {loading
          ? <div className="mt-1 h-6 w-10 rounded bg-gray-100 animate-pulse" />
          : <p className="text-[22px] font-bold text-gray-800 leading-tight">{value ?? 0}</p>
        }
      </div>
    </div>
  );
}

function RecipientsTable({ recipients }) {
  if (!recipients?.length) {
    return <p className="text-[12px] text-gray-400 px-4 py-3">No recipients found.</p>;
  }
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="bg-slate-100">
          {["Name", "Email", "Mobile", "WhatsApp", "Subject", "Message", "Status"].map((h) => (
            <th key={h} className="px-3 py-2 text-left text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {recipients.map((r) => {
          const u = r.upload || {};
          return (
            <tr key={r.campaignRecipientId} className="bg-slate-50/60">
              <td className="px-3 py-2 font-medium text-gray-700">{u.name || "—"}</td>
              <td className="px-3 py-2 text-gray-500">{u.email || "—"}</td>
              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{u.mobileNumber || "—"}</td>
              <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{u.whatsappNumber || "—"}</td>
              <td className="px-3 py-2 text-gray-700 truncate max-w-[120px]">{u.subject || "—"}</td>
              <td className="px-3 py-2 text-gray-500 truncate max-w-[150px]">{u.message || "—"}</td>
              <td className="px-3 py-2"><Badge status={u.status} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CampaignRow({ campaign, activeTab, onReview, reviewingId }) {
  const [open, setOpen] = useState(false);
  const isRev = reviewingId === campaign.campaignId;
  const colSpanCount = activeTab === "PENDING" ? 8 : 7;
  

  return (
    <>
      <tr
        className="hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-4 py-3">
          <p className="font-semibold text-gray-800">{campaign.user?.name || "—"}</p>
          <p className="text-[11px] text-gray-400">{campaign.user?.email || "—"}</p>
        </td>

        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
          {campaign.user?.mobileNumber || "—"}
        </td>

        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
            <Users size={10} /> {campaign.totalRecipients ?? 0}
          </span>
        </td>

        <td className="px-4 py-3">
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {campaign.channel || "—"}
          </span>
        </td>

        <td className="px-4 py-3">
          <Badge status={campaign.status} />
        </td>

        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
          {campaign.createdAt
            ? new Date(campaign.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })
            : "—"}
        </td>

        {activeTab === "PENDING" && (
          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onReview(campaign.campaignId, "APPROVED")}
                disabled={isRev}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {isRev ? <RefreshCw size={10} className="animate-spin" /> : <Check size={10} />}
                Approve
              </button>
              <button
                onClick={() => onReview(campaign.campaignId, "REJECTED")}
                disabled={isRev}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X size={10} /> Reject
              </button>
            </div>
          </td>
        )}

        <td className="px-4 py-3 text-gray-400">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={colSpanCount} className="px-4 pb-3 pt-0 bg-white border-b border-gray-100">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <RecipientsTable recipients={campaign.recipients} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminCsvSection() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userId = user?.userId;

  const stats = useSelector(selectUserCsvStats);
  const statsStatus = useSelector(selectUserCsvStatsStatus);
  const statsLoading = statsStatus === "loading";

  const rows = useSelector(selectUserCsvRows);
  const total = useSelector(selectUserCsvTotal);
  const totalPages = useSelector(selectUserCsvTotalPages);
  const tableLoading = useSelector(selectIsUserCsvTableLoading);
  const tableError = useSelector(selectUserCsvTableError);

  const [activeTab, setActiveTab] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [reviewingId, setReviewingId] = useState(null);

  // Fetch stat counts on mount
  useEffect(() => {
    if (userId) dispatch(fetchCampaignCounts());
  }, [dispatch, userId]);

  const loadTable = useCallback(() => {
    if (userId) {
      dispatch(fetchUserCsvTable({ userId, adminStatus: activeTab, page, limit: LIMIT }));
    }
  }, [dispatch, userId, activeTab, page]);

  useEffect(() => { loadTable(); }, [loadTable]);

  function handleTab(tab) { setActiveTab(tab); setPage(1); }

  async function handleReview(campaignId, status) {
    setReviewingId(campaignId);
    try {
      await dispatch(reviewCsvUploads({ campaignId, status })).unwrap();
      loadTable();
      dispatch(fetchCampaignCounts());
    } finally {
      setReviewingId(null);
    }
  }

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  const colCount = activeTab === "PENDING" ? 8 : 7;

  const TAB_BADGE = {
    PENDING: { count: stats.pendingCount, color: "bg-amber-500" },
    IN_PROGRESS: { count: stats.inProgressCount, color: "bg-blue-500" },
    COMPLETED: { count: stats.completedCount, color: "bg-green-500" },
  };

  return (
    <div className="space-y-4 pb-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-gray-800">Campaign Requests</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Click a row to view recipients. Review and approve campaigns.
          </p>
        </div>
        <button
          onClick={() => { loadTable(); dispatch(fetchCampaignCounts()); }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} className={(tableLoading || statsLoading) ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Pending"
          value={stats.pendingCount}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          borderColor="border-amber-100"
          loading={statsLoading}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressCount}
          icon={Activity}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          borderColor="border-blue-100"
          loading={statsLoading}
        />
        <StatCard
          label="Completed"
          value={stats.completedCount}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          borderColor="border-green-100"
          loading={statsLoading}
        />
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-1 bg-slate-50/60">
          {ADMIN_STATUS_TABS.map((tab) => {
            const badge = TAB_BADGE[tab];
            return (
              <button
                key={tab}
                onClick={() => handleTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white"
                  }`}
              >
                {tab.replace("_", " ")}
                {badge?.count > 0 && (
                  <span className={`ml-1.5 ${badge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                    {badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tableError && (
          <div className="px-4 py-2.5 bg-red-50 border-b border-red-100 text-red-600 text-[12px]">
            {tableError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                {[
                  "User / Email", "Mobile", "Recipients",
                  "Channel", "Status", "Date",
                  ...(activeTab === "PENDING" ? ["Action"] : []),
                  "",
                ].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: colCount }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3.5 rounded bg-gray-100 animate-pulse" style={{ width: `${55 + j * 5}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-10 text-center text-gray-400 text-[12.5px]">
                    No {activeTab.replace("_", " ").toLowerCase()} campaigns found.
                  </td>
                </tr>
              ) : (
                rows.map((campaign) => (
                  <CampaignRow
                    key={campaign.campaignId}
                    campaign={campaign}
                    activeTab={activeTab}
                    onReview={handleReview}
                    reviewingId={reviewingId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-[11.5px] text-gray-500">
            <p>
              {total === 0 ? "0" : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)}`}
              {" "}of <span className="font-semibold text-gray-700">{total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={13} />
              </button>
              {pageNums.map((p, idx) =>
                p === "…" ? (
                  <span key={`d${idx}`} className="px-1 text-gray-400">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-6 h-6 rounded-lg text-[11px] font-semibold transition-colors ${page === p ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}