import React from "react";
import { BANNER_UDYAMI_LOGO_URL, BANNER_KUTUMBA_LOGO_URL } from "../chartAssets.js";

// Colours measured from the printed reference header.
const BANNER_RED = "#A11117";
const BANNER_NAVY = "#1B2662";

/**
 * Ward header banner — red strip, Udyami Bharat logo (left), G-code badge +
 * ward pill + region (centre), Kutumba logo (right).
 */
export default function ChartHeaderBanner({
  code,
  wardName,
  region = "GBA EAST",
  hideCode = false,
}) {
  return (
    <div
      className="@container/banner w-full border-b border-hairline px-[4%] py-[0.8%] flex items-center justify-between gap-[1.5%]"
      style={{ backgroundColor: BANNER_RED }}
    >
      {/* Left: Udyami Bharat logo (transparent, white lettering) */}
      <img
        src={BANNER_UDYAMI_LOGO_URL}
        alt="Udyami Bharat"
        className="h-[7.6cqw] min-h-[26px] w-auto object-contain shrink-0"
      />

      {/* Center: G19 badge + ward pill */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="flex items-stretch w-full max-w-[38cqw]">
          {!hideCode && (
          <div
            className="relative z-10 text-white border border-white flex items-center justify-center shrink-0 font-display font-bold leading-none px-[1.4cqw] min-w-[7cqw] text-[max(11px,1.6cqw)]"
            style={{
              backgroundColor: BANNER_NAVY,
              clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)",
            }}
          >
            {code}
          </div>
          )}
          <div
            className={`flex-1 bg-white flex items-center justify-center px-[1.8cqw] py-[1cqw] min-w-0 ${hideCode ? "rounded-full" : "rounded-r-full -ml-[0.7cqw]"
              }`}
          >
            <p
              className="font-display font-bold tracking-tight truncate uppercase leading-none text-[max(10px,1.6cqw)]"
              style={{ color: BANNER_NAVY }}
            >
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

      {/* Right: Kutumba logo (transparent, white lettering) */}
      <img
        src={BANNER_KUTUMBA_LOGO_URL}
        alt="Kutumba"
        className="h-[8.2cqw] min-h-[28px] w-auto object-contain shrink-0"
      />
    </div>
  );
}
