import { Network, MoreHorizontal } from "lucide-react";

const CP_DATA = [
  { name: "Rajesh Kumar",  region: "Tamil Nadu",     members: 284, revenue: "₹4,12,500", activeUsers: 261, status: "active"   },
  { name: "Priya Sharma",  region: "Karnataka",       members: 210, revenue: "₹3,18,200", activeUsers: 198, status: "active"   },
  { name: "Amit Verma",    region: "Maharashtra",     members: 195, revenue: "₹2,94,800", activeUsers: 180, status: "active"   },
  { name: "Sunita Patel",  region: "Gujarat",         members: 178, revenue: "₹2,67,400", activeUsers: 165, status: "active"   },
  { name: "Karthik Rajan", region: "Andhra Pradesh", members: 154, revenue: "₹2,31,600", activeUsers: 142, status: "active"   },
  { name: "Meena Iyer",    region: "Kerala",          members: 98,  revenue: "₹1,47,200", activeUsers: 84,  status: "inactive" },
  { name: "Deepak Singh",  region: "Uttar Pradesh",  members: 72,  revenue: "₹1,08,000", activeUsers: 58,  status: "inactive" },
  { name: "Nisha Reddy",   region: "Telangana",       members: 45,  revenue: "₹67,500",   activeUsers: 31,  status: "inactive" },
];

const STATUS = {
  active:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  inactive: { label: "Inactive", cls: "bg-amber-50 text-amber-700 border border-amber-100"      },
};

const COLS = ["Channel Partner", "Members", "Revenue", "Active Users", "Status"];

export default function ChannelPartnerPerformance() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
            <Network size={15} className="text-[#2563EB]" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E293B] leading-tight">Channel Partner Performance</h2>
            <p className="text-[11.5px] text-[#94A3B8] mt-0.5">Top performers across all regions</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors text-[#CBD5E1] hover:text-[#64748B]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
              {COLS.map((h) => (
                <th key={h} className="text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8] px-6 py-3.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CP_DATA.map(({ name, region, members, revenue, activeUsers, status }, i) => {
              const { label, cls } = STATUS[status];
              const initials = name.split(" ").map((n) => n[0]).join("");
              const activePct = Math.round((activeUsers / members) * 100);
              return (
                <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-[#2563EB]">{initials}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1E293B] leading-tight">{name}</p>
                        <p className="text-[11.5px] text-[#94A3B8] mt-0.5">{region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-semibold text-[#1E293B] tabular-nums">{members}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-semibold text-[#1E293B] tabular-nums">{revenue}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#1E293B] tabular-nums">{activeUsers}</span>
                      <span className="text-[11.5px] font-medium text-[#94A3B8]">({activePct}%)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}