import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSubmissionStatus,
  resetUpdateStatus,
  selectUpdateStatus,
  selectUpdateError,
} from "../../../redux/slices/Cponboardingslice.js";
import { selectUser } from "../../../redux/slices/authSlice";

// ── Helper: render one answer field ──────────────────────────────────────────
const AnswerRow = ({ label, value }) => {
  if (!value) return null;

  // Image / file URL
  const isUrl =
    typeof value === "string" &&
    (value.startsWith("http") || value.startsWith("data:"));

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-medium
                     hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0
                 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
                 0-8.268-2.943-9.542-7z" />
          </svg>
          View file
        </a>
      ) : (
        <span className="text-sm text-gray-800 font-medium break-words">{String(value)}</span>
      )}
    </div>
  );
};

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Pending:  "bg-amber-100  text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100   text-red-600",
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function CpSubmissionDetailModal({ submission, onClose }) {
  const dispatch      = useDispatch();
  const user          = useSelector(selectUser);
  const updateStatus  = useSelector(selectUpdateStatus);
  const updateError   = useSelector(selectUpdateError);

  const subId   = submission._id ?? submission.submissionId;
  const answers = submission.answers ?? {};
  const files   = submission.files   ?? [];

  // Reset on unmount
  useEffect(() => () => dispatch(resetUpdateStatus()), [dispatch]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Approve / Reject
  const handleAction = (status) => {
    if (!user?._id) return;
    dispatch(
      updateSubmissionStatus({
        submissionId: subId,
        userId: user._id,
        status,
      })
    );
  };

  const isLoading  = updateStatus === "loading";
  const isSuccess  = updateStatus === "succeeded";
  const currentStatus = submission.status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl
                   max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {answers.fullName ?? "Application"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  STATUS_STYLES[currentStatus] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {currentStatus}
              </span>
              {submission.submittedAt && (
                <span className="text-xs text-gray-400">
                  {new Date(submission.submittedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* ── Body (scrollable) ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Submitted answers */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Submitted Details
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
              {Object.keys(answers).length === 0 ? (
                <p className="text-sm text-gray-400">No answers submitted.</p>
              ) : (
                Object.entries(answers).map(([key, val]) => (
                  <AnswerRow
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1").trim()}
                    value={val}
                  />
                ))
              )}
            </div>
          </div>

          {/* Uploaded files */}
          {files.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Uploaded Files
              </p>
              <div className="space-y-2">
                {files.map((file, i) => (
                  <a
                    key={i}
                    href={file.url ?? file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200
                               bg-white hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium group-hover:text-indigo-600 truncate">
                      {file.name ?? `File ${i + 1}`}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0
                                    group-hover:text-indigo-400 transition-colors"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4
                           M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {updateStatus === "failed" && updateError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {updateError}
            </div>
          )}

          {/* Success message */}
          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3
                            text-sm text-emerald-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 13l4 4L19 7" />
              </svg>
              Status updated successfully!
            </div>
          )}
        </div>

        {/* ── Footer action buttons ────────────────────────────────────────────── */}
        {currentStatus === "Pending" && !isSuccess && (
          <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
            {/* Reject */}
            <button
              onClick={() => handleAction("Rejected")}
              disabled={isLoading}
              className="flex-1 py-3 rounded-2xl border-2 border-red-200 text-red-600
                         font-semibold text-sm hover:bg-red-50 active:scale-95
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating…" : "✕  Reject"}
            </button>

            {/* Approve */}
            <button
              onClick={() => handleAction("Approved")}
              disabled={isLoading}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white
                         font-semibold text-sm hover:bg-indigo-700 active:scale-95
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                      strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                  </svg>
                  Updating…
                </span>
              ) : (
                "✓  Approve"
              )}
            </button>
          </div>
        )}

        {/* Already actioned — show close only */}
        {(currentStatus !== "Pending" || isSuccess) && (
          <div className="px-6 pb-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-700
                         font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
