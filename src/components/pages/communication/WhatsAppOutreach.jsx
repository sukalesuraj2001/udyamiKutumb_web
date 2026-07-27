import React, { useState } from "react";
import {
  Send, MessageCircle, CheckCircle2, Plus, Search,
  MessageSquareOff, ChevronDown, ChevronUp,
} from "lucide-react";

const STATS = { activeBroadcasts: 4, openConversations: 23, templatesApproved: 12 };
const CONVERSATIONS = [];
const SEGMENTS  = ["All members", "Active members", "At-risk members"];
const TEMPLATES = ["Diwali greeting", "Membership renewal reminder", "Event invite"];

// Shared input / select class
const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
  "text-gray-800 placeholder:text-gray-400 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function WhatsAppOutreach() {
  const [showBroadcastGroups, setShowBroadcastGroups] = useState(true);
  const [search,        setSearch]        = useState("");
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [broadcastName, setBroadcastName] = useState("");
  const [segment,       setSegment]       = useState("");
  const [template,      setTemplate]      = useState("");
  const [scheduleDate,  setScheduleDate]  = useState("");
  const [scheduleTime,  setScheduleTime]  = useState("");

  const handleSendBroadcast = () => {
    console.log({ broadcastName, segment, template, scheduleDate, scheduleTime });
  };

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Broadcasts"   value={STATS.activeBroadcasts}   icon={Send}         color="blue"  />
        <StatCard label="Open Conversations"  value={STATS.openConversations}  icon={MessageCircle} color="green" />
        <StatCard label="Templates Approved"  value={STATS.templatesApproved}  icon={CheckCircle2}  color="violet"/>
      </div>

      {/* ── Conversations panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] bg-white border border-gray-200
                      rounded-2xl shadow-sm overflow-hidden min-h-[420px]">

        {/* Left: conversation list */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-100 p-4 space-y-3">

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                             text-[13.5px] font-semibold py-2.5 rounded-xl
                             hover:bg-blue-700 active:scale-[0.98]
                             transition-all shadow-sm shadow-blue-200">
            <Plus size={16} /> New Broadcast
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Conversation list */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {CONVERSATIONS.length === 0 ? (
              <p className="text-[12.5px] text-gray-400 text-center py-8">
                No conversations yet.
              </p>
            ) : (
              CONVERSATIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvo(c)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                    selectedConvo?.id === c.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{c.name}</p>
                    <span className="text-[10.5px] text-gray-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 truncate mt-0.5">{c.lastMessage}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: empty / active state */}
        <div className="flex flex-col items-center justify-center p-10">
          {selectedConvo ? (
            <p className="text-[13.5px] text-gray-800">{selectedConvo.name}</p>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquareOff size={22} className="text-gray-400" />
              </div>
              <p className="text-[14px] font-bold text-gray-800 mb-1">Select a conversation</p>
              <p className="text-[13px] text-gray-400">
                Choose a chat from the left, or start a new broadcast.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Broadcast & Groups collapsible ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Accordion header */}
        <button
          onClick={() => setShowBroadcastGroups((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4
                     hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-[17px] font-bold text-gray-800">Broadcast &amp; Groups</h2>
          {showBroadcastGroups
            ? <ChevronUp   size={18} className="text-gray-400" />
            : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {showBroadcastGroups && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6 border-t border-gray-100">

            {/* Broadcast Creator */}
            <div className="border border-gray-200 rounded-2xl p-5 mt-6">
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">Broadcast Creator</h3>

              <input
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                placeholder="Broadcast Name"
                className={`${inputCls} mb-3`}
              />
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className={`${inputCls} mb-3`}
              >
                <option value="">Segment</option>
                {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className={`${inputCls} mb-3`}
              >
                <option value="">Template</option>
                {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className={inputCls} />
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={inputCls} />
              </div>

              <button
                onClick={handleSendBroadcast}
                disabled={!broadcastName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                           text-[13.5px] font-semibold py-2.5 rounded-xl
                           hover:bg-blue-700 active:scale-[0.98]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all shadow-sm shadow-blue-200"
              >
                <Send size={15} /> Send Broadcast
              </button>
            </div>

            {/* WhatsApp Group Creator */}
            <div className="border border-gray-200 rounded-2xl p-5 mt-6">
              <h3 className="text-[14px] font-bold text-gray-800 mb-4">WhatsApp Group Creator</h3>
              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                                 text-[13.5px] font-semibold py-2.5 rounded-xl
                                 hover:bg-blue-700 active:scale-[0.98]
                                 transition-all shadow-sm shadow-blue-200">
                <Plus size={16} /> Create Ward Group
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:   { icon: "bg-blue-600",   value: "text-blue-600"   },
  green:  { icon: "bg-green-500",  value: "text-green-600"  },
  violet: { icon: "bg-violet-500", value: "text-violet-600" },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
          {label}
        </p>
        <p className={`text-[26px] font-bold leading-none tabular-nums ${c.value}`}>
          {value}
        </p>
      </div>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon size={17} color="white" />
      </span>
    </div>
  );
}