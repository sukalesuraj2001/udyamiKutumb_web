import React from "react";
import StatsCards from "./StatsCards";
import LeadsSection from "./LeadsSection";
import PartnersSidebar from "./PartnersSidebar";
import { useNavigate } from "react-router-dom";

export default function Cp() {
  const navigate  = useNavigate()
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F0F2F8",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: "clamp(16px, 3vw, 32px)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "28px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{
              width: 6, height: 32, borderRadius: 3,
              background: "linear-gradient(180deg, #2563EB, #1E40AF)",
            }} />
            <h1 style={{
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontWeight: 700,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.6px",
            }}>CP Dashboard</h1>
          </div>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 0 16px" }}>
            Platform overview · Live data
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "10px",
            border: "1px solid #E2E8F0", background: "#fff",
            fontSize: "13px", color: "#475569", fontWeight: 500,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Jul 2026
          </div>
          <button style={{
            padding: "8px 18px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            letterSpacing: "0.1px",
          }}onClick={() => navigate("/wardChairman-head-dashboard/form-builder/channelPartner")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create New Form
          </button>
        </div>
      </div>

      <StatsCards />

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 320px",
        gap: "20px",
        alignItems: "start",
      }}
        className="cp-main-grid"
      >
        <LeadsSection />
        <PartnersSidebar />
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .cp-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .cp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cp-charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .cp-stats-grid { grid-template-columns: 1fr !important; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}