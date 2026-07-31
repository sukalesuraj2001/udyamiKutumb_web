import React, { useRef, useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { CHART_BG_TEXTURE } from "../chartAssets.js";
import pdfBg from "../../../../assets/pdfBg.png";
/**
 * Wraps a single chart page in a fixed-size, A4-ratio "sheet" (1:1.4142, ISO 216)
 * so Cover / Chart body / Products all render at the exact same page dimensions,
 * matching a real PDF viewer.
 */
export default function ChartPreviewFrame({ pageLabel, pageNumber, children }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const baseWidth = 760; // Native A4 preview width
      if (parentWidth > 0 && parentWidth < baseWidth) {
        setScale(parentWidth / baseWidth);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const baseWidth = 760;
  const baseHeight = 760 * 1.4142;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
          <FileText size={12} className="text-gray-500" />
        </div>
        <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-400 truncate">
          {pageLabel}
        </p>
      </div>

      <div ref={containerRef} className="w-full max-w-[760px] mx-auto overflow-x-auto">
        <div
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: scale < 1 ? `scale(${scale})` : "none",
            transformOrigin: "top left",
            marginBottom: scale < 1 ? `-${(1 - scale) * baseHeight}px` : "0px",
            marginRight: scale < 1 ? `-${(1 - scale) * baseWidth}px` : "0px",
          }}
          className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative"
        >
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
    </div>
  );
}
