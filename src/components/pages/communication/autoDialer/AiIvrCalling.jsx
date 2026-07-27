import React, { useState } from "react";
import { FileText, Play } from "lucide-react";
import IvrCampaignsTab from "./IvrCampaignsTab.jsx";
import RunDialerTab from "./RunDialerTab.jsx";

const TABS = [
  { key: "campaigns", label: "Campaigns",  icon: FileText },
  { key: "dialer",    label: "Run Dialer", icon: Play     },
];

export default function AiIvrCalling() {
  const [subTab,             setSubTab]             = useState("campaigns");
  const [campaigns,          setCampaigns]          = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const handleViewCampaign = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setSubTab("dialer");
  };

  return (
    <div className="space-y-6">

      {/* Sub-tabs */}
      <div className="inline-flex rounded-xl border border-gray-200 bg-white shadow-sm p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              subTab === key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {subTab === "campaigns" ? (
        <IvrCampaignsTab
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          onViewCampaign={handleViewCampaign}
        />
      ) : (
        <RunDialerTab
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          selectedCampaignId={selectedCampaignId}
          onSelectCampaign={setSelectedCampaignId}
        />
      )}

    </div>
  );
}