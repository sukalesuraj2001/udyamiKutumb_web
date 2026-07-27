import React, { useMemo, useState } from "react";
import { Play, Download, Phone, ChevronDown } from "lucide-react";

const STATUS_CLASS = {
  Scheduled: "bg-steel/10 text-steel",
  Running: "bg-forest/10 text-forest",
  Completed: "bg-ink/5 text-ink",
  Paused: "bg-amber-tint text-amber",
};

export default function RunDialerTab({ campaigns, setCampaigns, selectedCampaignId, onSelectCampaign }) {
  const [autoDial, setAutoDial] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(35);
  const [callLog, setCallLog] = useState([]); // { time, name, phone, status }

  // Draft campaigns can't be dialed yet — only show ones that are past draft
  const dialableCampaigns = useMemo(() => campaigns.filter((c) => c.status !== "Draft"), [campaigns]);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || dialableCampaigns[0];

  if (dialableCampaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-16 text-center">
        <Play size={32} className="mx-auto text-muted mb-4" />
        <p className="text-[15px] font-semibold text-ink mb-1">No campaigns ready to dial</p>
        <p className="text-[13px] text-muted">Create and schedule a campaign from the Campaigns tab first.</p>
      </div>
    );
  }

  if (!selectedCampaign) return null;

  const contacts = selectedCampaign.contactsList || [
    // fallback sample contact so the table isn't empty on freshly-created campaigns
    { id: "c1", name: "nikkk", phone: "+919588475709", ward: "—", status: "Pending", sid: "—", calledAt: "—" },
  ];

  const stats = {
    total: selectedCampaign.contacts ?? contacts.length,
    called: selectedCampaign.called ?? 0,
    connected: selectedCampaign.connected ?? 0,
    failed: selectedCampaign.failed ?? 0,
    pending: (selectedCampaign.contacts ?? contacts.length) - (selectedCampaign.called ?? 0),
  };

  const handleStartCampaign = () => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === selectedCampaign.id ? { ...c, status: "Running" } : c))
    );
  };

  const handleCallContact = (contact) => {
    // Replace with real IVR-trigger API call
    setCallLog((prev) => [
      { time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), name: contact.name, phone: contact.phone, status: "Calling" },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Campaign selector */}
      <div className="relative max-w-md">
        <select
          value={selectedCampaign.id}
          onChange={(e) => onSelectCampaign(e.target.value)}
          className="w-full appearance-none border border-hairline rounded-xl px-4 py-2.5 pr-9 text-[13.5px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          {dialableCampaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.status}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      </div>

      {/* Campaign header + progress */}
      <div className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="text-[18px] font-semibold text-ink mb-2">{selectedCampaign.name}</h2>
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASS[selectedCampaign.status] || STATUS_CLASS.Scheduled}`}>
            {selectedCampaign.status}
          </span>
          {selectedCampaign.purposeTag && (
            <span className="text-[11px] font-medium border border-hairline text-ink px-2 py-0.5 rounded-full">
              {selectedCampaign.purposeTag}
            </span>
          )}
        </div>

        <div className="h-2 rounded-full bg-hairline/60 overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-ink transition-all duration-500"
            style={{ width: `${stats.total ? Math.round((stats.called / stats.total) * 100) : 0}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <DialerStat label="Total" value={stats.total} tone="ink" />
          <DialerStat label="Called" value={stats.called} tone="steel" />
          <DialerStat label="Connected" value={stats.connected} tone="forest" />
          <DialerStat label="Failed" value={stats.failed} tone="brick" />
          <DialerStat label="Pending" value={stats.pending} tone="amber" />
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-hairline bg-white p-6">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleStartCampaign}
            className="flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-6 py-3 rounded-xl hover:bg-forest/90 transition-colors"
          >
            <Play size={16} /> Start Campaign
          </button>

          <button
            onClick={() => setAutoDial((v) => !v)}
            className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink"
          >
            <span className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${autoDial ? "bg-ink" : "bg-hairline"}`}>
              <span
                className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                  autoDial ? "translate-x-[22px]" : "translate-x-[3px]"
                }`}
              />
            </span>
            Auto-dial ({delaySeconds}s between calls)
          </button>
        </div>

        <div className="mt-6">
          <p className="text-[13px] text-muted mb-2">Delay between calls: {delaySeconds}s</p>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
            className="w-full accent-ink"
          />
        </div>
      </div>

      {/* Contacts table */}
      <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
        <h3 className="text-[15px] font-semibold text-ink px-6 pt-5 pb-4">Contacts ({contacts.length})</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-t border-b border-hairline">
              {["#", "Name", "Phone", "Ward", "Status", "SID", "Called At", "Action"].map((h) => (
                <th key={h} className="px-6 py-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={c.id} className="border-b border-hairline last:border-0">
                <td className="px-6 py-3.5 text-[13px] text-muted">{i + 1}</td>
                <td className="px-6 py-3.5 text-[13.5px] font-medium text-ink">{c.name}</td>
                <td className="px-6 py-3.5 text-[13px] text-ink">{c.phone}</td>
                <td className="px-6 py-3.5 text-[13px] text-muted">{c.ward}</td>
                <td className="px-6 py-3.5">
                  <span className="text-[11px] font-semibold border border-hairline text-amber px-2 py-0.5 rounded-full">
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-[13px] text-muted">{c.sid}</td>
                <td className="px-6 py-3.5 text-[13px] text-muted">{c.calledAt}</td>
                <td className="px-6 py-3.5">
                  <button
                    onClick={() => handleCallContact(c)}
                    className="w-8 h-8 rounded-lg border border-hairline flex items-center justify-center hover:bg-ink/5 transition-colors"
                  >
                    <Phone size={14} className="text-ink" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live call log */}
      <div className="rounded-2xl border border-hairline bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="text-[15px] font-semibold text-ink">Live Call Log</h3>
          <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink border border-hairline px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors">
            <Download size={14} /> Export Log CSV
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-t border-b border-hairline">
              {["Time", "Name", "Phone", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {callLog.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-[13px] text-muted">
                  No call events yet.
                </td>
              </tr>
            ) : (
              callLog.map((row, i) => (
                <tr key={i} className="border-b border-hairline last:border-0">
                  <td className="px-6 py-3.5 text-[13px] text-muted">{row.time}</td>
                  <td className="px-6 py-3.5 text-[13.5px] font-medium text-ink">{row.name}</td>
                  <td className="px-6 py-3.5 text-[13px] text-ink">{row.phone}</td>
                  <td className="px-6 py-3.5">
                    <span className="text-[11px] font-semibold bg-amber-tint text-amber px-2 py-0.5 rounded-full">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DialerStat({ label, value, tone }) {
  const toneClass = { ink: "text-ink", steel: "text-steel", forest: "text-forest", brick: "text-brick", amber: "text-amber" }[tone];
  return (
    <div>
      <p className="text-[12px] text-muted mb-1">{label}</p>
      <p className={`text-[20px] font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}