import React, { useMemo, useState } from "react";
import { Plus, Phone } from "lucide-react";
import IvrCampaignCard from "./IvrCampaignCard.jsx";
import NewCampaignPanel from "./NewCampaignPanel.jsx";

const STATUS_FILTERS = ["All", "Draft", "Scheduled", "Running", "Completed", "Paused"];

export default function IvrCampaignsTab({ campaigns, setCampaigns, onViewCampaign }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewPanel, setShowNewPanel] = useState(false);

  const counts = useMemo(() => {
    const c = { All: campaigns.length, Draft: 0, Scheduled: 0, Running: 0, Completed: 0, Paused: 0 };
    campaigns.forEach((camp) => { c[camp.status] = (c[camp.status] || 0) + 1; });
    return c;
  }, [campaigns]);

  const filtered = statusFilter === "All"
    ? campaigns
    : campaigns.filter((c) => c.status === statusFilter);

  const handleCreateCampaign = (newCampaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
    setShowNewPanel(false);
  };

  return (
    <div>

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[19px] font-bold text-gray-800">IVR Campaigns</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">Manage outbound voice campaigns</p>
        </div>
        <button
          onClick={() => setShowNewPanel(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-[13.5px] font-semibold
                     px-4 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98]
                     transition-all shadow-sm shadow-blue-200"
        >
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
            <span
              className={`text-[11px] font-bold px-1.5 rounded-full ${
                statusFilter === s
                  ? "bg-white/25 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {counts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Phone size={22} className="text-blue-400" />
          </div>
          <p className="text-[15px] font-bold text-gray-800 mb-1">No campaigns yet</p>
          <p className="text-[13px] text-gray-400 mb-6">
            Create your first IVR campaign to get started.
          </p>
          <button
            onClick={() => setShowNewPanel(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-[13.5px] font-semibold
                       px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98]
                       transition-all shadow-sm shadow-blue-200"
          >
            <Plus size={16} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((c) => (
            <IvrCampaignCard key={c.id} campaign={c} onView={() => onViewCampaign(c)} />
          ))}
        </div>
      )}

      {showNewPanel && (
        <NewCampaignPanel onClose={() => setShowNewPanel(false)} onCreate={handleCreateCampaign} />
      )}

    </div>
  );
}