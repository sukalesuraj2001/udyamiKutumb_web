import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCpSubmissions,
  updateSubmissionStatus,
  resetUpdateStatus,
  selectSubmissions,
  selectFetchStatus,
  selectFetchError,
  selectUpdateStatus,
  selectUpdateError,
} from "../../../redux/slices/Cponboardingslice.js";
import { selectUser } from "../../../redux/slices/authSlice";

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ["All", "Pending", "Approved", "Rejected"];

const STATUS_STYLES = {
  Pending:  { pill: "bg-amber-100 text-amber-700 border border-amber-200",  dot: "bg-amber-400"  },
  Approved: { pill: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  Rejected: { pill: "bg-red-100 text-red-600 border border-red-200",        dot: "bg-red-500"   },
};

// ─── Small reusable pieces ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? { pill: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status ?? "Unknown"}
    </span>
  );
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// ─── Answer row (detail panel) ────────────────────────────────────────────────
const AnswerRow = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  const isUrl = typeof value === "string" && (value.startsWith("http") || value.startsWith("data:"));
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label.replace(/([A-Z])/g, " $1").trim()}
      </span>
      {isUrl ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium hover:underline">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View file
        </a>
      ) : (
        <span className="text-sm text-gray-800 font-medium break-words">{String(value)}</span>
      )}
    </div>
  );
};

