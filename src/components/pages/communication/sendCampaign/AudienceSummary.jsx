import React from "react";
import { Users, CheckCircle2, Ban, PhoneOff, Coins } from "lucide-react";

export default function AudienceSummary({ summary, isResolved = false }) {
  if (!isResolved) {
    return 
      // <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      //   <p className="text-[13px] font-semibold text-gray-400 text-center py-4">
      //     Set filters above and click <span className="text-blue-600">Resolve Audience</span> to see a summary.
      //   </p>
      // </div>
    
  }

  const stats = [
    {
      icon: Users,
      label: "Estimated Reach",
      value: summary.estimatedReach.toLocaleString(),
      valueClass: "text-gray-800",
      bgClass: "bg-blue-50",
      iconClass: "text-blue-500",
    },
    {
      icon: CheckCircle2,
      label: "Eligible",
      value: summary.eligible.toLocaleString(),
      valueClass: "text-green-600",
      bgClass: "bg-green-50",
      iconClass: "text-green-500",
    },
    {
      icon: Ban,
      label: "DND Excluded",
      value: summary.dndExcluded.toLocaleString(),
      valueClass: "text-amber-600",
      bgClass: "bg-amber-50",
      iconClass: "text-amber-500",
    },
    {
      icon: PhoneOff,
      label: "Invalid Mobile",
      value: summary.invalidMobile.toLocaleString(),
      valueClass: "text-red-500",
      bgClass: "bg-red-50",
      iconClass: "text-red-400",
    },
    {
      icon: Coins,
      label: "Est. Credits",
      value: summary.estimatedCredits.toLocaleString(),
      valueClass: "text-purple-600",
      bgClass: "bg-purple-50",
      iconClass: "text-purple-500",
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <h3 className="text-[13.5px] font-bold text-gray-700 mb-4">Audience Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center rounded-xl p-3 ${stat.bgClass}`}
          >
            <stat.icon size={16} className={`${stat.iconClass} mb-1.5`} />
            <p className={`text-[18px] font-bold leading-none ${stat.valueClass}`}>{stat.value}</p>
            <p className="text-[11px] font-medium text-gray-500 mt-1 text-center">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown bar */}
      <div className="mt-4">
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${(summary.eligible / summary.estimatedReach) * 100}%` }}
            className="bg-green-500"
          />
          <div
            style={{ width: `${(summary.dndExcluded / summary.estimatedReach) * 100}%` }}
            className="bg-amber-400"
          />
          <div
            style={{ width: `${(summary.invalidMobile / summary.estimatedReach) * 100}%` }}
            className="bg-red-400"
          />
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { color: "bg-green-500", label: "Eligible" },
            { color: "bg-amber-400", label: "DND" },
            { color: "bg-red-400",   label: "Invalid" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
