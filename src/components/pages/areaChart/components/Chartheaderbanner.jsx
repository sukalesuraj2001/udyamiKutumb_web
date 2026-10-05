import React from "react";
import { UDYAMI_BHARAT_LOCKUP_URL, KUTUMBA_LOGO_URL } from "../chartAssets.js";

/**
 * Ward header banner — proportions measured from the G19 Mahadevapura chart
 * reference (~1000×82px header strip). Colours match the chart body (brick + ink).
 */
export default function ChartHeaderBanner({
  code,
  wardName,
  region = "GBA EAST",
  hideCode = false,
}) {
  return (
    <div className="@container/banner w-full bg-brick border-b border-hairline px-[4%] py-[1.2%] flex items-center justify-between gap-[1.5%]">
      {/* Left: Udyami Bharat logo lockup (mark + wordmark + tagline + Kannada),
          cropped from its padded PNG and shown on a white rounded plate */}
      <div
        className="relative shrink-0 bg-white rounded-[0.6cqw] overflow-hidden w-[20cqw] min-w-[120px]"
        style={{ aspectRatio: "2.937 / 1" }}
      >
        <img
          src={UDYAMI_BHARAT_LOCKUP_URL}
          alt="Udyami Bharat"
          className="absolute max-w-none"
          style={{ width: "143.4%", left: "-21.5%", top: "-27.4%" }}
        />
      </div>

      {/* Center: G19 badge + ward pill */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="flex items-stretch w-full max-w-[32cqw]">
          {!hideCode && (
          <div
            className="relative z-10 bg-ink text-white border border-white flex items-center justify-center shrink-0 font-display font-bold leading-none px-[1.4cqw] min-w-[6.5cqw] text-[max(11px,1.35cqw)]"
            style={{ clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)" }}
          >
            {code}
          </div>
          )}
          <div
            className={`flex-1 bg-white flex items-center justify-center px-[1.8cqw] py-[0.75cqw] min-w-0 ${hideCode ? "rounded-full" : "rounded-r-full -ml-[0.7cqw]"
              }`}
          >
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