// ─── Left panel — submission list ─────────────────────────────────────────────
function SubmissionList({ filtered, selected, onSelect, fetchStatus, fetchError, onRetry }) {
  if (fetchStatus === "loading")
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (fetchStatus === "failed")
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
        <p className="text-sm text-red-500 font-medium">{fetchError}</p>
        <button onClick={onRetry} className="text-xs text-indigo-600 underline">Try again</button>
      </div>
    );

  if (filtered.length === 0)
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">No applications</p>
        <p className="text-xs text-gray-400">Submissions will appear here.</p>
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
      {filtered.map((sub) => {
        const name   = sub.answers?.fullName ?? sub.cpName ?? "—";
        const mobile = sub.answers?.mobile   ?? sub.mobile  ?? "—";
        const isActive = (selected?._id ?? selected?.submissionId) === (sub._id ?? sub.submissionId);

        return (
          <button
            key={sub._id ?? sub.submissionId}
            onClick={() => onSelect(sub)}
            className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors
                        ${isActive ? "bg-indigo-50 border-r-2 border-indigo-500" : "hover:bg-gray-50"}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center
                             text-xs font-bold flex-shrink-0
                             ${isActive ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-600"}`}>
              {getInitials(name)}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
                {name}
              </p>
              <p className="text-xs text-gray-400 truncate">{mobile}</p>
            </div>

            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_STYLES[sub.status]?.dot ?? "bg-gray-300"}`} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Right panel — detail + actions ──────────────────────────────────────────
function SubmissionDetail({ submission, onClear }) {
  const dispatch     = useDispatch();
  const user         = useSelector(selectUser);
  const updateStatus = useSelector(selectUpdateStatus);
  const updateError  = useSelector(selectUpdateError);

  const subId   = submission._id ?? submission.submissionId;
  const answers = submission.answers ?? {};
  const files   = submission.files   ?? [];
  const status  = submission.status;

  // Reset on unmount / when submission changes
  useEffect(() => {
    dispatch(resetUpdateStatus());
  }, [subId, dispatch]);

  const handleAction = (newStatus) => {
    if (!user?._id) return;
    dispatch(updateSubmissionStatus({ submissionId: subId, userId: user._id, status: newStatus }));
  };

  const isLoading = updateStatus === "loading";
  const isSuccess = updateStatus === "succeeded";

  return (
    <div className="flex flex-col h-full">
      {/* ── Detail header ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700
                          flex items-center justify-center font-bold text-sm flex-shrink-0">
            {getInitials(submission.answers?.fullName ?? "")}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {submission.answers?.fullName ?? "Application"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400">{formatDate(submission.submittedAt)}</span>
            </div>
          </div>
        </div>

        {/* Close on mobile */}
        <button
          onClick={onClear}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-full
                     bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs transition-colors"
        >
          ✕
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Answers */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Submitted Details
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            {Object.keys(answers).length === 0 ? (
              <p className="text-sm text-gray-400">No answers submitted.</p>
            ) : (
              Object.entries(answers).map(([key, val]) => (
                <AnswerRow key={key} label={key} value={val} />
              ))
            )}
          </div>
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Uploaded Files
            </p>
            <div className="space-y-2">
              {files.map((file, i) => (
                <a key={i} href={file.url ?? file} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-3 p-3 rounded-xl border border-gray-200
                              bg-white hover:border-indigo-300 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-indigo-600 truncate flex-1">
                    {file.name ?? `File ${i + 1}`}
                  </span>
                  <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Feedback banners */}
        {updateStatus === "failed" && updateError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {updateError}
          </div>
        )}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3
                          text-sm text-emerald-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Status updated successfully!
          </div>
        )}
      </div>

      {/* ── Action footer ────────────────────────────────────────────────────── */}
      {status === "Pending" && !isSuccess && (
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => handleAction("Rejected")}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-2xl border-2 border-red-200 text-red-600
                       font-semibold text-sm hover:bg-red-50 active:scale-95
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating…" : "✕  Reject"}
          </button>
          <button
            onClick={() => handleAction("Approved")}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-2xl bg-indigo-600 text-white
                       font-semibold text-sm hover:bg-indigo-700 active:scale-95
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                    strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
                Updating…
              </span>
            ) : "✓  Approve"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Empty detail placeholder ─────────────────────────────────────────────────
function DetailPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-500">Select an application</p>
      <p className="text-xs text-gray-400">Click any submission on the left to review details.</p>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function CpSubmissions() {
  const dispatch    = useDispatch();
  const user        = useSelector(selectUser);
  const submissions = useSelector(selectSubmissions);
  const fetchStatus = useSelector(selectFetchStatus);
  const fetchError  = useSelector(selectFetchError);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    if (user?._id) dispatch(fetchCpSubmissions(user._id));
  }, [dispatch, user]);

  // When redux optimistically updates the selected submission's status, sync it
  useEffect(() => {
    if (!selected) return;
    const fresh = submissions.find(
      (s) => (s._id ?? s.submissionId) === (selected._id ?? selected.submissionId)
    );
    if (fresh) setSelected(fresh);
  }, [submissions]);

  const filtered = submissions.filter((sub) => {
    const matchFilter = activeFilter === "All" || sub.status === activeFilter;
    const name = sub.answers?.fullName ?? sub.cpName ?? "";
    return matchFilter && name.toLowerCase().includes(search.toLowerCase());
  });

  const countFor = (f) =>
    f === "All" ? submissions.length : submissions.filter((s) => s.status === f).length;

  const handleRetry = () => user?._id && dispatch(fetchCpSubmissions(user._id));

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* ══ Page header ══════════════════════════════════════════════════════ */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">CP Applications</h1>
          <p className="text-xs text-gray-400 mt-0.5">Review and manage onboarding submissions</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200
                     bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582M20 20v-5h-.581M5.636 15A9 9 0 1018.364 9" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ══ Two-column body ══════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
        <div className={`flex flex-col bg-white border-r border-gray-100 
                         w-full lg:w-72 xl:w-80 flex-shrink-0
                         ${selected ? "hidden lg:flex" : "flex"}`}>

          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50
                           text-xs text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-3 py-2.5 border-b border-gray-50 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
                            whitespace-nowrap transition-all
                            ${activeFilter === f
                              ? "bg-indigo-600 text-white"
                              : "text-gray-500 hover:bg-gray-100"}`}
              >
                {f}
                <span className={`text-[10px] font-bold
                                  ${activeFilter === f ? "opacity-70" : "text-gray-400"}`}>
                  {countFor(f)}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <SubmissionList
            filtered={filtered}
            selected={selected}
            onSelect={setSelected}
            fetchStatus={fetchStatus}
            fetchError={fetchError}
            onRetry={handleRetry}
          />
        </div>

        {/* ── RIGHT DETAIL PANEL ────────────────────────────────────────────── */}
        <div className={`flex-1 overflow-hidden flex flex-col bg-white
                         ${selected ? "flex" : "hidden lg:flex"}`}>
          {selected ? (
            <SubmissionDetail submission={selected} onClear={() => setSelected(null)} />
          ) : (
            <DetailPlaceholder />
          )}
        </div>

      </div>
    </div>
  );
}