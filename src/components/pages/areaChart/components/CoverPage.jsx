import React, { useRef } from "react";
import {
  UDYAMI_BHARAT_LOCKUP_URL,
  KUTUMBA_LOGO_URL,
  HERO_IMAGE_URL,
} from "../chartAssets.js";

// Colours measured from the printed reference cover.
const COVER_RED = "#A3192B";
const COVER_NAVY = "#0F1C5B";

export default function CoverPage({
  code = "",
  regionName = "",
  extraCount = 14,
  heroImageUrl = HERO_IMAGE_URL,
  heroCaption = "",
  taglineKn = "ಒಂದು ಮನೆ. ಒಂದು ಉದ್ಯಮ. ಒಂದು ಶಕ್ತಿಶಾಲಿ ರಾಷ್ಟ್ರ.",
  onHeroImageSelect,
  showHeroUpload = false,
  // Print Preview only: taluka heading (e.g. "G33 NELAMANGALA") and the list of
  // its wards - [{ code: "G33. 2", name: "Nelamangala", count: 108 }] - shown
  // above the hero image together with the TOTAL line.
  summaryTitle = "",
  summaryWards = null,
}) {
  const fileInputRef = useRef(null);

  const handleCircleClick = () => {
    if (showHeroUpload && onHeroImageSelect) fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onHeroImageSelect) onHeroImageSelect(file);
    e.target.value = "";
  };

  // Two columns, filled top-to-bottom (left column first), like the printed cover.
  const hasSummary = Array.isArray(summaryWards) && summaryWards.length > 0;
  const summaryRows = hasSummary ? Math.ceil(summaryWards.length / 2) : 0;
  const summaryColumns = hasSummary
    ? [summaryWards.slice(0, summaryRows), summaryWards.slice(summaryRows)]
    : [];
  const wardsTotal = hasSummary
    ? summaryWards.reduce((sum, w) => sum + (Number(w.count) || 0), 0)
    : 0;
  const grandTotal = (Number(extraCount) || 0) + wardsTotal;
  // The hero circle starts at 47% of the page; a very long ward list pushes it
  // down instead of overlapping it (first 10 rows fit in the default space).
  const heroExtraPx = hasSummary ? Math.max(0, summaryRows - 10) * 22 : 0;

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Hidden file input */}
      {showHeroUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* ── Red swooshes + navy base (behind everything else) ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 144"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* upper swoosh */}
        <path
          d="M0,51 C26,53 62,66 100,89 L100,97 C62,76 26,63 0,62 Z"
          fill={COVER_RED}
        />
        {/* lower swoosh */}
        <path
          d="M0,65 C26,66 62,80 100,100 L100,106 C62,89 26,77 0,75 Z"
          fill={COVER_RED}
        />
        {/* navy base */}
        <path
          d="M0,78 C26,79 62,93 100,108 L100,144 L0,144 Z"
          fill={COVER_NAVY}
        />
      </svg>

      {/* ── Header row: Udyami Bharat lockup (left) + Kutumba (right) ── */}
      <div className="relative z-10 flex items-start justify-between px-[5%] pt-[3%]">
        <div
          className="relative shrink-0 overflow-hidden w-[46%]"
          style={{ aspectRatio: "2.937 / 1" }}
        >
          <img
            src={UDYAMI_BHARAT_LOCKUP_URL}
            alt="Udyami Bharat"
            className="absolute max-w-none"
            style={{ width: "143.4%", left: "-21.5%", top: "-27.4%" }}
          />
        </div>
        <div
          className="relative shrink-0 overflow-hidden w-[16%]"
          style={{ aspectRatio: "0.781 / 1" }}
        >
          <img
            src={KUTUMBA_LOGO_URL}
            alt="Kutumba"
            className="absolute max-w-none"
            style={{ width: "145.5%", left: "-25%", top: "-6.5%" }}
          />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="relative z-10 pl-[14.5%] pr-[11%] mt-[1.5%]">
        <h1
          className={`text-[30px] font-extrabold tracking-tight leading-none truncate max-w-full ${
            hasSummary ? "inline-block pb-[3px]" : ""
          }`}
          style={{
            color: COVER_RED,
            ...(hasSummary ? { borderBottom: `2px solid ${COVER_RED}` } : null),
          }}
        >
          {hasSummary && summaryTitle ? summaryTitle : `${code} ${regionName?.toUpperCase()}`}
        </h1>
      </div>

      {/* ── Taluka ward list (Print Preview only) ── */}
      {hasSummary && (
        <div className="relative z-10 pl-[14.5%] pr-[12%] mt-[2%] grid grid-cols-2 gap-x-[6%]">
          {summaryColumns.map((col, ci) => (
            <div key={ci} className="space-y-[1px]">
              {col.map((w, wi) => (
                <div key={`${w.code}-${wi}`} className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] text-ink leading-[1.45] truncate">
                    {w.code} {w.name}
                  </p>
                  <span
                    className="text-[15px] shrink-0 tabular-nums"
                    style={{ color: COVER_RED }}
                  >
                    {w.count}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── TOTAL line (Print Preview only) ── */}
      {hasSummary && (
        <p
          className="relative z-10 mt-[3.5%] text-center text-[28px] font-extrabold tracking-tight leading-none"
          style={{ color: COVER_RED }}
        >
          TOTAL {extraCount}+{wardsTotal}={grandTotal}
        </p>
      )}

      {/* ── Hero circle ── */}
      <div
        onClick={handleCircleClick}
        style={heroExtraPx ? { marginTop: `${heroExtraPx}px` } : undefined}
        className={`absolute left-1/2 -translate-x-1/2 top-[47%] w-[56%] aspect-square z-10
          rounded-full border-[8px] border-white
          shadow-[0_0_0_3px_rgba(15,28,91,0.08),0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden bg-paper
          ${showHeroUpload ? "cursor-pointer group" : "cursor-default"}`}
      >
        <img
          src={heroImageUrl}
          alt={heroCaption}
          className="w-full h-full object-cover"
        />

        {showHeroUpload && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex flex-col items-center justify-center gap-1">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
              Upload Photo
            </span>
          </div>
        )}

        {heroCaption && (
          <span className="absolute bottom-[8%] left-0 right-0 text-center text-white text-[17px] font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {heroCaption}
          </span>
        )}
      </div>

      {/* ── Bottom tagline ── */}
      <div className="absolute bottom-[2.6%] left-0 right-0 text-center z-10">
        <p className="text-[20px] font-medium text-white leading-tight">{taglineKn}</p>
      </div>
    </div>
  );
}
