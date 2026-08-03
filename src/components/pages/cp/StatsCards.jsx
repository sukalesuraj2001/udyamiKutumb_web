import React from "react";

const stats = [
  {
    label: "Total Channel Partners",
    value: "1,248",
    change: "+12.5%",
    tag: "128 this week",
    tagType: "blue",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    iconBg: "#EFF6FF", iconColor: "#2563EB",
  },
  {
    label: "Active Paths",
    value: "324",
    change: "+8.4%",
    tag: "All active",
    tagType: "green",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    iconBg: "#F0FDF4", iconColor: "#16A34A",
  },
  {
    label: "Total Leads",
    value: "18,562",
    change: "+15.3%",
    tag: "15.3% growth",
    tagType: "amber",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    iconBg: "#FFFBEB", iconColor: "#D97706",
  },
  {
    label: "Verified Members",
    value: "9,842",
    change: "+18.7%",
    tag: "42 upgraded",
    tagType: "teal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    iconBg: "#F0FDFA", iconColor: "#0D9488",
  },
  {
    label: "Points Issued",
    value: "2,45,680",
    change: "+22.6%",
    tag: "This month",
    tagType: "purple",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    iconBg: "#F5F3FF", iconColor: "#7C3AED",
  },
  {
    label: "Payouts (This Month)",
    value: "₹12,45,000",
    change: "+19.8%",
    tag: "Highest tier",
    tagType: "rose",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    iconBg: "#FFF1F2", iconColor: "#E11D48",
  },
];

const tagColors = {
  blue:   { bg: "#DBEAFE", color: "#1D4ED8" },
  green:  { bg: "#DCFCE7", color: "#15803D" },
  amber:  { bg: "#FEF3C7", color: "#B45309" },
  teal:   { bg: "#CCFBF1", color: "#0F766E" },
  purple: { bg: "#EDE9FE", color: "#6D28D9" },
  rose:   { bg: "#FFE4E6", color: "#BE123C" },
};

export default function StatsCards() {
  return (
    <div className="cp-stats-grid" style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0,1fr))",
      gap: "14px",
      marginBottom: "22px",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px 18px",
          border: "1px solid #E8EDF5",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
          overflow: "hidden",
          transition: "box-shadow 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(30,42,74,0.10)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
        >
          {/* top accent line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: s.iconColor, borderRadius: "16px 16px 0 0", opacity: 0.7,
          }} />

          <div style={{
            width: 42, height: 42, borderRadius: "12px",
            background: s.iconBg, color: s.iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {s.icon}
          </div>

          <div>
            <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 500, marginBottom: "5px", letterSpacing: "0.1px" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "clamp(18px,2vw,22px)", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              {s.value}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              {s.change}
            </span>
            <span style={{
              fontSize: "10.5px", fontWeight: 600,
              padding: "2px 8px", borderRadius: "20px",
              background: tagColors[s.tagType].bg,
              color: tagColors[s.tagType].color,
            }}>{s.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}