import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const AUTO_CLOSE_MS = 5000;

export default function UploadResultBanner({ result, onDismiss, autoClose = true }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    setVisible(true);

    if (!autoClose) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      clearInterval(intervalRef.current);
      onDismiss?.();
    }, AUTO_CLOSE_MS);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [result, autoClose]);

  const handleManualClose = () => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    setVisible(false);
    onDismiss?.();
  };

  if (!result?.totalRecords || !visible) return null;

  const hasErrors = result.failedCount > 0;
  const accentColor = hasErrors ? "#f59e0b" : "#22c55e";

  return (
    <div
      className={`rounded-xl text-[12.5px] border overflow-hidden ${
        hasErrors
          ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-green-50 border-green-200 text-green-800"
      }`}
    >
      {autoClose && (
        <div className="h-[3px] w-full bg-black/5">
          <div
            className="h-full transition-none"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold">
            {hasErrors ? (
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            )}
            {result.message}
          </div>
          <button onClick={handleManualClose} className="text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "Total",    value: result.totalRecords, color: "text-gray-700" },
            { label: "Inserted", value: result.dataInserted, color: "text-green-700" },
            { label: "Failed",   value: result.failedCount,  color: "text-red-600"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/70 rounded-lg px-3 py-2 text-center">
              <p className={`text-[15px] font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {result.failedRecords?.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <p className="font-semibold text-[11.5px] text-gray-600 mb-1">Failed rows:</p>
            {result.failedRecords.map((rec, i) => (
              <div key={i} className="bg-white/60 rounded-lg px-3 py-1.5">
                <p className="font-semibold text-gray-700">
                  {rec.row?.Name || `Row ${i + 1}`}
                  {rec.row?.["Mobile Number"] && (
                    <span className="font-normal text-gray-500 ml-1.5">
                      {rec.row["Mobile Number"]}
                    </span>
                  )}
                </p>
                <p className="text-red-500 text-[11px] mt-0.5">{rec.errors?.join(" · ")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}