import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
  Mail, Phone, MessageSquare, Clock, CheckCircle2, XCircle, HelpCircle,
} from "lucide-react";
import {
  fetchUploadedCsvData,
  selectCsvRows,
  selectCsvTotal,
  selectCsvDataStatus,
  selectCsvDataError,
  selectIsFetchingCsv,
} from "../../../redux/slices/sendMessageSlice.js";
import { selectUser } from "../../../redux/slices/authSlice.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: Clock },
  APPROVED: { label: "Approved", cls: "bg-green-50 text-green-700 border-green-200", Icon: CheckCircle2 },
  REJECTED: { label: "Rejected", cls: "bg-red-50   text-red-700   border-red-200", Icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || {
    label: status || "—",
    cls: "bg-gray-50 text-gray-600 border-gray-200",
    Icon: HelpCircle,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold
                      px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, current - delta);
    const right = Math.min(totalPages, current + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push("…"); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }
    return pages;
  };

  const btnCls = (active) =>
    `min-w-[32px] h-8 flex items-center justify-center rounded-lg text-[12.5px]
     font-semibold border transition-all ${active
      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-[12px] text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-600">
          {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, total)}
        </span>{" "}
        of <span className="font-semibold text-gray-600">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className={`${btnCls(false)} px-2 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-gray-400 text-[12px]">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p)} className={`${btnCls(p === current)} px-2`}>
              {p}
            </button>
          )
        )}
        <button
          disabled={current === Math.ceil(total / pageSize)}
          onClick={() => onChange(current + 1)}
          className={`${btnCls(false)} px-2 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Columns ─────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "name", head: "Name", width: "w-36" },
  { key: "email", head: "Email", width: "w-48" },
  { key: "mobileNumber", head: "Mobile", width: "w-32" },
  { key: "whatsappNumber", head: "WhatsApp", width: "w-32" },
  { key: "subject", head: "Subject", width: "w-32" },
  { key: "message", head: "Message", width: "w-48" },
  { key: "status", head: "Status", width: "w-28" },
  { key: "reviewComment", head: "Review Comment", width: "w-36" },
  { key: "reviewedBy", head: "Reviewed By", width: "w-32" },
  { key: "createdAt", head: "Created At", width: "w-40" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CsvDataTable
// No props needed — fetched on mount by parent (SendCampaign).
// Refresh button available for manual re-fetch.
// ─────────────────────────────────────────────────────────────────────────────
export default function CsvDataTable() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const rows = useSelector(selectCsvRows);
  const total = useSelector(selectCsvTotal);
  const status = useSelector(selectCsvDataStatus);
  const error = useSelector(selectCsvDataError);
  const isLoading = useSelector(selectIsFetchingCsv);

  const [page, setPage] = useState(1);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const handleRefresh = () => {
    if (user?.userId) {
      setPage(1);
      dispatch(fetchUploadedCsvData(user.userId));
    }
  };

  // ── Don't render at all if fetch hasn't been triggered yet ────────────────
  if (status === "idle") return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div>
          <h3 className="text-[14px] font-bold text-gray-800">Submitted CSV Records</h3>
          {status === "succeeded" && (
            <p className="text-[12px] text-gray-400 mt-0.5">
              {total} record{total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold
                     text-gray-500 hover:text-blue-600
                     disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-14 text-gray-400">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span className="text-[13px] font-semibold">Loading records…</span>
        </div>
      )}

      {/* Error */}
      {!isLoading && status === "failed" && (
        <div className="flex items-center justify-center gap-2 py-10 text-red-500">
          <AlertCircle size={16} />
          <span className="text-[13px] font-semibold">{error}</span>
        </div>
      )}

      {/* Empty */}
      {!isLoading && status === "succeeded" && rows.length === 0 && (
        <div className="flex flex-col items-center py-14 text-gray-400 gap-2">
          <MessageSquare size={28} className="opacity-30" />
          <p className="text-[13px] font-semibold">No records yet</p>
          <p className="text-[12px] text-gray-400">
            Upload a CSV and submit your first campaign.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && status === "succeeded" && rows.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-[11.5px] font-bold
                                 text-gray-500 uppercase tracking-wide w-10">
                    #
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-2.5 text-left text-[11.5px] font-bold
                                  text-gray-500 uppercase tracking-wide ${col.width}`}
                    >
                      {col.head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr
                      key={row.uploadId || idx}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 font-medium">{rowNum}</td>

                      <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                        {row.name || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={row.email}>
                        {row.email
                          ? <span className="flex items-center gap-1"><Mail size={11} className="text-gray-400 shrink-0" />{row.email}</span>
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.mobileNumber
                          ? <span className="flex items-center gap-1"><Phone size={11} className="text-gray-400 shrink-0" />{row.mobileNumber}</span>
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.whatsappNumber || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-700 font-medium max-w-[120px] truncate" title={row.subject}>
                        {row.subject || "—"}
                      </td>

                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate" title={row.message}>
                        {row.message || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="px-4 py-3 text-gray-500 max-w-[130px] truncate" title={row.reviewComment}>
                        {row.reviewComment || <span className="text-gray-300">—</span>}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {row.reviewedBy?.name || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-[11.5px]">
                        {fmtDate(row.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}