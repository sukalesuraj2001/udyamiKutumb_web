import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Share2, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice.js";
import ModuleSettings from "../businessCircle/admin/ModuleSettings.jsx";
import Scoring from "../businessCircle/admin/Scoring.jsx";
import Taxonomy from "../businessCircle/admin/Taxonomy.jsx";
import RolesAccess from "../businessCircle/admin/RolesAccess.jsx";


const TABS_BY_ROLE = {
  TalukHead: [
    { to: "overview", label: "Overview" },
    { to: "circles", label: "Circles" },
    { to: "spin-off", label: "Spin off" },
    { to: "reports", label: "Reports" },
  ],
  DistrictHead: [
    { to: "overview", label: "Overview" },
    { to: "circles", label: "Circles" },
    { to: "spin-off", label: "Spin off" },
    { to: "reports", label: "Reports" },
  ],
  SuperAdmin: [
    { to: "module-settings", label: "Module settings" },
    { to: "scoring", label: "Scoring" },
    { to: "taxonomy", label: "Taxonomy" },
    { to: "roles-access", label: "Roles & access" },
    { to: "uc-training", label: "UC Training" },
  ],
  // fallback — all tabs for other roles (Member, Admin, etc.)
  default: [
    { to: "circle-network", label: "Circle Network" },
    { to: "overview", label: "Overview" },
    { to: "circles", label: "Circles" },
    { to: "meetings", label: "Meetings" },
    { to: "business-leads", label: "Business Leads" },
    { to: "face-to-face", label: "Face to Face" },
    { to: "directory", label: "Directory" },
    { to: "guests", label: "Guests" },
    { to: "pitches", label: "Pitches" },
    { to: "business-groups", label: "Business Groups" },
    { to: "leaderboard", label: "Leaderboard" },
    { to: "closed-business", label: "Closed Business" },
    { to: "gratitude-wall", label: "Gratitude Wall" },
    { to: "member-reviews", label: "Member Reviews" },
    { to: "knowledge-sessions", label: "Knowledge Sessions" },
    { to: "network", label: "Network" },
    { to: "treasury", label: "Treasury" },
    { to: "positions", label: "Positions" },
    { to: "reminders", label: "Reminders" },
  ],
};

const CIRCLE_OPTIONS = ["All circles"];

export default function BusinessCircleLayout() {
  const user = useSelector(selectUser);
  const role = user?.role;
  const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.default;

  return (
    <div className="space-y-5 bg-[#F7F8FA] -m-8 p-8 min-h-screen">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Share2 size={20} className="text-[#3B5BDB]" />
          </span>
          <div>
            <h1 className="text-[22px] font-semibold text-[#111827] leading-tight">
              Business Circle
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Circles · leads · meetings · networking growth
            </p>
          </div>
        </div>

        <div className="relative">
          <select className="appearance-none border border-[#E5E7EB] rounded-[10px] pl-4 pr-9 py-2 text-[13.5px] font-medium text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/20 cursor-pointer">
            {CIRCLE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex flex-wrap items-center gap-1 bg-white border border-[#E5E7EB] rounded-2xl p-1.5">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `text-[12.5px] font-medium px-3.5 py-[7px] rounded-[9px] transition-colors whitespace-nowrap ${isActive
                ? "bg-[#3B5BDB] text-white font-semibold"
                : "text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#3B5BDB]"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Active tab page */}
      <Outlet />
    </div>
  );
}