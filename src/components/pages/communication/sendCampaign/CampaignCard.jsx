import React, { useState } from "react";
import {
  MessageSquare, MessagesSquare, Phone, Mail,
  Eye, Copy, XCircle, BarChart3,
} from "lucide-react";

const CHANNEL_META = {
  sms:      { label: "SMS",      icon: MessageSquare,  cls: "text-blue-600 bg-blue-50"    },
  whatsapp: { label: "WA",       icon: MessagesSquare, cls: "text-green-600 bg-green-50"  },
  ivr:      { label: "IVR",      icon: Phone,          cls: "text-purple-600 bg-purple-50" },
  email:    { label: "Email",    icon: Mail,           cls: "text-amber-600 bg-amber-50"  },
};

const STATUS_META = {
  sent:      { label: "Sent",      cls: "bg-green-100 text-green-700"   },
  scheduled: { label: "Scheduled", cls: "bg-blue-100 text-blue-700"     },
  failed:    { label: "Failed",    cls: "bg-red-100 text-red-500"       },
  cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-500"     },
  draft:     { label: "Draft",     cls: "bg-yellow-100 text-yellow-700" },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function RecentCampaigns({
  campaigns = [],
  onView      = () => {},
  onDuplicate = () => {},
  onCancel    = () => {},
}) {
  const [confirmCancel, setConfirmCancel] = useState(null);

  if (!campaigns.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <BarChart3 size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] font-semibold text-gray-400">No campaigns yet</p>
        <p className="text-[12.5px] text-gray-300 mt-1">Campaigns you send will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-gray-800">Recent Campaigns</h2>
        <span className="text-[12px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {campaigns.length} total
        </span>
      </div>

      {/* Table — no scroll, columns compress to fit */}
      <table className="w-full text-left table-fixed">
        <colgroup>
          <col className="w-[30%]" />   {/* Campaign name */}
          <col className="w-[10%]" />   {/* Channel */}
          <col className="w-[13%]" />   {/* Status */}
          <col className="w-[17%]" />   {/* Scheduled */}
          <col className="w-[9%]"  />   {/* Audience */}
          <col className="w-[10%]" />   {/* Credits */}
          <col className="w-[11%]" />   {/* Actions */}
        </colgroup>

        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 text-[11.5px] font-semibold text-gray-500">Campaign</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500">Ch.</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500">Status</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500">Scheduled</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500">Reach</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500">Credits</th>
            <th className="px-2 py-3 text-[11.5px] font-semibold text-gray-500"></th>
          </tr>
        </thead>

        <tbody>
          {campaigns.map((c) => {
            const ch = CHANNEL_META[c.channel] || CHANNEL_META.sms;
            const st = STATUS_META[c.status]   || STATUS_META.draft;
            const ChannelIcon = ch.icon;

            return (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Campaign name + id */}
                <td className="px-4 py-3">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{c.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono truncate mt-0.5">{c.id}</p>
                </td>

                {/* Channel badge — icon only on small, icon+label on larger */}
                <td className="px-2 py-3">
                  <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-full ${ch.cls}`}>
                    <ChannelIcon size={11} />
                    <span className="hidden lg:inline">{ch.label}</span>
                  </span>
                </td>

                {/* Status */}
                <td className="px-2 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                  {c.deliveryRate != null && (
                    <p className="text-[10.5px] text-gray-400 mt-0.5">{c.deliveryRate}%</p>
                  )}
                </td>

                {/* Scheduled date */}
                <td className="px-2 py-3 text-[11.5px] text-gray-500 leading-tight">
                  {formatDate(c.scheduledAt)}
                </td>

                {/* Audience */}
                <td className="px-2 py-3 text-[12.5px] font-semibold text-gray-700">
                  {c.audienceCount.toLocaleString()}
                </td>

                {/* Credits */}
                <td className="px-2 py-3 text-[12.5px] font-semibold text-gray-700">
                  {c.creditsUsed > 0 ? `${c.creditsUsed.toLocaleString()}` : "—"}
                </td>

                {/* Actions */}
                <td className="px-2 py-3">
                  <ActionMenu
                    campaign={c}
                    onView={onView}
                    onDuplicate={onDuplicate}
                    onCancel={onCancel}
                    confirmCancel={confirmCancel}
                    setConfirmCancel={setConfirmCancel}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── ActionMenu ────────────────────────────────────────────────────────────────

function ActionMenu({ campaign, onView, onDuplicate, onCancel, confirmCancel, setConfirmCancel }) {
  if (confirmCancel === campaign.id) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10.5px] text-gray-500">Cancel?</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { onCancel(campaign.id); setConfirmCancel(null); }}
            className="text-[11px] font-semibold text-red-500 hover:text-red-700"
          >Yes</button>
          <button
            onClick={() => setConfirmCancel(null)}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
          >No</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <IconBtn icon={Eye}     title="View"      onClick={() => onView(campaign.id)}            />
      <IconBtn icon={Copy}    title="Duplicate" onClick={() => onDuplicate(campaign.id)}       />
      {campaign.status === "scheduled" && (
        <IconBtn icon={XCircle} title="Cancel"  onClick={() => setConfirmCancel(campaign.id)} danger />
      )}
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg border transition-colors ${
        danger
          ? "border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600"
          : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Icon size={12} />
    </button>
  );
}