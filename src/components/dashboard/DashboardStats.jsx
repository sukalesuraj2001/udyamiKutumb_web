import React from "react";
import { Users, UserCheck, IndianRupee, AlertTriangle, Activity, Sparkles, Share2 } from "lucide-react";
import StatCard from "./StartCard.jsx"; // fixed typo: was "./StartCard.jsx"

// Replace this with real data later, e.g.:
//   const { data: stats } = useSelector((s) => s.dashboard);
//   <DashboardStats stats={stats} />
export const SAMPLE_STATS = [
  { key: "totalLeads", label: "Total Leads", value: "19", icon: Users, badgeText: "↗ 1 this week", badgeTone: "good" },
  { key: "activeMembers", label: "Active Members", value: "23", icon: UserCheck, badgeText: "↗ 1 new this week", badgeTone: "good" },
  { key: "membershipRevenue", label: "Membership Revenue", value: "₹3,12,091", icon: IndianRupee, badgeText: "25 active plans", badgeTone: "good" },
  { key: "atRiskMembers", label: "At-Risk Members", value: "9", icon: AlertTriangle, badgeText: "⚠ next 30 days", badgeTone: "warn", highlight: true },
  { key: "leadEngagementRate", label: "Lead Engagement Rate", value: "47%", icon: Activity, badgeText: "9 contacted", badgeTone: "good" },
  { key: "growthScore", label: "Growth Score", value: "77/100", icon: Sparkles, badgeText: "from live activity", badgeTone: "good" },
  { key: "businessCircleImpact", label: "Business Circle Impact", value: "₹50,000", icon: Share2, badgeText: "6 circles · 0 leads", badgeTone: "good" },
];

export default function DashboardStats({ stats = SAMPLE_STATS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s) => (
        <StatCard key={s.key} {...s} />
      ))}
    </div>
  );
}