import React, { useRef, useState, useEffect, useCallback } from "react";
import { FileText } from "lucide-react";

const BASE_W = 794;
const BASE_H = 1123; // true A4 ratio (794 * 1.41436 = 1123)

export default function ChartPreviewFrame({ pageLabel, pageNumber, children }) {
  const containerRef = useRef(null);
  const probeRef    = useRef(null); // hidden off-screen clone — measures natural height
  const [outerScale,   setOuterScale]   = useState(1);
  const [contentScale, setContentScale] = useState(1);

  // ── Outer scale: shrink page to fit narrow screens ─────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setOuterScale(w > 0 && w < BASE_W ? w / BASE_W : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Content scale: measure natural height in a probe div, never flash ──
  //    The probe is a sibling positioned off-screen so measurement is clean
  //    and the visible content div always has stable styles (no reset dance).
  const measureAndScale = useCallback(() => {
    // Content should never shrink or scale — pagination handles splitting content cleanly across A4 pages.
    setContentScale(1);
  }, []);

  useEffect(() => {
    measureAndScale();
  }, [children, measureAndScale]);

  // Also re-measure if probe resizes (image load, font swap, etc.)
  useEffect(() => {
    const el = probeRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureAndScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureAndScale]);

  // Derived styles for the visible content div
  // When scaled: logical height is expanded so the full content renders,
  //              then CSS scale() shrinks it back into BASE_H.
  const contentStyle = {
    width:           `${BASE_W}px`,
    height:          contentScale < 1 ? `${BASE_H / contentScale}px` : `${BASE_H}px`,
    // ↑ Always give a concrete height so children using h-full / min-h-full work
    transformOrigin: "top left",
    transform:       contentScale < 1 ? `scale(${contentScale})` : "none",
  };

  // The probe is identical in width but uses auto height so scrollHeight is accurate
  const probeStyle = {
    position:      "fixed",
    top:           "-99999px",
    left:          "-99999px",
    width:         `${BASE_W}px`,
    height:        "auto",
    visibility:    "hidden",
    pointerEvents: "none",
    zIndex:        -1,
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5">

      {/* Page label */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
          <FileText size={12} className="text-gray-500" />
        </div>
        <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-gray-400 truncate">
          {pageLabel}
        </p>
      </div>

      {/* Responsive outer shell */}
      <div ref={containerRef} className="w-full max-w-[794px] mx-auto">

        {/* A4 page — fixed 794 × BASE_H, outer-scaled on narrow screens */}
        <div
          style={{
            width:          `${BASE_W}px`,
            height:         `${BASE_H}px`,
            transform:      outerScale < 1 ? `scale(${outerScale})` : "none",
            transformOrigin:"top left",
            // Collapse layout space taken by the scaled-down element
            marginBottom:   outerScale < 1 ? `-${(1 - outerScale) * BASE_H}px` : "0",
            marginRight:    outerScale < 1 ? `-${(1 - outerScale) * BASE_W}px` : "0",
            overflow:       "visible",
            position:       "relative",
          }}
          className="pdf-capture-page bg-white rounded-lg border border-slate-200 shadow-sm"
        >
          {/* Visible content — scale-down applied here if overflow */}
          <div style={contentStyle}>
            {children}
          </div>

          {/* Page number badge (sits on top, not inside content scale) */}
          {pageNumber != null && (
            <div className="absolute bottom-0 left-0 right-0 h-[28px] bg-ink flex items-center px-3 z-20 pointer-events-none">
              <span className="w-[22px] h-[22px] rounded-full bg-steel text-white text-[7.4px] font-bold flex items-center justify-center tabular-nums">
                {String(pageNumber).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Measurement probe (invisible, off-screen) ── */}
      {/* Renders children at natural height so we can read scrollHeight cleanly */}
      <div ref={probeRef} style={probeStyle} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}