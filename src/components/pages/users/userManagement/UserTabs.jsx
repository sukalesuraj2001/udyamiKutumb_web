import React from "react";
import { Users, CreditCard, Activity } from "lucide-react";

/**
 * UserTabs
 *
 * Props:
 *  activeTab   string              – currently active tab key
 *  totalUsers  number              – used in the Users tab label
 *  onChange    function(tabKey)    – called when a tab is clicked
 */
export default function UserTabs({ activeTab, totalUsers, onChange }) {
  const TABS = [
    { key: "users",    label: `Users (${totalUsers})`, icon: Users },
    { key: "payments", label: "Payment Approvals",      icon: CreditCard },
    { key: "activity", label: "Activity Log",           icon: Activity },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12.5px] font-semibold transition-all ${
            activeTab === key
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}