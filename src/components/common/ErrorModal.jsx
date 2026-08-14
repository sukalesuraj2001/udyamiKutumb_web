import React from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";

/**
 * ErrorModal / Popup Component
 * Displayed specifically for API error responses (e.g., 409 Conflict, Mobile number already exists).
 *
 * Props:
 *   isOpen {boolean} - whether the modal is visible
 *   error {object|string} - error object e.g. { message: "...", error: "Conflict", statusCode: 409 } or error string
 *   onClose {function} - callback when user closes the modal
 */
export default function ErrorModal({ isOpen, error, onClose }) {
  if (!isOpen || !error) return null;

  let message = "";
  let title = "Error";
  let statusCode = null;

  if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    message =
      error.message ||
      error.msg ||
      error.response?.data?.message ||
      (typeof error.error === "string" ? error.error : null) ||
      "An unexpected error occurred.";

    title =
      (typeof error.error === "string" && error.error !== message ? error.error : null) ||
      error.title ||
      (error.statusCode ? `Error ${error.statusCode}` : null) ||
      (error.response?.status ? `Error ${error.response.status}` : null) ||
      "Conflict Error";

    statusCode = error.statusCode || error.response?.status || null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Indicator Strip */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 h-2.5 w-full" />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {title}
                  </h3>
                  {statusCode && (
                    <span className="px-2.5 py-0.5 text-[11px] font-bold text-red-700 bg-red-100/90 rounded-full border border-red-200">
                      {statusCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-500 font-semibold mt-0.5">
                  Action Could Not Be Completed
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer"
              aria-label="Close error modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message Container */}
          <div className="mt-5 p-4 bg-red-50/90 border border-red-200 rounded-xl shadow-inner">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-950 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Understand & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
