import React from "react";

const topPartners = [
  { name:"Rahul Sharma", verified:458, points:12450, avatar:"RS", rank:1 },
  { name:"Sunil Patil",  verified:392, points:10280, avatar:"SP", rank:2 },
  { name:"Anita Desai",  verified:365, points:9875,  avatar:"AD", rank:3 },
  { name:"Vijay Kumar",  verified:321, points:8650,  avatar:"VK", rank:4 },
  { name:"Pooja Singh",  verified:287, points:7940,  avatar:"PS", rank:5 },
];

const avatarColors = [
  { bg:"#DBEAFE", color:"#1D4ED8" },
  { bg:"#DCFCE7", color:"#15803D" },
  { bg:"#EDE9FE", color:"#6D28D9" },
  { bg:"#FEF3C7", color:"#92400E" },
  { bg:"#FFE4E6", color:"#BE123C" },
];

const rankColors = ["#F59E0B","#94A3B8","#CD7F32","#94A3B8","#94A3B8"];

const pointsSummary = [
  { label:"Points Issued", value:"2,45,680", bg:"#EFF6FF", color:"#1D4ED8", icon:(
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  )},
  { label:"Points Redeemed", value:"1,25,430", bg:"#F0FDF4", color:"#15803D", icon:(
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  )},
  { label:"Available", value:"1,20,250", bg:"#FFFBEB", color:"#92400E", icon:(
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  )},
];

export default function PartnersSidebar() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Top Channel Partners */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EDF5", overflow:"hidden" }}>
        {/* Card Header */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 20px 14px",
          borderBottom:"1px solid #F1F5F9",
        }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>Top Channel Partners</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>By verified members</div>
          </div>
          <button style={{
            fontSize:11.5, color:"#2563EB", background:"#EFF6FF",
            border:"1px solid #BFDBFE", borderRadius:8,
            padding:"5px 12px", cursor:"pointer", fontWeight:600,
          }}>View All →</button>
        </div>

        {/* Column headers */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 60px 80px",
          padding:"8px 20px", gap:8,
          fontSize:10.5, color:"#94A3B8", fontWeight:600,
          textTransform:"uppercase", letterSpacing:"0.5px",
          background:"#F8FAFC",
        }}>
          <span>Partner</span>
          <span style={{ textAlign:"center" }}>Verified</span>
          <span style={{ textAlign:"right" }}>Points</span>
        </div>

        {/* Rows */}
        <div style={{ padding:"4px 0" }}>
          {topPartners.map((p,i) => (
            <div key={i}
              style={{
                display:"grid", gridTemplateColumns:"1fr 60px 80px",
                alignItems:"center", padding:"10px 20px", gap:8,
                transition:"background 0.1s", cursor:"pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{
                    width:34, height:34, borderRadius:"50%",
                    background:avatarColors[i].bg, color:avatarColors[i].color,
                    fontSize:11, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>{p.avatar}</div>
                  <div style={{
                    position:"absolute", bottom:-2, right:-2,
                    width:14, height:14, borderRadius:"50%",
                    background:rankColors[i], border:"2px solid #fff",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:7, fontWeight:800, color:"#fff",
                  }}>{p.rank}</div>
                </div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"#0F172A" }}>{p.name}</div>
                  <div style={{ fontSize:10.5, color:"#94A3B8", marginTop:1 }}>Channel Partner</div>
                </div>
              </div>
              <div style={{ textAlign:"center" }}>
                <span style={{
                  fontSize:13, fontWeight:700, color:"#0F172A",
                }}>{p.verified}</span>
              </div>
              <div style={{ textAlign:"right" }}>
                <span style={{
                  fontSize:12.5, fontWeight:700, color:"#2563EB",
                  background:"#EFF6FF", padding:"3px 8px", borderRadius:6,
                }}>{p.points.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Summary */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E8EDF5" }}>
        <div style={{
          padding:"18px 20px 14px",
          borderBottom:"1px solid #F1F5F9",
        }}>
          <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>Points Summary</div>
          <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>This month</div>
        </div>

        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          {pointsSummary.map((pt,i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 14px", borderRadius:12,
              background:pt.bg, border:`1px solid ${pt.bg === "#EFF6FF" ? "#BFDBFE" : pt.bg === "#F0FDF4" ? "#BBF7D0" : "#FDE68A"}`,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ color:pt.color }}>{pt.icon}</span>
                <span style={{ fontSize:12, color:"#475569", fontWeight:500 }}>{pt.label}</span>
              </div>
              <span style={{ fontSize:15, fontWeight:800, color:pt.color, letterSpacing:"-0.5px" }}>
                {pt.value}
              </span>
            </div>
          ))}

          {/* Redemption Rate */}
          <div style={{ marginTop:4 }}>
            <div style={{
              display:"flex", justifyContent:"space-between",
              fontSize:11.5, color:"#64748B", marginBottom:7, fontWeight:500,
            }}>
              <span>Redemption rate</span>
              <span style={{ color:"#0F172A", fontWeight:700 }}>51.1%</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:"#F1F5F9", overflow:"hidden" }}>
              <div style={{
                height:"100%", width:"51.1%", borderRadius:99,
                background:"linear-gradient(90deg, #2563EB, #0D9488)",
              }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#CBD5E1", marginTop:4 }}>
              <span>0</span><span>50%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}