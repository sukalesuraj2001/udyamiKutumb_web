import React from "react";
import { Share2, Users, Send, IndianRupee, TrendingUp, AlertTriangle } from "lucide-react";
import StatCard from "../businessCircle/StatCard.jsx";
import CircleHealthLeaderboard from "../businessCircle/CircleHealthLeaderboard.jsx";
import AlertsPanel from "../businessCircle/AlertsPanel.jsx";
import MemberGrowthChart from "../businessCircle/MemberGrowthChart.jsx";
import LeadsBusinessChart from "../businessCircle/LeadsBusinessChart.jsx";
import LeadFunnelChart from "../businessCircle/LeadFunnelChart.jsx";
import ManagementActions from "../businessCircle/ManagementActions.jsx";

const STATS = {
  totalCircles: 6,
  totalMembers: 17,
  leadsThisMonth: 0,
  ytdBusiness: 50000,
  leadsPushed: 0,
  conversionRate: 2.9,
  memberGrowth: -100,
  circlesAtRisk: 6,
};

export default function CircleNetwork() {
  const handleExportCircles = () => console.log("Export all circles (Excel)");
  const handleExportMembers = () => console.log("Export member list (Excel)");
  const handleSendAnnouncement = () => console.log("Open send-announcement flow");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[18px] font-semibold text-[#111827]">
          <Share2 size={18} className="text-[#3B5BDB]" /> Circle Network — Platform Overview
        </h2>
        <p className="text-[12.5px] text-[#6B7280]">Updated just now</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total circles" value={STATS.totalCircles} icon={Share2} tone="blue" />
        <StatCard label="Total members" value={STATS.totalMembers} icon={Users} tone="blue" />
        <StatCard label="Leads (mo)" value={STATS.leadsThisMonth} icon={Send} tone="blue" />
        <StatCard label="YTD business" value={`₹${STATS.ytdBusiness.toLocaleString("en-IN")}`} icon={IndianRupee} tone="blue" />

        <StatCard label="Leads pushed" value={STATS.leadsPushed} icon={Send} tone="blue" />
        <StatCard label="Conversion rate" value={`${STATS.conversionRate}%`} icon={TrendingUp} tone="blue" />
        <StatCard
          label="Member growth"
          value={`${STATS.memberGrowth}%`}
          icon={TrendingUp}
          tone="blue"
          valueTone={STATS.memberGrowth < 0 ? "red" : "green"}
        />
        <StatCard label="Circles at risk" value={STATS.circlesAtRisk} icon={AlertTriangle} tone="red" valueTone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start min-w-0">
        <CircleHealthLeaderboard />
        <AlertsPanel onTakeAction={(a) => console.log("Take action:", a)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <MemberGrowthChart />
        <LeadsBusinessChart />
      </div>

      {/* <LeadFunnelChart /> */}

      <ManagementActions
        onExportCircles={handleExportCircles}
        onExportMembers={handleExportMembers}
        onSendAnnouncement={handleSendAnnouncement}
      />
    </div>
  );
}