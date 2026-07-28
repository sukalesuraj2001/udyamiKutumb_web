import React from "react";

export default function RecentCampaigns({ campaigns = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-[17px] font-bold text-gray-800">Recent Campaigns</h2>
      </div>

      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <p className="text-[13px] font-semibold text-gray-500">Campaign history coming soon</p>
        <p className="text-[12px] text-gray-400 text-center max-w-xs">
          Sent, scheduled, and failed campaigns will appear here once the backend is connected.
        </p>
      </div>

    </div>
  );
}