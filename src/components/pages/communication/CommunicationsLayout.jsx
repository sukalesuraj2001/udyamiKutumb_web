import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Send, BarChart3, MessageSquare, Phone,
  MessagesSquare, Sparkles, Bot, WalletCards, Inbox,
} from "lucide-react";

import { selectPendingCount } from "../../redux/slices/sendMessageSlice";
import { selectUser } from "../../redux/slices/authSlice";

const TABS = [
  { to: "send-campaign", label: "Send Campaign", icon: Send },
  { to: "analytics", label: "Analytics", icon: BarChart3 },
  { to: "bulk-sms-email", label: "Bulk SMS / Email", icon: MessageSquare },
  { to: "auto-dialer", label: "Auto Dialer", icon: Phone },
  { to: "whatsapp-outreach", label: "WhatsApp Outreach", icon: MessagesSquare },
  { to: "ai-ivr-calling", label: "AI IVR Calling", icon: Sparkles },
  { to: "whatsapp-ai-chatbot", label: "WhatsApp AI Chatbot", icon: Bot },
  { to: "credits", label: "Credits", icon: WalletCards }
];

export default function CommunicationsLayout() {
  const user = useSelector(selectUser);
  const pendingCount = useSelector(selectPendingCount);

  // Adjust the role string to match what your backend sends
  const isSuperAdmin = user?.role === "SuperAdmin";

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isSuperAdmin);

  return (
    <div className="min-h-full bg-slate-50 -m-6 p-6 space-y-5">

      {/* ── Header ── */}
      <div className="pb-1">
        <h1 className="text-[22px] font-bold text-gray-800 tracking-tight leading-tight">
          Communications
        </h1>
        <p className="text-[13px] text-gray-400 mt-0.5">
          Bulk messaging, auto-dialer, and WhatsApp outreach for your members.
        </p>
      </div>


      {/* ── Tab nav ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-1.5 flex flex-wrap items-center gap-1.5">
        {visibleTabs.map((tab) => {
          const showBadge = tab.to === "comm-service-request" && pendingCount > 0;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold
                 whitespace-nowrap transition-all duration-150
                 ${isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`
              }
            >
              <tab.icon size={14} strokeWidth={2.2} />
              {tab.label}

              {showBadge && (
                <span className="ml-0.5 bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full leading-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      


      {/* ── Page content ── */}
      <div>
        <Outlet />
      </div>

    </div>
  );
}