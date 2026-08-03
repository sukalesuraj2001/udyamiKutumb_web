import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const leadsOverview = [
  { month: "Feb", leads: 2200, verified: 800 },
  { month: "Mar", leads: 4500, verified: 2000 },
  { month: "Apr", leads: 6800, verified: 3200 },
  { month: "May", leads: 7500, verified: 4500 },
  { month: "Jun", leads: 8200, verified: 5800 },
  { month: "Jul", leads: 9800, verified: 6800 },
];

const donutData = [
  { name: "Pending",          value: 6243, color: "#F59E0B" },
  { name: "In Progress",      value: 4815, color: "#2563EB" },
  { name: "Under Verification",value: 3652, color: "#7C3AED" },
  { name: "Verified",         value: 3852, color: "#0D9488" },
];

const recentLeads = [
  { id:"LD-2026-0001", cp:"Rahul Sharma",  name:"Ramesh Kumar",      mobile:"98765 43210", sector:"Retail & Shops", location:"HSR Layout, Ward 12",   status:"Pending",           date:"31 Jul 2026" },
  { id:"LD-2026-0002", cp:"Sunil Patil",   name:"Sunidhi Enterprises",mobile:"98765 43211", sector:"Manufacturing",  location:"BTM Layout, Ward 7",     status:"In Progress",       date:"31 Jul 2026" },
  { id:"LD-2026-0003", cp:"Anita Desai",   name:"Anita Stores",       mobile:"98765 43212", sector:"Retail & Shops", location:"JP Nagar, Ward 3",       status:"Under Verification",date:"31 Jul 2026" },
  { id:"LD-2026-0004", cp:"Vijay Kumar",   name:"Vijay Traders",      mobile:"98765 43213", sector:"Trading",        location:"Koramangala, Ward 4",    status:"Verified",          date:"31 Jul 2026" },
  { id:"LD-2026-0005", cp:"Pooja Singh",   name:"Shree Medicals",     mobile:"98765 43214", sector:"Healthcare",     location:"HSR Layout, Ward 12",    status:"Verified",          date:"31 Jul 2026" },
];

const statusConfig = {
  "Pending":            { bg:"#FEF3C7", color:"#92400E", dot:"#F59E0B" },
  "In Progress":        { bg:"#DBEAFE", color:"#1E40AF", dot:"#2563EB" },
  "Under Verification": { bg:"#EDE9FE", color:"#4C1D95", dot:"#7C3AED" },
  "Verified":           { bg:"#CCFBF1", color:"#134E4A", dot:"#0D9488" },
};

