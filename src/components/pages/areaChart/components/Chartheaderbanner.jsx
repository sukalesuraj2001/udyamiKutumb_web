import React from "react";
import { UDYAMI_LOGO_URL, KUTUMBA_LOGO_URL } from "../chartAssets.js";

/**
 * Ward header banner — proportions measured from the G19 Mahadevapura chart
 * reference (~1000×82px header strip). Colours match the chart body (brick + ink).
 */
export default function ChartHeaderBanner({
  code,
  wardName,
  region = "GBA EAST",
  taglineEn = "One Home. One Enterprise. One Strong Nation",
  taglineKn = "ಉದ್ಯಮಿ ಭಾರತ",
}) {
  return (
    <div className="@container/banner w-full bg-brick border-b border-hairline px-[4%] py-[1.2%] flex items-center justify-between gap-[1.5%]">
      {/* Left: logo + wordmark — UDYAMI BHARAT → tagline bar → Kannada */}
      <div className="flex items-center gap-[1.2%] shrink-0 min-w-0 max-w-[30%]">
        <img
          src={UDYAMI_LOGO_URL}
          alt="Udyami Bharat"
          className="w-[5cqw] min-w-[36px] aspect-square object-contain shrink-0"
        />
        <div className="min-w-0 leading-none">
          <p className="text-[max(12px,1.4cqw)] font-extrabold text-white tracking-tight uppercase whitespace-nowrap">
            UDYAMI BHARAT
          </p>
          <p
            className="mt-[0.25cqw] inline-block text-[max(4.5px,0.52cqw)] font-semibold text-white leading-none uppercase whitespace-nowrap px-[0.4cqw] py-[0.15cqw] rounded-[0.1cqw]"
            style={{ backgroundColor: "#4FC3F7" }}
          >
            {taglineEn}
          </p>
          <p className="mt-[0.2cqw] text-[max(11px,1.15cqw)] font-semibold text-white leading-tight">
            {taglineKn}
          </p>
        </div>
      </div>

      {/* Center: G19 badge + ward pill */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="flex items-stretch w-full max-w-[32cqw]">
          <div
            className="relative z-10 bg-ink text-white border border-white flex items-center justify-center shrink-0 font-display font-bold leading-none px-[1.4cqw] min-w-[6.5cqw] text-[max(11px,1.35cqw)]"
            style={{ clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)" }}
          >
            {code}
          </div>
          <div className="flex-1 bg-white flex items-center justify-center px-[1.8cqw] py-[0.75cqw] rounded-r-full -ml-[0.7cqw] min-w-0">
            <p className="text-ink font-display font-bold tracking-tight truncate uppercase leading-none text-[max(10px,1.25cqw)]">
              {wardName}
            </p>
          </div>
        </div>
        {region && (
          <p className="mt-[0.35cqw] text-[max(7px,0.75cqw)] font-semibold text-white tracking-[0.08em] uppercase leading-none text-center">
            {region}
          </p>
        )}
      </div>

      {/* Right: Kutumba logo */}
      <img
        src={KUTUMBA_LOGO_URL}
        alt="Kutumba"
        className="w-[5.5cqw] min-w-[10px] h-auto object-contain shrink-0"
      />
    </div>
  );
}
