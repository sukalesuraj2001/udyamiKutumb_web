import React from "react";
import { TYPE_BADGE_CLASS, TYPE_LABEL } from "./TEMPLATE_LIBRARY.js";

// ── Status badge classes — dashboard theme ───────────────────────────────────
const STATUS_CLASS = {
  Sent:      "bg-green-50 text-green-600",
  Scheduled: "bg-blue-50 text-blue-600",
  Failed:    "bg-red-50 text-red-500",
};

export const SAMPLE_RECENT_CAMPAIGNS = [
  { name: "Diwali Business Boost SMS",  type: "sms",      sentDate: "12 Nov 2025", audience: 1840, delivered: 97, opened: 64, clicked: 28, status: "Sent"      },
  { name: "Ward 14 Meeting Reminder",   type: "whatsapp", sentDate: "08 Nov 2025", audience: 312,  delivered: 99, opened: 88, clicked: 41, status: "Sent"      },
  { name: "Prime Plan Renewal Drive",   type: "email",    sentDate: "05 Nov 2025", audience: 920,  delivered: 95, opened: 52, clicked: 18, status: "Sent"      },
  { name: "GST Filing Tips November",   type: "email",    sentDate: "02 Nov 2025", audience: 1240, delivered: 96, opened: 47, clicked: 12, status: "Sent"      },
  { name: "Shivajinagar Bazaar Invite", type: "whatsapp", sentDate: "28 Oct 2025", audience: 458,  delivered: 98, opened: 82, clicked: 36, status: "Sent"      },
  { name: "New Year Members Drive",     type: "sms",      sentDate: "01 Jan 2026", audience: 2100, delivered: null, opened: null, clicked: null, status: "Scheduled" },
  { name: "Monthly Newsletter Dec",     type: "email",    sentDate: "30 Nov 2025", audience: 1340, delivered: null, opened: null, clicked: null, status: "Scheduled" },
  { name: "Karve Nagar Lead Push",      type: "sms",      sentDate: "20 Oct 2025", audience: 412,  delivered: null, opened: null, clicked: null, status: "Failed"    },
];

const HEADERS = ["Campaign Name", "Type", "Sent Date", "Audience", "Delivered %", "Opened %", "Clicked %", "Status"];

export default function RecentCampaigns({ campaigns = SAMPLE_RECENT_CAMPAIGNS }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <h2 className="text-[17px] font-bold text-gray-800">Recent Campaigns</h2>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-[13px] text-gray-400 text-center py-12">
          No campaigns sent yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-6 py-3.5 text-[13.5px] font-semibold text-gray-800 whitespace-nowrap">
                    {c.name}
                  </td>

                  {/* Type badge */}
                  <td className="px-6 py-3.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE_CLASS[c.type]}`}>
                      {TYPE_LABEL[c.type]}
                    </span>
                  </td>

                  {/* Sent date */}
                  <td className="px-6 py-3.5 text-[13px] text-gray-400 whitespace-nowrap">
                    {c.sentDate}
                  </td>

                  {/* Audience */}
                  <td className="px-6 py-3.5 text-[13px] text-gray-800 tabular-nums">
                    {c.audience.toLocaleString()}
                  </td>

                  {/* Delivered / Opened / Clicked */}
                  <td className="px-6 py-3.5 text-[13px] text-green-600 font-medium tabular-nums">
                    {c.delivered != null ? `${c.delivered}%` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-blue-600 font-medium tabular-nums">
                    {c.opened != null ? `${c.opened}%` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-violet-600 font-medium tabular-nums">
                    {c.clicked != null ? `${c.clicked}%` : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}