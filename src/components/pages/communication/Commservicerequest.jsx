import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock, CheckCircle, CalendarClock, RefreshCw,
  ChevronLeft, ChevronRight, X, Search, Eye,
  CheckCheck, Calendar, AlertCircle,
} from "lucide-react";

import {
  fetchAllCsvUploads,
  reviewCsvUploads,
  clearReviewState,
  selectAdminRows,
  selectAdminTotal,
  selectAdminTotalPages,
  selectAdminCurrentPage,
  selectIsAdminLoading,
  selectAdminError,
  selectPendingCount,
  selectApprovedCount,
  selectReviewStatus,
  selectLastReviewedStatus,
  selectLastReviewedIds,
  selectIsReviewing,
  selectReviewError,
} from "../../../redux/slices/sendMessageSlice";

import { selectUser } from "../../../redux/slices/authSlice";

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, border }) {
  return (
    <div className={`bg-white rounded-2xl border ${border} shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon size={20} className={color} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight mt-0.5">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
}

// ─── SCHEDULE POPUP (shows after approve) ────────────────────────────────────
function SchedulePopup({ count, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarClock size={20} className="text-white" />
            <span className="text-white font-bold text-[15px]">Records Approved</span>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6 text-center">
          <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCheck size={28} className="text-green-600" />
          </div>
          <p className="text-gray-800 font-bold text-xl mb-1">
            {count} Record{count !== 1 ? "s" : ""} Approved!
          </p>
          <p className="text-gray-400 text-[13px] mb-6">
            These records are now queued and ready to be scheduled for bulk campaign.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-5">
            <p className="text-blue-700 text-[12px] font-semibold mb-1 flex items-center gap-1.5">
              <Calendar size={13} /> Schedule your campaign
            </p>
            <p className="text-blue-600 text-[12px]">
              Go to <strong>Send Campaign</strong> tab → select audience → pick a date & time to dispatch.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REVIEW MODAL (single record) ────────────────────────────────────────────
function ReviewModal({ record, onClose }) {
  const dispatch   = useDispatch();
  const isReviewing = useSelector(selectIsReviewing);
  const reviewError = useSelector(selectReviewError);

  const [status, setStatus] = useState("APPROVED");
  const [remark, setRemark] = useState("");

  function handleSubmit() {
    if (!remark.trim()) return;
    dispatch(reviewCsvUploads({ uploadIds: [record.uploadId], status, remark }));
  }

  // close modal once review succeeded
  const reviewStatus = useSelector(selectReviewStatus);
  useEffect(() => {
    if (reviewStatus === "succeeded") onClose();
  }, [reviewStatus, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-[15px]">Review Record</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* record info */}
          <div className="bg-slate-50 rounded-xl p-4 text-[13px] space-y-1.5 text-gray-600">
            <p><span className="font-semibold text-gray-700">Name:</span> {record.name}</p>
            <p><span className="font-semibold text-gray-700">Email:</span> {record.email}</p>
            <p><span className="font-semibold text-gray-700">Mobile:</span> {record.mobileNumber}</p>
            <p><span className="font-semibold text-gray-700">Subject:</span> {record.subject}</p>
            <p><span className="font-semibold text-gray-700">Message:</span> {record.message}</p>
            <p>
              <span className="font-semibold text-gray-700">Uploaded by:</span>{" "}
              {record.user?.name} ({record.user?.email})
            </p>
          </div>
          {/* status toggle */}
          <div>
            <p className="text-[12px] font-semibold text-gray-500 mb-2">Set Status</p>
            <div className="flex gap-2">
              {["APPROVED", "REJECTED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                    status === s
                      ? s === "APPROVED"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {s === "APPROVED" ? "✓ Approve" : "✕ Reject"}
                </button>
              ))}
            </div>
          </div>
          {/* remark */}
          <div>
            <p className="text-[12px] font-semibold text-gray-500 mb-1.5">Remark *</p>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a review comment..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          {reviewError && (
            <p className="text-red-500 text-[12px] bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {reviewError}
            </p>
          )}
        </div>
        <div className="px-6 pb-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isReviewing || !remark.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReviewing ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED"];
const LIMIT = 10;

export default function CommServiceRequest() {
  const dispatch = useDispatch();

  // ── Redux state ────────────────────────────────────────────────────────────
  const rows         = useSelector(selectAdminRows);
  const total        = useSelector(selectAdminTotal);
  const totalPages   = useSelector(selectAdminTotalPages);
  const currentPage  = useSelector(selectAdminCurrentPage);
  const isLoading    = useSelector(selectIsAdminLoading);
  const adminError   = useSelector(selectAdminError);
  const pendingCount = useSelector(selectPendingCount);
  const approvedCount= useSelector(selectApprovedCount);
  const reviewStatus = useSelector(selectReviewStatus);
  const lastReviewedStatus = useSelector(selectLastReviewedStatus);
  const lastReviewedIds    = useSelector(selectLastReviewedIds);

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [selectedIds, setSelectedIds]   = useState([]);
  const [reviewRecord, setReviewRecord] = useState(null);
  const [bulkMode, setBulkMode]         = useState(false);
  const [bulkRemark, setBulkRemark]     = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  // ── Fetch on filter/page change ────────────────────────────────────────────
  const loadData = useCallback(() => {
    dispatch(fetchAllCsvUploads({ status: filterStatus, page, limit: LIMIT }));
  }, [dispatch, filterStatus, page]);

  useEffect(() => { loadData(); }, [loadData]);

  // Also fetch pending count on mount for badge accuracy
  useEffect(() => {
    dispatch(fetchAllCsvUploads({ status: "PENDING", page: 1, limit: 1 }));
    dispatch(fetchAllCsvUploads({ status: "APPROVED", page: 1, limit: 1 }));
  }, [dispatch]);

  // ── After review succeeds ──────────────────────────────────────────────────
  useEffect(() => {
    if (reviewStatus === "succeeded") {
      setReviewRecord(null);
      setSelectedIds([]);
      setBulkMode(false);
      setBulkRemark("");
      if (lastReviewedStatus === "APPROVED") {
        setShowSchedule(true);
      }
      // refresh current tab data
      loadData();
      dispatch(clearReviewState());
    }
  }, [reviewStatus, lastReviewedStatus, loadData, dispatch]);

  // ── Bulk approve ──────────────────────────────────────────────────────────
  function handleBulkApprove() {
    if (!selectedIds.length || !bulkRemark.trim()) return;
    dispatch(reviewCsvUploads({ uploadIds: selectedIds, status: "APPROVED", remark: bulkRemark }));
  }

  // ── Select logic ──────────────────────────────────────────────────────────
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.uploadId));
  function toggleAll()  { allSelected ? setSelectedIds([]) : setSelectedIds(rows.map((r) => r.uploadId)); }
  function toggleOne(id){ setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); }

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = rows.filter((r) =>
    !search ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.mobileNumber?.includes(search)
  );

  // ── Pagination buttons ────────────────────────────────────────────────────
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="space-y-5">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <StatCard
          label="Approved Records"
          value={approvedCount}
          icon={CheckCircle}
          color="text-green-600"
          bg="bg-green-50"
          border="border-green-100"
        />
        <StatCard
          label="Scheduled Campaigns"
          value={0}
          icon={CalendarClock}
          color="text-blue-600"
          bg="bg-blue-50"
          border="border-blue-100"
        />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">

          {/* status tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); setSelectedIds([]); }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                  filterStatus === s
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s}
                {s === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, mobile..."
              className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* bulk approve button */}
            {filterStatus === "PENDING" && selectedIds.length > 0 && (
              <button
                onClick={() => setBulkMode(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-xl transition-colors"
              >
                <CheckCheck size={13} />
                Approve {selectedIds.length} selected
              </button>
            )}
            {/* refresh */}
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* bulk remark bar */}
        {bulkMode && (
          <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <AlertCircle size={15} className="text-green-600 shrink-0" />
            <input
              value={bulkRemark}
              onChange={(e) => setBulkRemark(e.target.value)}
              placeholder="Add remark for bulk approval..."
              className="flex-1 border border-green-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/30 bg-white"
            />
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setBulkMode(false); setBulkRemark(""); }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-600 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={!bulkRemark.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[12px] font-semibold disabled:opacity-50 transition-colors"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        )}

        {/* error banner */}
        {adminError && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-600 text-[13px]">
            {adminError}
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                {filterStatus === "PENDING" && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Uploaded By</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Status</th>
                {filterStatus === "PENDING" && (
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Action</th>
                )}
                {(filterStatus === "APPROVED" || filterStatus === "REJECTED") && (
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 text-[11px] uppercase tracking-wide">Remark</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[13px]">
                    <RefreshCw size={18} className="animate-spin inline mr-2" />
                    Loading records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-[13px]">
                    No {filterStatus.toLowerCase()} records found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.uploadId}
                    className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(row.uploadId) ? "bg-blue-50/40" : ""}`}
                  >
                    {filterStatus === "PENDING" && (
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.uploadId)}
                          onChange={() => toggleOne(row.uploadId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800">{row.name}</p>
                      <p className="text-gray-400 text-[11px]">{row.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700">{row.mobileNumber}</p>
                      {row.whatsappNumber && row.whatsappNumber !== row.mobileNumber && (
                        <p className="text-gray-400 text-[11px]">WA: {row.whatsappNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700">{row.subject}</p>
                      <p className="text-gray-400 text-[11px] truncate max-w-[160px]">{row.message}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-gray-700 font-medium">{row.user?.name}</p>
                      <p className="text-gray-400 text-[11px]">{row.user?.businessLocation}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                    {filterStatus === "PENDING" && (
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setReviewRecord(row)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[12px] font-semibold rounded-lg transition-colors"
                        >
                          <Eye size={12} /> Review
                        </button>
                      </td>
                    )}
                    {(filterStatus === "APPROVED" || filterStatus === "REJECTED") && (
                      <td className="px-4 py-3.5 text-gray-500 text-[12px] max-w-[160px] truncate">
                        {row.reviewComment ?? "—"}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
          <p>
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
            </span>{" "}
            of <span className="font-semibold text-gray-700">{total}</span> records
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {pageNumbers.map((p, idx) =>
              p === "..." ? (
                <span key={`dot-${idx}`} className="px-1 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {reviewRecord && (
        <ReviewModal
          record={reviewRecord}
          onClose={() => { setReviewRecord(null); dispatch(clearReviewState()); }}
        />
      )}
      {showSchedule && (
        <SchedulePopup
          count={lastReviewedIds.length}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}