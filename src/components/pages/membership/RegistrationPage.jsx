import React, { useMemo, useState } from "react";
import {
  UserCheck,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";

const TABS = ["Pending", "Verified", "Rejected", "All"];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Pending:  "bg-amber-50  text-amber-700  border border-amber-200",
  Verified: "bg-green-50  text-green-700  border border-green-200",
  Rejected: "bg-red-50    text-red-700    border border-red-200",
};

const STATUS_DOT = {
  Pending:  "bg-amber-500",
  Verified: "bg-green-500",
  Rejected: "bg-red-500",
};

// ── Coming Soon placeholder ───────────────────────────────────────────────────
function ComingSoon({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg width="30" height="30" className="text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          <p className="text-[13.5px] font-semibold text-gray-500">Coming soon</p>
          <p className="text-[12px] text-gray-400">Registrations will appear here once members sign up.</p>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegistrationPage({ initialRegistrations = [] }) {
  const [tab, setTab]             = useState("Pending");
  const [rows, setRows]           = useState(initialRegistrations);
  const [previewId, setPreviewId] = useState(null);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const pending  = rows.filter((r) => r.status === "Pending").length;
  const verified = rows.filter((r) => r.status === "Verified").length;
  const rejected = rows.filter((r) => r.status === "Rejected").length;
  const revenue  = rows
    .filter((r) => r.status === "Verified")
    .reduce((sum, r) => sum + r.amount, 0);

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => (tab === "All" ? rows : rows.filter((r) => r.status === tab)),
    [tab, rows]
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateStatus = (id, newStatus) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

  // ── Metric cards config ────────────────────────────────────────────────────
  const metrics = [
    {
      label: "Pending Review",
      value: pending,
      icon: <Clock size={18} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      badge: rows.length === 0 ? "—" : pending > 0 ? "Needs action" : "All clear",
      badgeColor: pending > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700",
    },
    {
      label: "Verified Members",
      value: rows.length === 0 ? "—" : verified,
      icon: <CheckCircle2 size={18} className="text-green-600" />,
      iconBg: "bg-green-50",
      badge: rows.length === 0 ? "—" : `${rejected} rejected`,
      badgeColor: "bg-gray-100 text-gray-500",
    },
    {
      label: "Verified Revenue",
      value: rows.length === 0 ? "—" : `₹${revenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={18} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      badge: "All time",
      badgeColor: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-7 space-y-5 font-sans">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">
            Membership Registrations
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Review QR payments and verify new member sign-ups
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[12px]">
          <span className="font-semibold text-amber-600">{pending} pending</span>
          <span className="text-gray-300">·</span>
          <span className="font-semibold text-green-600">{verified} verified</span>
          <span className="text-gray-300">·</span>
          <span className="font-semibold text-red-500">{rejected} rejected</span>
        </div>
      </div>

      {/* ── Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <span className={`flex h-5 w-5 items-center justify-center rounded-md ${m.iconBg}`}>
                <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{m.icon}</span>
              </span>
              {m.label}
            </div>
            <p className="text-[26px] font-bold leading-none text-gray-900">{m.value}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${m.badgeColor}`}>
                {m.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="rounded-t-xl border border-b-0 border-gray-200 bg-white">
        <div className="flex px-2">
          {TABS.map((t) => {
            const count =
              t === "Pending"  ? pending  :
              t === "Verified" ? verified :
              t === "Rejected" ? rejected :
              rows.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3.5 text-[13px] font-medium transition-colors
                  ${tab === t
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {t}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                  ${tab === t ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Name", "Contact", "Plan", "Amount", "UPI Ref", "Proof", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <ComingSoon colSpan={8} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[13px] text-gray-400">
                    No registrations in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`transition-colors hover:bg-blue-50/30
                      ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    {/* NAME */}
                    <td className="px-4 py-3.5">
                      <p className="whitespace-nowrap text-[13px] font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-0.5 text-[12px] text-gray-500">{item.business}</p>
                    </td>

                    {/* CONTACT */}
                    <td className="px-4 py-3.5">
                      <p className="whitespace-nowrap text-[13px] text-gray-900">{item.phone}</p>
                      <p className="text-[12px] text-gray-500">{item.email}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{item.address}</p>
                    </td>

                    {/* PLAN */}
                    <td className="px-4 py-3.5">
                      {item.plan === "Prime" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                          👑 Prime
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          Basic
                        </span>
                      )}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[13px] font-semibold text-gray-900">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>

                    {/* UPI REF */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] text-gray-500">{item.upiRef}</span>
                    </td>

                    {/* PROOF */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setPreviewId(previewId === item.id ? null : item.id)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
                        {item.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {item.status !== "Verified" && (
                          <button
                            onClick={() => updateStatus(item.id, "Verified")}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-[12px] font-semibold text-green-700 transition hover:bg-green-100 active:scale-95"
                          >
                            <CheckCircle2 size={13} />
                            Verify
                          </button>
                        )}
                        {item.status === "Verified" && (
                          <button
                            onClick={() => updateStatus(item.id, "Rejected")}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-700 transition hover:bg-red-100 active:scale-95"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        )}
                        {item.status === "Rejected" && (
                          <span className="text-[11px] text-gray-400 italic">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Proof Preview Panel ─────────────────────────────────────────── */}
      {previewId !== null && (() => {
        const item = rows.find((r) => r.id === previewId);
        if (!item) return null;
        return (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-blue-900">
                Payment Proof — {item.name}
              </p>
              <button
                onClick={() => setPreviewId(null)}
                className="text-[12px] font-medium text-blue-600 hover:text-blue-900"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-0.5">UPI Reference</p>
                <p className="font-mono text-blue-900">{item.upiRef}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-0.5">Amount</p>
                <p className="font-semibold text-blue-900">₹{item.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-0.5">Plan</p>
                <p className="text-blue-900">{item.plan}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-semibold mb-0.5">Paid by</p>
                <p className="text-blue-900">{item.name}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-white py-8 text-[12px] text-gray-400">
              📎 QR payment screenshot would render here
            </div>
          </div>
        );
      })()}

    </div>
  );
}