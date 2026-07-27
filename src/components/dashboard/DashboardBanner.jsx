import React from "react";

export default function DashboardBanner({ status = "Live", location, title, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1B2430] px-7 py-6">
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#B5730B]" />

      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#E8B768] uppercase mb-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B5730B] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#B5730B]" />
            </span>
            {status} · {location}
          </p>
          <h1 className="font-display text-[30px] leading-tight text-white mb-1.5">{title}</h1>
          <p className="text-[13.5px] text-white/50 max-w-md">{subtitle}</p>
        </div>

        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/35 mb-1">Updated</p>
          <p className="text-[13px] font-medium text-[#E8B768]">Just now</p>
        </div>
      </div>
    </div>
  );
}