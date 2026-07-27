import React from "react";
import DashboardBanner from "../dashboard/DashboardBanner.jsx";
import DashboardStats from "../dashboard/DashboardStats.jsx";
import ChannelEngagementChart from "../dashboard/ChannelEngagementChart.jsx";
import LeadCoverageChart from "../dashboard/LeadCoverageChart.jsx";
import BusinessStageFunnel from "../dashboard/BusinessStageFunnel.jsx";
import SectorOpportunityChart from "../dashboard/SectorOpportunityChart.jsx";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 bg-paper -m-6 p-6 min-h-full">
      <DashboardBanner
        location="Bangalore"
        title="Data Analytics"
        subtitle="Live dashboards, business sentiment, and ward performance insights"
      />

      <DashboardStats />

      <ChannelEngagementChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadCoverageChart />
        <BusinessStageFunnel />
      </div>

      <SectorOpportunityChart />
    </div>
  );
}