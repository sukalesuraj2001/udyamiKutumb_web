import React, { useRef } from "react";
import {
  UDYAMI_LOGO_URL,
  KUTUMBA_LOGO_URL,
  HERO_IMAGE_URL,
  MAHADEVAPURA_WARDS,
} from "../chartAssets.js";

export default function CoverPage({
  code = "",
  regionName = "",
  wardList = MAHADEVAPURA_WARDS,
  extraCount = 14,
  heroImageUrl = HERO_IMAGE_URL,
  heroCaption = "",
  taglineKn = "ಒಂದು ಮನೆ. ಒಂದು ಉದ್ಯಮ. ಒಂದು ಶಕ್ತಿಶಾಲಿ ರಾಷ್ಟ್ರ.",
  onHeroImageSelect,
  showHeroUpload = false,
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

  const columns = [];

  return (
    /*
     * FIX: was `min-h-full` → now `h-full`.
     *
     * ChartPreviewFrame's content div always has an explicit pixel height
     * (BASE_H or BASE_H / contentScale).  For a child to fill that space with
     * `h-full`, the parent must propagate the height — `min-h-full` only
     * works when the parent already has a *resolved* height, which `height:auto`
     * doesn't provide.  Using `h-full` here (= 100% of ChartPreviewFrame's
     * content div height) ensures `absolute` children (the hero circle, the
     * decorative bands, the tagline strip) can position themselves against the
     * full A4 canvas without being clipped.
     */
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

      {/* ── Header row ── */}
      <div className="flex items-start justify-between px-[5.3%] pt-[3.5%]">
        <div className="flex items-start gap-[2.5%]">
          <img
            src={UDYAMI_LOGO_URL}
            alt="Udyami Bharat"
            className="w-[9.5%] min-w-[52px] h-auto object-contain shrink-0"
          />
          <div>
            <p className="text-[6.5px] font-semibold text-steel bg-steel/15 inline-block px-1.5 py-[2px] rounded-sm leading-none">
              One Home. One Enterprise. One Strong Nation
            </p>
            <p className="text-[23.6px] font-extrabold text-ink leading-[1.05] mt-1 tracking-tight">
              UDYAMI BHARAT
            </p>
            <p className="text-[20px] font-semibold text-brick leading-[1.1] mt-0.5">
              ಉದ್ಯಮಿ ಭಾರತ
            </p>
          </div>
        </div>
        <img
          src={KUTUMBA_LOGO_URL}
          alt="Kutumba"
          className="w-[11%] min-w-[62px] h-auto object-contain shrink-0"
        />
      </div>

      {/* ── Title ── */}
      <div className="px-[6.9%] mt-[4%]">
        <h1 className="text-[30px] font-extrabold text-brick tracking-tight leading-none truncate max-w-full">
          {code} {regionName?.toUpperCase()}
        </h1>
      </div>

      {/* ── Ward list ── */}
      <div className="px-[5.3%] mt-[3%] grid grid-cols-3 gap-x-[8%]">
        {columns.map((col, ci) => (
          <div key={ci} className="space-y-[3px]">
            {col.map((w) => (
              <div key={w.code} className="flex items-baseline justify-between gap-1">
                <p className="text-[10.9px] text-ink leading-[1.25]">
                  FC UB {w.code} {w.name}
                </p>
                <span className="text-[10.9px] font-bold text-brick shrink-0 tabular-nums">
                  {w.count}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Hero circle ── */}
      {/*
       * FIX: no positioning change needed here — the circle was always correct.
       * The real problem was the parent didn't have a resolved height, so
       * `top-[32%]` computed to 32% of 0 = 0px and the element stacked at
       * the top and then got clipped.  With `h-full` on the parent the
       * percentage resolves correctly against the full A4 height.
       */}
      <div
        onClick={handleCircleClick}
        className={`absolute left-1/2 -translate-x-1/2 top-[32%] w-[42%] aspect-square
          rounded-full border-[6px] border-white
          shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden bg-paper
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
          <span className="absolute bottom-[8%] left-0 right-0 text-center text-white text-[15px] font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {heroCaption}
          </span>
        )}
      </div>

      {/* ── Decorative red curves ── */}
      <div className="absolute bottom-[9%] left-0 w-[0%] h-[38%] pointer-events-none overflow-hidden">
        <div className="absolute -bottom-[20%] -left-[25%] w-[130%] h-[55%] bg-brick rounded-[100%] rotate-[-8deg]" />
        <div className="absolute bottom-[8%] -left-[18%] w-[115%] h-[48%] bg-brick rounded-[100%] rotate-[-5deg] opacity-95" />
        <div className="absolute bottom-[18%] -left-[8%] w-[100%] h-[40%] bg-brick rounded-[100%] rotate-[-2deg] opacity-90" />
      </div>

      {/* ── Navy diagonal band ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[9.5%] bg-ink"
        style={{ clipPath: "polygon(0 35%, 100% 0%, 100% 100%, 0% 100%)" }}
      />

      {/* ── Bottom tagline ── */}
      <div className="absolute bottom-[2.2%] left-0 right-0 text-center z-10">
        <p className="text-[20px] font-medium text-white leading-tight">{taglineKn}</p>
      </div>
    </div>
  );
}