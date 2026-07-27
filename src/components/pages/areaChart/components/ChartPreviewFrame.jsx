import React from "react";
import { FileText } from "lucide-react";
import { CHART_BG_TEXTURE } from "../chartAssets.js";
import pdfBg from "../../../../assets/pdfBg.png";
/**
 * Wraps a single chart page in a fixed-size, A4-ratio "sheet" (1:1.4142, ISO 216)
 * so Cover / Chart body / Products all render at the exact same page dimensions,
 * matching a real PDF viewer.
 */
export default function ChartPreviewFrame({ pageLabel, pageNumber, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
          <FileText size={12} className="text-gray-500" />
        </div>
        <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-400">
          {pageLabel}
        </p>
      </div>

      <div className="mx-auto w-full max-w-[760px] aspect-[1/1.4142] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative">
        <div
          className="absolute inset-0 overflow-y-auto"
          style={
            pageNumber
              ? {
                  // backgroundImage: `url(${CHART_BG_TEXTURE})`,
                  // backgroundSize: "cover",
                  // backgroundPosition: "center",
                }
              : undefined
          }
        >
          {children}
        </div>

        {pageNumber != null && (
          <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-ink flex items-center px-3 z-20 pointer-events-none">
            <span className="w-[22px] h-[22px] rounded-full bg-steel text-white text-[7.4px] font-bold flex items-center justify-center tabular-nums">
              {String(pageNumber).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
