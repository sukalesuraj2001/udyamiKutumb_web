import { useState } from "react";
import {
  IndianRupee, ShieldCheck, Gift, RefreshCcw,
  Upload, Download, FileText, Crown, CreditCard,
} from "lucide-react";

const PAYMENTS_DATA = [
  { id: 1, receipt: "REC-2025-0156", member: "Rajesh Gowda",  memberId: "UB-25-01001", plan: "prime", amount: 25000,  gst: 4500, type: "membership", method: "UPI",                  date: "10 Mar" },
  { id: 2, receipt: "REC-2025-0157", member: "Sunita Hegde",  memberId: "UB-25-01002", plan: "basic", amount: 10000,  gst: 1800, type: "membership", method: "Bank Transfer",         date: "9 Mar"  },
  { id: 3, receipt: "WAV-2025-0012", member: "Meena Patil",   memberId: "UB-25-01010", plan: "basic", amount: 5000,   gst: null, type: "waiver",     method: "Scholarship",           date: "8 Mar"  },
  { id: 4, receipt: "REF-2025-0003", member: "Vinod Shetty",  memberId: "UB-25-01007", plan: "basic", amount: -10000, gst: 1800, type: "refund",      method: "Bank Transfer",         date: "5 Mar"  },
  { id: 5, receipt: "REC-2025-0158", member: "Kavita Rao",    memberId: "UB-25-01004", plan: "prime", amount: 25000,  gst: 4500, type: "membership", method: "Cheque",                date: "4 Mar"  },
  { id: 6, receipt: "WAV-2025-0013", member: "Lakshmi Devi",  memberId: "UB-25-01008", plan: "basic", amount: 7500,   gst: null, type: "waiver",     method: "Udyami Queen Discount", date: "3 Mar"  },
  { id: 7, receipt: "REC-2025-0159", member: "Arun Sharma",   memberId: "UB-25-01011", plan: "prime", amount: 25000,  gst: 4500, type: "membership", method: "UPI",                  date: "2 Mar"  },
  { id: 8, receipt: "REC-2025-0160", member: "Preethi Nair",  memberId: "UB-25-01012", plan: "basic", amount: 10000,  gst: 1800, type: "membership", method: "Bank Transfer",         date: "1 Mar"  },
];

const TYPE_STYLES = {
  membership: "bg-green-50 text-green-700",
  waiver:     "bg-amber-50 text-amber-700",
  refund:     "bg-red-50   text-red-600",
};

export default function PaymentsTab() {
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = typeFilter === "all"
    ? PAYMENTS_DATA
    : PAYMENTS_DATA.filter((p) => p.type === typeFilter);

  const totalCollected = PAYMENTS_DATA.filter((p) => p.type === "membership" && p.amount > 0).reduce((s, p) => s + p.amount, 0);
  const gstCollected   = PAYMENTS_DATA.filter((p) => p.gst).reduce((s, p) => s + p.gst, 0);
  const waivers        = PAYMENTS_DATA.filter((p) => p.type === "waiver").reduce((s, p) => s + p.amount, 0);
  const refunds        = Math.abs(PAYMENTS_DATA.filter((p) => p.type === "refund").reduce((s, p) => s + p.amount, 0));

  const stats = [
    { label: "Total Collected",      value: `₹${(totalCollected/1000).toFixed(0)}K`, icon: <IndianRupee size={15} className="text-green-600" />, iconBg: "bg-green-50" },
    { label: "GST Collected",        value: `₹${(gstCollected/1000).toFixed(1)}K`,   icon: <ShieldCheck  size={15} className="text-blue-600"  />, iconBg: "bg-blue-50"  },
    { label: "Waivers/Scholarships", value: `₹${(waivers/1000).toFixed(1)}K`,        icon: <Gift         size={15} className="text-amber-600" />, iconBg: "bg-amber-50" },
    { label: "Refunds Issued",       value: `₹${(refunds/1000).toFixed(0)}K`,        icon: <RefreshCcw   size={15} className="text-red-500"   />, iconBg: "bg-red-50"   },
  ];

  return (
    <div className="space-y-4 pt-4">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${s.iconBg}`}>{s.icon}</span>
              {s.label}
            </div>
            <p className="text-[22px] font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
          <Upload size={14} /> Import Bank Statement
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
          <Download size={14} /> Export for CA
        </button>
        <div className="ml-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-700 outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="membership">Membership</option>
            <option value="waiver">Waiver</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Receipt", "Member", "Plan", "Amount", "GST", "Type", "Method", "Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className={`transition-colors hover:bg-gray-50 ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}>
                <td className="px-4 py-3.5 font-mono text-[12px] text-gray-500 whitespace-nowrap">{p.receipt}</td>
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{p.member}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{p.memberId}</p>
                </td>
                <td className="px-4 py-3.5">
                  {p.plan === "prime"
                    ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"><Crown size={10} /> Prime</span>
                    : <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700"><CreditCard size={10} /> Basic</span>
                  }
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className={`text-[13px] font-semibold ${p.amount < 0 ? "text-red-600" : "text-gray-900"}`}>
                    {p.amount < 0 ? `-₹${Math.abs(p.amount).toLocaleString("en-IN")}` : `₹${p.amount.toLocaleString("en-IN")}`}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">
                  {p.gst ? `₹${p.gst.toLocaleString("en-IN")}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TYPE_STYLES[p.type]}`}>{p.type}</span>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">{p.method}</td>
                <td className="px-4 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{p.date}</td>
                <td className="px-4 py-3.5">
                  <button className="rounded-md border border-gray-200 p-1.5 text-gray-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <FileText size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}