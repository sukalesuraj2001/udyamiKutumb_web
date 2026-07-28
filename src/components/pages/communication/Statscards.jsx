import { useState, useEffect } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────
// Using lucide-react (already available in the project env)
import {
  Clock,
  Coins,
  BadgeDollarSign,
  Users,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────
// Add or remove cards here — no touching JSX needed
const CARD_CONFIG = [
  {
    key: "pendingRequests",
    label: "Pending Requests",
    icon: Clock,
    colorScheme: "amber",
    formatValue: (v) => v?.toLocaleString() ?? "—",
    badgeText: (v) => (v === 1 ? "Awaiting action" : `${v} awaiting action`),
  },
  {
    key: "coinsConsumed",
    label: "Coins Consumed",
    icon: Coins,
    colorScheme: "blue",
    formatValue: (v) => v?.toLocaleString() ?? "—",
    badgeText: () => "Total used",
  },
  {
    key: "rechargeRevenue",
    label: "Recharge Revenue",
    icon: BadgeDollarSign,
    colorScheme: "green",
    formatValue: (v) => (v != null ? `₹${v}` : "—"),
    badgeText: (_, extra) => extra?.coinsLabel ?? "",
  }
];

// ─── Color Schemes ────────────────────────────────────────────────────────────
const SCHEMES = {
  amber: {
    iconBg: "#FAEEDA",
    iconColor: "#854F0B",
    badgeBg: "#FAEEDA",
    badgeColor: "#854F0B",
  },
  blue: {
    iconBg: "#E6F1FB",
    iconColor: "#185FA5",
    badgeBg: "#E6F1FB",
    badgeColor: "#185FA5",
  },
  green: {
    iconBg: "#EAF3DE",
    iconColor: "#3B6D11",
    badgeBg: "#EAF3DE",
    badgeColor: "#3B6D11",
  },
  purple: {
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
    badgeBg: "#EEEDFE",
    badgeColor: "#534AB7",
  },
};

// ─── Single Card ─────────────────────────────────────────────────────────────
function StatCard({ label, icon: Icon, colorScheme, value, badge, loading }) {
  const scheme = SCHEMES[colorScheme];

  return (
    <div
      style={{
        background: "var(--color-bg-card, #fff)",
        borderRadius: "14px",
        border: "1px solid #EAECF0",
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 1px 3px rgba(16,24,40,0.05)",
        flex: "1 1 200px",
        minWidth: 0,
      }}
    >
      {/* Top row: label + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "#98A2B3",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            background: scheme.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={17} color={scheme.iconColor} strokeWidth={2} />
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <div
          style={{
            height: "36px",
            width: "60%",
            borderRadius: "6px",
            background: "#F2F4F7",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#101828",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </div>
      )}

      {/* Badge */}
      {loading ? (
        <div
          style={{
            height: "22px",
            width: "45%",
            borderRadius: "20px",
            background: "#F2F4F7",
          }}
        />
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: "20px",
            background: scheme.badgeBg,
            color: scheme.badgeColor,
            width: "fit-content",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton pulse animation ─────────────────────────────────────────────────
const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StatsCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      // ── Replace this URL with your real API endpoint ──────────────────────
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // ── Map your API response shape here ─────────────────────────────────
      // Expected shape from API:
      // {
      //   pendingRequests: 2,
      //   coinsConsumed:   5390,
      //   rechargeRevenue: { amount: "5,400k", coinsLabel: "13,500 coins" },
      //   activeMembers:   4
      // }
      setData(json);
    } catch (err) {
      // console.error("StatsCards fetch error:", err);
      setError(err.message);

      // ── Fallback / mock data while API isn't ready ────────────────────────
      setData({
        pendingRequests: 2,
        coinsConsumed: 5390,
        rechargeRevenue: { amount: "5,400k", coinsLabel: "13,500 coins" },
        activeMembers: 4,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{pulseStyle}</style>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        {CARD_CONFIG.map((card) => {
          const raw = data?.[card.key];
          const displayValue =
            card.key === "rechargeRevenue"
              ? card.formatValue(raw?.amount)
              : card.formatValue(raw);

          const badgeText =
            card.key === "rechargeRevenue"
              ? card.badgeText(null, raw)
              : card.badgeText(raw);

          // return (
          //   <StatCard
          //     key={card.key}
          //     label={card.label}
          //     icon={card.icon}
          //     colorScheme={card.colorScheme}
          //     value={displayValue}
          //     badge={badgeText}
          //     loading={loading}
          //   />
          // );
        })}
      </div>
    </>
  );
}