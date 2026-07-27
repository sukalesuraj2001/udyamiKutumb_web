import React, { useState } from "react";
import { FolderOpen, TrendingUp, TrendingDown, Mail, Phone, MessageSquare, MessagesSquare, Check } from "lucide-react";
import Loader from "../../common/Loader.jsx";

const COST_PER_MESSAGE = [
  { key: "email",    label: "Email",    cost: "1 cr", icon: Mail          },
  { key: "ivr",      label: "IVR",      cost: "5 cr", icon: Phone         },
  { key: "sms",      label: "SMS",      cost: "1 cr", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", cost: "2 cr", icon: MessagesSquare},
];

const PLANS = [
  { key: "starter",    label: "Starter",    creditsNum: 100,  credits: "100",   price: "₹99",    perCredit: "₹0.99 per credit" },
  { key: "standard",   label: "Standard",   creditsNum: 550,  credits: "550",   price: "₹449",   perCredit: "₹0.82 per credit", bonus: "500 + 50 bonus",     popular: true },
  { key: "pro",        label: "Pro",        creditsNum: 2200, credits: "2,200", price: "₹1,599", perCredit: "₹0.73 per credit", bonus: "2,000 + 200 bonus"  },
  { key: "enterprise", label: "Enterprise", creditsNum: 5500, credits: "5,500", price: "₹3,499", perCredit: "₹0.64 per credit", bonus: "5,000 + 500 bonus"  },
];

export default function Credits() {
  const [availableCredits, setAvailableCredits] = useState(100);
  const [totalPurchased,   setTotalPurchased]   = useState(100);
  const [totalSpent]                            = useState(0);
  const [transactions,     setTransactions]     = useState([
    { description: "Purchased Starter pack", type: "Purchase", credits: "+100", balance: "100", date: "8 Jul 2026" },
  ]);
  const [purchasingKey,    setPurchasingKey]    = useState(null);
  const [justPurchasedKey, setJustPurchasedKey] = useState(null);

  const handleBuyNow = (plan) => {
    if (purchasingKey) return;
    setPurchasingKey(plan.key);

    const delay = 2000 + Math.random() * 1000;
    setTimeout(() => {
      setAvailableCredits((prev) => {
        const next = prev + plan.creditsNum;
        setTransactions((tx) => [{
          description: `Purchased ${plan.label} pack`,
          type: "Purchase",
          credits: `+${plan.creditsNum}`,
          balance: String(next),
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        }, ...tx]);
        return next;
      });
      setTotalPurchased((prev) => prev + plan.creditsNum);
      setPurchasingKey(null);
      setJustPurchasedKey(plan.key);
      setTimeout(() => setJustPurchasedKey(null), 2000);
    }, delay);
  };

  return (
    <div className="space-y-6">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Available Credits" value={availableCredits} icon={FolderOpen}   color="blue"  />
        <StatCard label="Total Purchased"   value={totalPurchased}   icon={TrendingUp}   color="green" />
        <StatCard label="Total Spent"       value={totalSpent}       icon={TrendingDown} color="gray"  />
      </div>

      {/* ── Credit cost per message ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-[17px] font-bold text-gray-800 mb-5">Credit Cost per Message</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COST_PER_MESSAGE.map((c) => (
            <div key={c.key} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3.5">
              <c.icon size={17} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[12px] text-gray-400 leading-tight">{c.label}</p>
                <p className="text-[14px] font-semibold text-gray-800 leading-tight mt-0.5">{c.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Buy credits ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-[17px] font-bold text-gray-800 mb-5 flex items-center gap-2">
          <span className="text-blue-500">✦</span> Buy Credits
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => {
            const isPurchasing  = purchasingKey    === p.key;
            const justPurchased = justPurchasedKey === p.key;

            return (
              <div
                key={p.key}
                className={`relative rounded-2xl border p-5 flex flex-col transition-colors ${
                  p.popular
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Popular badge */}
                {p.popular && !isPurchasing && !justPurchased && (
                  <span className="absolute -top-3 right-4 bg-blue-600 text-white
                                   text-[10.5px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    Popular
                  </span>
                )}

                <p className="text-[13px] font-semibold text-gray-600 mb-2">{p.label}</p>

                <p className="text-[24px] font-bold text-gray-800 leading-none mb-1">
                  {p.credits}{" "}
                  <span className="text-[13px] font-medium text-gray-400">credits</span>
                </p>

                {p.bonus
                  ? <p className="text-[11.5px] text-green-600 mb-3">✓ {p.bonus}</p>
                  : <div className="mb-3" />
                }

                <p className="text-[20px] font-bold text-gray-800 mt-auto">{p.price}</p>
                <p className="text-[11px] text-gray-400 mb-4">{p.perCredit}</p>

                <button
                  onClick={() => handleBuyNow(p)}
                  disabled={!!purchasingKey}
                  className={`w-full text-[13px] font-semibold py-2.5 rounded-xl transition-all
                              flex items-center justify-center gap-2
                              disabled:opacity-60 disabled:cursor-not-allowed ${
                    justPurchased
                      ? "bg-green-600 text-white shadow-sm shadow-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200"
                  }`}
                >
                  {isPurchasing ? (
                    <Loader variant="inline" tone="light" label="Processing…" />
                  ) : justPurchased ? (
                    <><Check size={15} /> Added!</>
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transaction history ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-800">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-10">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Description", "Type", "Credits", "Balance", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10.5px] font-semibold tracking-widest uppercase text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors ${
                      i === 0 ? "animate-[fadeIn_0.4s_ease-out]" : ""
                    }`}
                  >
                    <td className="px-6 py-3.5 text-[13.5px] font-semibold text-gray-800">{t.description}</td>
                    <td className="px-6 py-3.5">
                      <span className="text-[11px] font-semibold border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full">
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-green-600">{t.credits}</td>
                    <td className="px-6 py-3.5 text-[13px] text-gray-800">{t.balance}</td>
                    <td className="px-6 py-3.5 text-[13px] text-gray-400">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:  { icon: "bg-blue-50 text-blue-600",   value: "text-blue-600"  },
  green: { icon: "bg-green-50 text-green-600",  value: "text-green-600" },
  gray:  { icon: "bg-gray-100 text-gray-500",   value: "text-gray-800"  },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.gray;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2">{label}</p>
        <p className={`text-[26px] font-bold leading-none tabular-nums transition-all ${c.value}`}>{value}</p>
      </div>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon size={18} />
      </span>
    </div>
  );
}