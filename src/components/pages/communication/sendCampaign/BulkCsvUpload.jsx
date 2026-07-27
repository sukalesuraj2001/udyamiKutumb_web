import React, { useRef } from "react";
import { Upload, FileText, Trash2, AlertCircle, X } from "lucide-react";

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

// ─────────────────────────────────────────────────────────────────────────────
// BulkCsvUpload — pure file picker, zero upload logic
//
// Props:
//   file          → controlled File object (or null) from parent
//   onFileSelect  → (File | null, errorMsg | null) callback
//   error         → string | null — external error from Redux
//   onClearError  → () callback to clear external error
// ─────────────────────────────────────────────────────────────────────────────
export default function BulkCsvUpload({ file, onFileSelect, error, onClearError }) {
  const inputRef = useRef(null);

  const validate = (f) => {
    if (!f) return null;
    if (!f.name.toLowerCase().endsWith(".csv"))
      return "Only CSV files are allowed.";
    if (f.size > 20 * 1024 * 1024)
      return "File too large. Max size is 20 MB.";
    return null;
  };

  const pick = (f) => {
    if (!f) return;
    const err = validate(f);
    if (err) { onFileSelect(null, err); return; }
    onFileSelect(f, null);
  };

  const onInputChange = (e) => {
    pick(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    pick(e.dataTransfer.files?.[0]);
  };

  const remove = () => onFileSelect(null, null);

  return (
    <div className="space-y-3">

      {/* Drop zone */}
      {!file && (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-2 w-full
                     border-2 border-dashed border-gray-200 rounded-xl py-8
                     cursor-pointer hover:border-blue-300 hover:bg-blue-50/30
                     transition-colors"
        >
          <Upload size={22} className="text-gray-400" />
          <span className="text-[13px] font-semibold text-gray-500">
            Drop a CSV or click to browse
          </span>
          <span className="text-[11.5px] text-gray-400 text-center px-4">
            Required columns: Name, Mobile Number, Email ID, WhatsApp Number, Subject, Message
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onInputChange}
          />
        </label>
      )}

      {/* Selected file row */}
      {file && (
        <div className="flex items-center gap-3 px-3.5 py-2.5
                        bg-blue-50 border border-blue-100 rounded-xl">
          <FileText size={16} className="text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 truncate">
              {file.name}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {fmtSize(file.size)} · Ready to submit
            </p>
          </div>
          <button
            onClick={remove}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
            title="Remove file"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 text-[12.5px] text-red-600
                        bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          <AlertCircle size={13} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={onClearError} className="ml-auto text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      <p className="text-[11.5px] text-gray-400">
        CSV upload will override geographic &amp; filter-based selection.
      </p>
    </div>
  );
}