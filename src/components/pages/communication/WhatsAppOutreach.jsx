import React from "react";
import { Send, MessageCircle, CheckCircle2, MessageSquareOff } from "lucide-react";

const STAT_CARDS = [
  { label: "Active Broadcasts",  icon: Send,          color: "blue"   },
  { label: "Open Conversations", icon: MessageCircle, color: "green"  },
  { label: "Templates Approved", icon: CheckCircle2,  color: "violet" },
];

const COLOR_MAP = {
  blue:   { icon: "bg-blue-100",   value: "text-blue-200"   },
  green:  { icon: "bg-green-100",  value: "text-green-200"  },
  violet: { icon: "bg-violet-100", value: "text-violet-200" },
};

export default function WhatsAppOutreach() {
  return (
    <div className="space-y-6">

      {/* ── Stat cards — Coming Soon ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, icon: Icon, color }) => {
          const c = COLOR_MAP[color];
          return (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-[10.5px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
                  {label}
                </p>
                <p className="text-[22px] font-bold leading-none tabular-nums text-gray-200">
                  — —
                </p>
                <span className="inline-flex text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 mt-2">
                  Coming soon
                </span>
              </div>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                <Icon size={17} className={c.value} />
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Conversations panel — Coming Soon ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-700">Conversations</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Live data coming soon</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MessageSquareOff size={22} className="text-slate-300" />
          </div>
          <p className="text-[13px] font-semibold text-gray-500">WhatsApp conversations coming soon</p>
          <p className="text-[12px] text-gray-400 text-center max-w-xs">
            Live chats, broadcast history, and group management will appear here once the WhatsApp integration is connected.
          </p>
        </div>
      </div>

      {/* ── Broadcast & Groups — Coming Soon ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-700">Broadcast &amp; Groups</h2>
          <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
            Coming soon
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Send size={16} className="text-slate-300" />
          </div>
          <p className="text-[12.5px] font-medium text-slate-400">
            Broadcast creator and group management coming soon
          </p>
        </div>
      </div>

    </div>
  );
}