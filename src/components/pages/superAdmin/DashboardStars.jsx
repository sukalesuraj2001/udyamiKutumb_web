import React from "react";
import { Users, Network, Crown, User, CreditCard, UserCheck, UserX } from "lucide-react";
import SupStartCard from "./SupStartCard.jsx";

export const SAMPLE_STATS = [
  { key: "totalMembers", label: "Total Members",             value: "12,458", icon: Users,      badgeText: "↗ 128 this week",    badgeTone: "good" },
  { key: "freeUsers",    label: "Free Users",                value: "6,824",  icon: User,       badgeText: "55% of members",      badgeTone: "good" },
  { key: "basicUsers",   label: "Basic Users",               value: "3,245",  icon: CreditCard, badgeText: "↗ 42 upgraded",       badgeTone: "good" },
  { key: "primeUsers",   label: "Prime Users",               value: "2,389",  icon: Crown,      badgeText: "Highest plan",        badgeTone: "warn", highlight: true },
  { key: "totalCP",      label: "Total Channel Partners",    value: "185",    icon: Network,    badgeText: "Across all states",   badgeTone: "good" },
  { key: "activeCP",     label: "Active Channel Partners",   value: "172",    icon: UserCheck,  badgeText: "93% Active",          badgeTone: "good" },
  { key: "inactiveCP",   label: "Inactive Channel Partners", value: "13",     icon: UserX,      badgeText: "Needs attention",     badgeTone: "warn", highlight: true },
];

export default function DashboardStars({ stats = SAMPLE_STATS }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {stats.map(({ key, ...card }) => (
        <SupStartCard key={key} {...card} />
      ))}
    </div>
  );
}