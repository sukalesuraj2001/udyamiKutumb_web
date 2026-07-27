import { useState } from "react";
import {
  Search, Crown, CreditCard, Pencil,
} from "lucide-react";

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
      transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      ${checked ? "bg-blue-600" : "bg-gray-200"}`}
  >
    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md
      transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
  </button>
);

const MEMBERS_DATA = [
  { id: 1,  name: "Chandru M H",        uid: "UDY-202607-A3EF8EE5", plan: "basic", status: "active", ward: "",        expiry: "2027-07-01", daysLeft: 352, autoRenew: false },
  { id: 2,  name: "Rajesh Member",       uid: "UDY-202606-E283EBE7", plan: "basic", status: "active", ward: "",        expiry: "2027-06-20", daysLeft: 341, autoRenew: false },
  { id: 3,  name: "Thrupthi V",          uid: "UDY-202606-9A439416", plan: "prime", status: "active", ward: "",        expiry: "2027-06-19", daysLeft: 340, autoRenew: false },
  { id: 4,  name: "Spoorthi V",          uid: "UDY-202606-09FDE734", plan: "prime", status: "active", ward: "",        expiry: "2027-06-19", daysLeft: 340, autoRenew: false },
  { id: 5,  name: "Nandini Devi",        uid: "UDY-202606-672E1251", plan: "basic", status: "active", ward: "",        expiry: "2027-06-19", daysLeft: 340, autoRenew: false },
  { id: 6,  name: "Umesh Gowda",         uid: "UDY-202606-CC353AEE", plan: "basic", status: "active", ward: "",        expiry: "2027-06-19", daysLeft: 340, autoRenew: false },
  { id: 7,  name: "Yogesh Achar",        uid: "UDY-202605-1E9F4913", plan: "prime", status: "active", ward: "",        expiry: "2027-06-19", daysLeft: 340, autoRenew: false },
  { id: 8,  name: "Dharani Kumar BK",    uid: "UDY-202606-BBC9F921", plan: "basic", status: "active", ward: "",        expiry: "2027-06-16", daysLeft: 337, autoRenew: false },
  { id: 9,  name: "Nandeesh S Rajegowda",uid: "UDY-202606-68BC5CC8", plan: "prime", status: "active", ward: "",        expiry: "2027-06-15", daysLeft: 336, autoRenew: false },
  { id: 10, name: "Priya Nair",          uid: "UDY-202605-C12FAA91", plan: "prime", status: "active", ward: "Ward 3", expiry: "2027-05-15", daysLeft: 305, autoRenew: true  },
  { id: 11, name: "Suresh Kumar",        uid: "UDY-202604-B88DC002", plan: "prime", status: "active", ward: "Ward 7", expiry: "2027-04-10", daysLeft: 270, autoRenew: true  },
  { id: 12, name: "Lakshmi Devi",        uid: "UDY-202603-A44FE771", plan: "basic", status: "active", ward: "Ward 1", expiry: "2027-03-05", daysLeft: 234, autoRenew: false },
];

export default function Subscription() {
  const [members, setMembers] = useState(MEMBERS_DATA);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan]     = useState("all");

  const toggleRenew = (id) =>
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, autoRenew: !m.autoRenew } : m));

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || m.uid.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const matchPlan   = filterPlan   === "all" || m.plan   === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2.5 border border-gray-200 bg-white px-4 py-2.5 rounded-t-xl">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 flex-1 max-w-xs">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] text-gray-700 outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="grace">Grace</option>
        </select>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-[13px] text-gray-700 outline-none cursor-pointer"
        >
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="prime">Prime</option>
        </select>
        <div className="ml-auto text-[12px] text-gray-400">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {["Member", "Plan", "Status", "Ward", "Expiry", "Days Left", "Auto-Renew", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[13px] text-gray-400">
                  No members match your search.
                </td>
              </tr>
            ) : (
              filtered.map((m, i) => (
                <tr key={m.id} className={`transition-colors hover:bg-blue-50/30 ${i < filtered.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{m.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-gray-400">{m.uid}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {m.plan === "prime" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Crown size={10} /> Prime
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        <CreditCard size={10} /> Basic
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-600">
                    {m.ward || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-600 whitespace-nowrap">{m.expiry}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[13px] font-semibold ${m.daysLeft > 180 ? "text-green-600" : m.daysLeft > 60 ? "text-amber-600" : "text-red-600"}`}>
                      {m.daysLeft}d
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Toggle checked={m.autoRenew} onChange={() => toggleRenew(m.id)} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="rounded-md border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600">
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}