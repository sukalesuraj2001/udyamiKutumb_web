import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChannelPartnersByWard,
  fetchCpSubmittedDataByUserId,
  updateSurveyStatusByWardChairman,
  clearSelectedCpForms,
  selectCpPartnerList,
  selectCpPartnerListStatus,
  selectCpPartnerListError,
  selectSelectedCpForms,
  selectSelectedCpFormsStatus,
  selectSelectedCpFormsError,
} from "../../redux/slices/Cponboardingslice.js";
import { getLocationByWardHeadId } from "../../redux/slices/areaChartSlice.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_META = {
  verified: { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Verified" },
  approved: { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Rejected" },
  pending:  { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending"  },
  submitted:{ bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Submitted"},
  active:   { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Active"   },
  inactive: { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", label: "Inactive" },
};

const getStatusMeta = (s) => STATUS_META[s?.toLowerCase()] ?? { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af", label: s ?? "—" };

const StatusChip = ({ status, size = "sm" }) => {
  const m = getStatusMeta(status);
  const pad = size === "lg" ? "5px 14px" : "3px 10px";
  const fs  = size === "lg" ? 12 : 11;
  return (
    <span style={{ background: m.bg, color: m.color, padding: pad, borderRadius: 20, fontSize: fs, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: size === "lg" ? 7 : 6, height: size === "lg" ? 7 : 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

// ─── Avatar with gradient ─────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ["#6366f1","#818cf8"], ["#0ea5e9","#38bdf8"], ["#10b981","#34d399"],
  ["#f59e0b","#fbbf24"], ["#ef4444","#f87171"], ["#8b5cf6","#a78bfa"],
];
const Avatar = ({ name = "", size = 44, index = 0 }) => {
  const [from, to] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${from}, ${to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 2px 8px ${from}55` }}>
      {getInitials(name)}
    </div>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ label = "Loading…" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", gap: 14 }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #dbeafe", borderTop: "3px solid #2563eb", animation: "spin 0.7s linear infinite" }} />
    <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, sub }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 24px", gap: 10 }}>
    <div style={{ fontSize: 52, opacity: 0.5 }}>{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>{title}</div>
    <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", maxWidth: 260 }}>{sub}</div>
  </div>
);

// ─── Survey / Form Detail Card ────────────────────────────────────────────────
const SurveyCard = ({ form, index }) => {
  const dispatch = useDispatch();
  const [open, setOpen]           = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { user } = useSelector((s) => s.auth || {});
  const wardChairmanId = user?._id || user?.userId;

  const surveyId    = form.surveyId ?? form._id ?? form.formId ?? form.submissionId;
  const status      = form.status ?? "SUBMITTED";
  const isVerified  = status?.toUpperCase() === "VERIFIED";
  const isRejected  = status?.toUpperCase() === "REJECTED";
  const surveyTitle = form.surveyNumber ? `Survey #${String(form.surveyNumber).padStart(2,"0")}` : form.formType ?? form.formName ?? "Survey";

  const handleAction = async (newStatus, reason = "VERIFIED.") => {
    if (!wardChairmanId) { alert("Ward Chairman ID not found. Please re-login."); return; }
    setVerifying(true);
    try {
      await dispatch(updateSurveyStatusByWardChairman({ surveyId, wardChairmanId, status: newStatus, rejectionReason: reason })).unwrap();
      setRejectOpen(false);
    } catch (e) { alert(e || "Status update failed"); }
    finally { setVerifying(false); }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${open ? "#bfdbfe" : "#e5e7eb"}`, boxShadow: open ? "0 4px 20px rgba(29,78,216,0.10)" : "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 14, transition: "box-shadow 0.2s, border-color 0.2s" }}>
      {/* ── Clickable header (always visible) ── */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer", background: open ? "#eff6ff" : "#fff", borderBottom: open ? "1px solid #dbeafe" : "none", userSelect: "none", transition: "background 0.15s" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Number badge */}
          <div style={{ width: 40, height: 40, borderRadius: 12, background: isVerified ? "#d1fae5" : isRejected ? "#fee2e2" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: isVerified ? "#065f46" : isRejected ? "#991b1b" : "#1d4ed8", flexShrink: 0 }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{surveyTitle}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {form.locationType && <span style={{ background: "#f0f9ff", color: "#0369a1", padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{form.locationType}</span>}
              {form.createdAt && <span>Submitted {formatDate(form.createdAt)}</span>}
              <span>ID: …{String(surveyId).slice(-6)}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <StatusChip status={status} size="lg" />
          {/* Chevron */}
          <div style={{ width: 30, height: 30, borderRadius: 8, background: open ? "#dbeafe" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
            <svg width="14" height="14" fill="none" stroke={open ? "#1d4ed8" : "#6b7280"} strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Collapsible body ── */}
      {open && (
      <div style={{ padding: "18px 22px" }}>
        {/* Location block */}
        {(form.locationAddress || form.latitude) && (
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 14, border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>📍 Location Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "6px 24px" }}>
              {form.locationAddress && <InfoCell label="Address" value={form.locationAddress} />}
              {form.locationType && <InfoCell label="Location Type" value={form.locationType} />}
              {form.numberOfFloors != null && <InfoCell label="Floors" value={String(form.numberOfFloors)} />}
              {form.latitude && <InfoCell label="GPS" value={`${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}`} />}
            </div>
          </div>
        )}

        {/* Floors */}
        {Array.isArray(form.floors) && form.floors.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>🏢 Floors Breakdown ({form.floors.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8 }}>
              {form.floors.map((fl, fi) => (
                <div key={fl.floorId ?? fi} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Floor #{fl.floorNumber ?? fi} <span style={{ fontSize: 10, color: "#64748b", fontWeight: 400 }}>({fl.floorType ?? "STANDARD"})</span></div>
                  <div style={{ fontSize: 11, color: "#475569" }}>Usage: <b>{fl.usageType || "—"}</b></div>
                  <div style={{ fontSize: 11, color: "#475569" }}>Occupancy: <b>{fl.occupancyType || fl.residentialOccupancy || "—"}</b></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {Array.isArray(form.images) && form.images.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>📷 Images ({form.images.length})</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {form.images.map((img, ii) => (
                <div key={img.imageId ?? ii} style={{ textAlign: "center" }}>
                  <img src={img.imageUrl} alt={img.imageType || "Survey"} style={{ width: 110, height: 85, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", display: "block" }} />
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.imageType || `Image ${ii + 1}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other fields */}
        {(() => {
          const skip = new Set(["_id","__v","createdAt","updatedAt","floors","images","surveyId","cpUserId","locationAddress","locationType","numberOfFloors","latitude","longitude","status","surveyNumber"]);
          const extras = Object.entries(form).filter(([k,v]) => !skip.has(k) && typeof v !== "object");
          if (!extras.length) return null;
          return (
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", border: "1px solid #f1f5f9", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>📄 Form Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "6px 24px" }}>
                {extras.map(([k, v]) => (
                  <InfoCell key={k} label={k.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase())} value={String(v ?? "")} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Status banners */}
        {isVerified && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "linear-gradient(90deg,#d1fae5,#ecfdf5)", borderRadius: 10, border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>Verified by Ward Chairman</div>
              {form.verifiedAt && <div style={{ fontSize: 11, color: "#6ee7b7", marginTop: 1 }}>{formatDate(form.verifiedAt)}</div>}
            </div>
          </div>
        )}
        {isRejected && (
          <div style={{ padding: "12px 16px", background: "linear-gradient(90deg,#fee2e2,#fef2f2)", borderRadius: 10, border: "1px solid #fca5a5" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", display: "flex", gap: 8, alignItems: "center" }}><span>❌</span> Rejected</div>
            {form.rejectionReason && <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 4 }}>Reason: {form.rejectionReason}</div>}
          </div>
        )}

        {/* Action buttons */}
        {!isVerified && !isRejected && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
            {rejectOpen ? (
              <div style={{ background: "#fff7f7", borderRadius: 10, padding: 14, border: "1px solid #fca5a5" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 8 }}>Reason for Rejection</div>
                <input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Describe the issue…"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #fca5a5", fontSize: 13, marginBottom: 10, boxSizing: "border-box", outline: "none" }}
                />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setRejectOpen(false)} style={{ padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                  <button
                    disabled={verifying || !rejectReason.trim()}
                    onClick={() => handleAction("REJECTED", rejectReason)}
                    style={{ padding: "8px 18px", background: verifying || !rejectReason.trim() ? "#fca5a5" : "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontWeight: 700 }}
                  >Confirm Reject</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  disabled={verifying}
                  onClick={() => setRejectOpen(true)}
                  style={{ padding: "9px 20px", background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >✕  Reject</button>
                <button
                  disabled={verifying}
                  onClick={() => handleAction("VERIFIED", "VERIFIED.")}
                  style={{ padding: "9px 22px", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(16,185,129,0.35)", display: "flex", alignItems: "center", gap: 6 }}
                >{verifying ? "Verifying…" : "✓  Verify Survey"}</button>
              </div>
            )}
          </div>
        )}
      </div>
      )} {/* end open && collapsible body */}
    </div>
  );
};

const InfoCell = ({ label, value }) =>
  value ? (
    <div style={{ marginBottom: 2 }}>
      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, marginTop: 1 }}>{value}</div>
    </div>
  ) : null;

// ═════════════════════════════════════════════════════════════════════════════
//  CP FORMS PAGE (second view)
// ═════════════════════════════════════════════════════════════════════════════
const CpFormsPage = ({ cp, cpForms, cpFormsStatus, cpFormsError, onBack, cpIndex }) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const name   = cp.name ?? cp.fullName ?? cp.cpName ?? "Unknown";
  const phone  = cp.phone ?? cp.mobile ?? cp.mobileNumber ?? cp.phoneNumber ?? "";
  const email  = cp.email ?? "";
  const status = cp.status ?? (cp.isActive ? "active" : "inactive");

  const verifiedCount = cpForms.filter(f => f.status?.toUpperCase() === "VERIFIED").length;
  const rejectedCount = cpForms.filter(f => f.status?.toUpperCase() === "REJECTED").length;
  const pendingCount  = cpForms.filter(f => !["VERIFIED","REJECTED"].includes(f.status?.toUpperCase())).length;

  // ── Apply filter ──────────────────────────────────────────────────────────
  const filteredForms = cpForms.filter(f => {
    if (activeFilter === "all")      return true;
    if (activeFilter === "verified") return f.status?.toUpperCase() === "VERIFIED";
    if (activeFilter === "rejected") return f.status?.toUpperCase() === "REJECTED";
    if (activeFilter === "pending")  return !["VERIFIED","REJECTED"].includes(f.status?.toUpperCase());
    return true;
  });

  // Filter tab config
  const FILTER_TABS = [
    { key: "all",      label: "All",      count: cpForms.length,  activeColor: "#1d4ed8", activeBg: "#eff6ff", dot: "#3b82f6" },
    { key: "verified", label: "Verified", count: verifiedCount,   activeColor: "#065f46", activeBg: "#d1fae5", dot: "#10b981" },
    { key: "pending",  label: "Pending",  count: pendingCount,    activeColor: "#92400e", activeBg: "#fef3c7", dot: "#f59e0b" },
    { key: "rejected", label: "Rejected", count: rejectedCount,   activeColor: "#991b1b", activeBg: "#fee2e2", dot: "#ef4444" },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Top nav breadcrumb */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 28px", height: 52, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, fontWeight: 500, padding: "4px 0" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Channel Partners
        </button>
        <span style={{ color: "#d1d5db" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{name}</span>
      </div>

      {/* CP Profile Hero */}
      <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)", padding: "28px 28px 100px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar name={name} size={56} index={cpIndex} />
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>{name}</h1>
              <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                {phone && <span style={{ fontSize: 12, color: "#bfdbfe", display: "flex", gap: 5, alignItems: "center" }}>📞 {phone}</span>}
                {email && <span style={{ fontSize: 12, color: "#bfdbfe", display: "flex", gap: 5, alignItems: "center" }}>✉ {email}</span>}
              </div>
            </div>
          </div>
          <StatusChip status={status} size="lg" />
        </div>

        {/* Clickable mini stat cards — click to filter */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {[
            { filterKey: "all",      label: "Total Forms", value: cpForms.length, numColor: "#fff"     },
            { filterKey: "verified", label: "Verified",    value: verifiedCount,  numColor: "#86efac"  },
            { filterKey: "pending",  label: "Pending",     value: pendingCount,   numColor: "#fde68a"  },
            { filterKey: "rejected", label: "Rejected",    value: rejectedCount,  numColor: "#fca5a5"  },
          ].map(s => {
            const isActive = activeFilter === s.filterKey;
            return (
              <div
                key={s.filterKey}
                onClick={() => setActiveFilter(s.filterKey)}
                style={{ background: isActive ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "12px 20px", minWidth: 90, border: isActive ? "1.5px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.15s", transform: isActive ? "translateY(-1px)" : "none", boxShadow: isActive ? "0 4px 14px rgba(0,0,0,0.15)" : "none" }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: s.numColor }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 1, fontWeight: isActive ? 700 : 400 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forms content - pulled up over hero */}
      <div style={{ margin: "-60px 24px 28px", position: "relative" }}>
        {/* Header card with filter tabs */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 14, overflow: "hidden" }}>
          {/* Title row */}
          <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Submitted Forms</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                {filteredForms.length} of {cpForms.length} forms
                {activeFilter !== "all" && <span style={{ color: "#1d4ed8", fontWeight: 600 }}> · {activeFilter} filter active</span>}
              </div>
            </div>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                style={{ background: "#f3f4f6", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}
              >✕ Clear filter</button>
            )}
          </div>

          {/* Filter tab pills */}
          <div style={{ padding: "12px 22px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTER_TABS.map(tab => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "7px 16px",
                    borderRadius: 22,
                    border: isActive ? "none" : "1.5px solid #e5e7eb",
                    background: isActive ? tab.activeBg : "#fff",
                    color: isActive ? tab.activeColor : "#6b7280",
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    boxShadow: isActive ? `0 2px 8px ${tab.dot}33` : "none",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: isActive ? tab.dot : "#d1d5db", flexShrink: 0, transition: "background 0.15s" }} />
                  {tab.label}
                  <span style={{ background: isActive ? tab.activeColor : "#e5e7eb", color: isActive ? "#fff" : "#6b7280", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700, transition: "all 0.15s" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {cpFormsStatus === "loading" && <Spinner label="Loading forms…" />}
        {cpFormsError  && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginTop: 4 }}>⚠ {cpFormsError}</div>}

        {cpFormsStatus === "succeeded" && cpForms.length === 0 && (
          <EmptyState icon="📂" title="No submissions yet" sub="This channel partner hasn't submitted any survey forms." />
        )}

        {cpFormsStatus === "succeeded" && cpForms.length > 0 && filteredForms.length === 0 && (
          <EmptyState icon="🔍" title={`No ${activeFilter} forms`} sub={`This CP has no ${activeFilter} submissions. Try a different filter.`} />
        )}

        {cpFormsStatus === "succeeded" && filteredForms.map((form, i) => (
          <SurveyCard key={form._id ?? form.formId ?? form.surveyId ?? i} form={form} index={i} />
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  CP LIST PAGE (first view)
// ═════════════════════════════════════════════════════════════════════════════
const CpListPage = ({ cpList, cpListStatus, cpListError, wardId, onCpSelect, onRefresh }) => {
  const [search, setSearch] = useState("");

  const filtered = cpList.filter(cp => {
    const q = search.toLowerCase();
    return [cp.name,cp.fullName,cp.cpName,cp.phone,cp.mobile,cp.mobileNumber,cp.phoneNumber,cp.email]
      .some(v => (v ?? "").toLowerCase().includes(q));
  });

  const activeCps = cpList.filter(c =>
    c.isActive !== undefined ? Boolean(c.isActive) : (c.status ?? "active").toLowerCase() === "active"
  ).length;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "28px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#111827", letterSpacing: -0.4 }}>Channel Partners</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>Ward CP list · Select a partner to review their survey submissions</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={cpListStatus === "loading"}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: cpListStatus === "loading" ? 0.7 : 1, boxShadow: "0 2px 8px rgba(29,78,216,0.3)" }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ transform: cpListStatus === "loading" ? "none" : "unset" }}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total CPs", value: cpList.length, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Active",    value: activeCps,     color: "#059669", bg: "#ecfdf5" },
          { label: "Inactive",  value: cpList.length - activeCps, color: "#9ca3af", bg: "#f9fafb" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#111827" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {cpListError && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>⚠ {cpListError}</div>}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email…"
          style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, color: "#111827", background: "#fff", boxSizing: "border-box", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        />
      </div>

      {/* Table */}
      {cpListStatus === "loading" && <Spinner label="Loading channel partners…" />}

      {cpListStatus !== "loading" && filtered.length === 0 && (
        <EmptyState icon="👥" title={search ? "No results" : "No channel partners"} sub={search ? "Try a different search term." : "No CPs are registered in this ward yet."} />
      )}

      {filtered.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #f3f4f6" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 110px 48px", gap: 0, padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            {["Partner", "Contact", "Joined", "Status", ""].map((h,i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 }}>{h}</div>
            ))}
          </div>

          {/* Table rows */}
          {filtered.map((cp, idx) => {
            const cpId   = cp._id ?? cp.userId ?? cp.cpId;
            const name   = cp.name ?? cp.fullName ?? cp.cpName ?? "Unknown";
            const phone  = cp.phone ?? cp.mobile ?? cp.mobileNumber ?? cp.phoneNumber ?? "";
            const email  = cp.email ?? "";
            const status = cp.status ?? (cp.isActive !== undefined ? (cp.isActive ? "active" : "inactive") : "active");
            const joined = cp.createdAt ?? cp.joinedAt ?? null;

            return (
              <div
                key={cpId}
                onClick={() => onCpSelect(cp, idx)}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 110px 48px", gap: 0, padding: "14px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer", transition: "background 0.1s", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                {/* Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={name} size={38} index={idx} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{name}</div>
                    {cp.cpCode && <div style={{ fontSize: 11, color: "#9ca3af" }}>#{cp.cpCode}</div>}
                  </div>
                </div>
                {/* Contact */}
                <div>
                  {phone && <div style={{ fontSize: 13, color: "#374151" }}>{phone}</div>}
                  {email && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{email}</div>}
                </div>
                {/* Joined */}
                <div style={{ fontSize: 13, color: "#6b7280" }}>{formatDate(joined)}</div>
                {/* Status */}
                <div><StatusChip status={status} /></div>
                {/* Arrow */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="13" height="13" fill="none" stroke="#1d4ed8" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT: CpTable — drives which "page" is shown
// ═════════════════════════════════════════════════════════════════════════════
const CpTable = ({ wardId: propWardId }) => {
  const dispatch = useDispatch();

  const { user }   = useSelector((s) => s.auth || {});
  const wardInfo   = useSelector((s) => s.areaChart?.wardInfo);

  const getStoredWardId = () => {
    try {
      const loc = JSON.parse(localStorage.getItem("locationData") || sessionStorage.getItem("locationData") || "{}");
      return loc?.wardId || loc?.ward_id || loc?.id || null;
    } catch { return null; }
  };

  const wardId =
    propWardId || user?.wardId || user?.ward?.wardId || user?.ward?._id ||
    (typeof user?.ward === "string" ? user.ward : null) ||
    wardInfo?.wardId || wardInfo?.id || getStoredWardId();

  const userId = user?._id || user?.userId;

  const cpListRaw    = useSelector(selectCpPartnerList);
  const cpList       = Array.isArray(cpListRaw) ? cpListRaw : [];
  const cpListStatus = useSelector(selectCpPartnerListStatus);
  const cpListError  = useSelector(selectCpPartnerListError);

  const cpFormsRaw    = useSelector(selectSelectedCpForms);
  const cpForms       = Array.isArray(cpFormsRaw) ? cpFormsRaw : [];
  const cpFormsStatus = useSelector(selectSelectedCpFormsStatus);
  const cpFormsError  = useSelector(selectSelectedCpFormsError);

  const [selectedCp, setSelectedCp] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!wardId && userId) dispatch(getLocationByWardHeadId(userId));
  }, [wardId, userId, dispatch]);

  useEffect(() => {
    if (wardId) dispatch(fetchChannelPartnersByWard(wardId));
    return () => dispatch(clearSelectedCpForms());
  }, [wardId, dispatch]);

  const handleCpSelect = (cp, idx) => {
    setSelectedCp(cp);
    setSelectedIdx(idx);
    const cpId = cp._id ?? cp.userId ?? cp.cpId;
    dispatch(fetchCpSubmittedDataByUserId(cpId));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedCp(null);
    dispatch(clearSelectedCpForms());
    window.scrollTo(0, 0);
  };

  if (selectedCp) {
    return (
      <CpFormsPage
        cp={selectedCp}
        cpForms={cpForms}
        cpFormsStatus={cpFormsStatus}
        cpFormsError={cpFormsError}
        onBack={handleBack}
        cpIndex={selectedIdx}
      />
    );
  }

  return (
    <CpListPage
      cpList={cpList}
      cpListStatus={cpListStatus}
      cpListError={cpListError}
      wardId={wardId}
      onCpSelect={handleCpSelect}
      onRefresh={() => wardId && dispatch(fetchChannelPartnersByWard(wardId))}
    />
  );
};

export default CpTable;