const tabs = ["All","Pending","In Progress","Under Verification","Verified"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1E2A4A", borderRadius:10, padding:"10px 14px", border:"none" }}>
      <p style={{ color:"#94A3B8", fontSize:11, margin:"0 0 6px", fontWeight:500 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, fontSize:12, margin:"2px 0", fontWeight:600 }}>
          {p.name === "leads" ? "Leads" : "Verified"}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function LeadsSection() {
  const [activeTab, setActiveTab] = useState("All");
  const filtered = activeTab === "All" ? recentLeads : recentLeads.filter(l => l.status === activeTab);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

      {/* Charts Row */}
      <div className="cp-charts-grid" style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>

        {/* Area Chart */}
        <div style={{
          background:"#fff", borderRadius:16, padding:"22px 20px",
          border:"1px solid #E8EDF5",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>Leads & Verifications</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Monthly trend — FY 2026</div>
            </div>
            <select style={{
              fontSize:11, border:"1px solid #E2E8F0", borderRadius:8,
              padding:"5px 10px", color:"#475569", background:"#F8FAFC", cursor:"pointer",
              outline:"none",
            }}>
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>

          <div style={{ display:"flex", gap:16, marginBottom:14 }}>
            {[["#2563EB","Leads"],["#0D9488","Verified"]].map(([c,l]) => (
              <span key={l} style={{ fontSize:11, color:c, display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }} />{l}
              </span>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={leadsOverview} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gVer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="#2563EB" strokeWidth={2.5} fill="url(#gLeads)" dot={{ r:3.5, fill:"#2563EB", strokeWidth:0 }} activeDot={{ r:5 }} />
              <Area type="monotone" dataKey="verified" stroke="#0D9488" strokeWidth={2.5} fill="url(#gVer)" dot={{ r:3.5, fill:"#0D9488", strokeWidth:0 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div style={{
          background:"#fff", borderRadius:16, padding:"22px 20px",
          border:"1px solid #E8EDF5",
        }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:4 }}>Leads by Status</div>
          <div style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>Distribution overview</div>

          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <PieChart width={130} height={130}>
                <Pie data={donutData} cx={60} cy={60} innerRadius={40} outerRadius={62} dataKey="value" strokeWidth={3} stroke="#fff">
                  {donutData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
              <div style={{
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none",
              }}>
                <div style={{ fontSize:9, color:"#94A3B8", letterSpacing:"0.3px" }}>TOTAL</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#0F172A" }}>18,562</div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
              {donutData.map((d,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }} />
                    <span style={{ fontSize:11.5, color:"#334155", fontWeight:500 }}>{d.name}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ fontSize:12, color:"#0F172A", fontWeight:700 }}>{d.value.toLocaleString()}</span>
                    <span style={{ fontSize:10, color:"#94A3B8", marginLeft:4 }}>
                      {((d.value/18562)*100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EDF5", overflow:"hidden" }}>
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 22px 0", marginBottom:0,
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>Recent Leads</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Showing latest activity</div>
          </div>
          <button style={{
            fontSize:12, color:"#2563EB", background:"#EFF6FF",
            border:"1px solid #BFDBFE", borderRadius:8,
            padding:"6px 14px", cursor:"pointer", fontWeight:600,
          }}>
            View All Leads →
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display:"flex", gap:0, margin:"16px 22px 0",
          borderBottom:"2px solid #F1F5F9",
          overflowX:"auto",
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding:"9px 16px", fontSize:12.5,
              fontWeight: activeTab===t ? 700 : 400,
              color: activeTab===t ? "#2563EB" : "#64748B",
              background:"none", border:"none",
              borderBottom: activeTab===t ? "2.5px solid #2563EB" : "2.5px solid transparent",
              cursor:"pointer", whiteSpace:"nowrap", marginBottom:-2,
              transition:"color 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
            <thead>
              <tr style={{ background:"#F8FAFC" }}>
                {["Lead ID","Channel Partner","Name","Mobile","Sector","Location","Status","Created On",""].map((h,i) => (
                  <th key={i} style={{
                    padding:"11px 14px", textAlign:"left",
                    color:"#64748B", fontWeight:600, fontSize:11,
                    whiteSpace:"nowrap", borderBottom:"1px solid #F1F5F9",
                    letterSpacing:"0.3px",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row,i) => (
                <tr key={i}
                  style={{ borderBottom:"1px solid #F8FAFC", transition:"background 0.12s", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"13px 14px" }}>
                    <span style={{ color:"#2563EB", fontWeight:700, fontFamily:"monospace", fontSize:12 }}>{row.id}</span>
                  </td>
                  <td style={{ padding:"13px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{
                        width:28, height:28, borderRadius:"50%",
                        background:"#EFF6FF", color:"#2563EB",
                        fontSize:10, fontWeight:700,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexShrink:0,
                      }}>
                        {row.cp.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <span style={{ color:"#334155", fontWeight:500 }}>{row.cp}</span>
                    </div>
                  </td>
                  <td style={{ padding:"13px 14px", color:"#334155" }}>{row.name}</td>
                  <td style={{ padding:"13px 14px", color:"#64748B", fontFamily:"monospace", fontSize:12 }}>{row.mobile}</td>
                  <td style={{ padding:"13px 14px", color:"#64748B" }}>{row.sector}</td>
                  <td style={{ padding:"13px 14px", color:"#64748B" }}>{row.location}</td>
                  <td style={{ padding:"13px 14px" }}>
                    <span style={{
                      padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                      background:statusConfig[row.status]?.bg,
                      color:statusConfig[row.status]?.color,
                      display:"inline-flex", alignItems:"center", gap:5,
                      whiteSpace:"nowrap",
                    }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:statusConfig[row.status]?.dot, display:"inline-block" }} />
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding:"13px 14px", color:"#94A3B8", fontSize:12 }}>{row.date}</td>
                  <td style={{ padding:"13px 14px" }}>
                    <button style={{
                      background:"#F8FAFC", border:"1px solid #E2E8F0",
                      borderRadius:8, padding:"5px 10px",
                      cursor:"pointer", color:"#64748B", fontSize:12,
                      display:"flex", alignItems:"center", gap:4,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 22px", borderTop:"1px solid #F1F5F9",
          flexWrap:"wrap", gap:10,
        }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>
            Showing <b style={{ color:"#334155" }}>1–{filtered.length}</b> of <b style={{ color:"#334155" }}>25</b> entries
          </span>
          <div style={{ display:"flex", gap:5 }}>
            {["‹", 1, 2, 3, "...", 5].map((p,i) => (
              <button key={i} style={{
                width:32, height:32, borderRadius:8,
                border: p===1 ? "none" : "1px solid #E2E8F0",
                background: p===1 ? "#2563EB" : "#fff",
                color: p===1 ? "#fff" : "#475569",
                fontSize:12, fontWeight: p===1 ? 700 : 400,
                cursor:"pointer",
              }}>{p}</button>
            ))}
            <button style={{
              width:32, height:32, borderRadius:8, border:"1px solid #E2E8F0",
              background:"#fff", color:"#475569", fontSize:12, cursor:"pointer",
            }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}