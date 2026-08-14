import React, { useEffect, useState, useCallback } from "react";
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

import ImageLightbox from "./ImageLightbox.jsx";
import BuildingExplorerView from "./BuildingExplorerView.jsx";

// ─── Survey / Form Card ───────────────────────────────────────────────────────
const SurveyCard = ({ form, index, onOpen3D }) => {
  const surveyId    = form.surveyId ?? form._id ?? form.formId ?? form.submissionId;
  const status      = form.status ?? "SUBMITTED";
  const isVerified  = status?.toUpperCase() === "VERIFIED";
  const isRejected  = status?.toUpperCase() === "REJECTED";
  const surveyTitle = form.surveyNumber
    ? `Survey #${String(form.surveyNumber).startsWith("D") ? form.surveyNumber : "D-" + String(form.surveyNumber).padStart(2, "0")}`
    : form.formType ?? form.formName ?? "Survey";

  const images = Array.isArray(form.images) ? form.images : [];
  const floorsCount = Array.isArray(form.floors) ? form.floors.length : form.numberOfFloors || 0;

  return (
    <div
      onClick={() => onOpen3D(form)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        padding: "18px 22px",
        marginBottom: 14,
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#93c5fd";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(29,78,216,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: isVerified ? "#d1fae5" : isRejected ? "#fee2e2" : "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: isVerified ? "#065f46" : isRejected ? "#991b1b" : "#1d4ed8",
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
            {surveyTitle}
            {form.locationAddress && <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 400 }}>· {form.locationAddress}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {form.locationType && (
              <span style={{ background: "#f0f9ff", color: "#0369a1", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                🏢 {form.locationType} ({floorsCount} {floorsCount === 1 ? "Floor" : "Floors"})
              </span>
            )}
            {images.length > 0 && (
              <span style={{ background: "#fdf4ff", color: "#86198f", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                📷 {images.length} {images.length === 1 ? "Photo" : "Photos"}
              </span>
            )}
            {form.createdAt && <span>Submitted {formatDate(form.createdAt)}</span>}
            <span>ID: …{String(surveyId).slice(-6)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <StatusChip status={status} size="lg" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen3D(form);
          }}
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 3px 10px rgba(29,78,216,0.25)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🏢 Explore 3D Building →
        </button>
      </div>
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
  const [selectedSurveyFor3D, setSelectedSurveyFor3D] = useState(null);

  if (selectedSurveyFor3D) {
    return (
      <BuildingExplorerView
        form={selectedSurveyFor3D}
        cp={cp}
        onBack={() => setSelectedSurveyFor3D(null)}
      />
    );
  }

  const name   = cp.name ?? cp.fullName ?? cp.cpName ?? "Unknown";
  const phone  = cp.phone ?? cp.mobile ?? cp.mobileNumber ?? cp.phoneNumber ?? "";
  const email  = cp.email ?? "";
  const status = cp.status ?? (cp.isActive ? "active" : "inactive");

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
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

        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              borderRadius: 12,
              padding: "12px 20px",
              minWidth: 120,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{cpForms.length}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>Total Submitted Forms</div>
          </div>
        </div>
      </div>

      <div style={{ margin: "-60px 24px 28px", position: "relative" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Submitted Forms</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                {cpForms.length} {cpForms.length === 1 ? "survey form" : "survey forms"} submitted
              </div>
            </div>
          </div>
        </div>

        {cpFormsStatus === "loading" && <Spinner label="Loading forms…" />}
        {cpFormsError  && <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginTop: 4 }}>⚠ {cpFormsError}</div>}

        {cpFormsStatus === "succeeded" && cpForms.length === 0 && (
          <EmptyState icon="📂" title="No submissions yet" sub="This channel partner hasn't submitted any survey forms." />
        )}
        {cpFormsStatus === "succeeded" && cpForms.map((form, i) => (
          <SurveyCard
            key={form._id ?? form.formId ?? form.surveyId ?? i}
            form={form}
            index={i}
            onOpen3D={setSelectedSurveyFor3D}
          />
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  CP LIST PAGE
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
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Refresh
        </button>
      </div>

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

      <div style={{ position: "relative", marginBottom: 20 }}>
        <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email…"
          style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, color: "#111827", background: "#fff", boxSizing: "border-box", outline: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        />
      </div>

      {cpListStatus === "loading" && <Spinner label="Loading channel partners…" />}

      {cpListStatus !== "loading" && filtered.length === 0 && (
        <EmptyState icon="👥" title={search ? "No results" : "No channel partners"} sub={search ? "Try a different search term." : "No CPs are registered in this ward yet."} />
      )}

      {filtered.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #f3f4f6" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 110px 48px", gap: 0, padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            {["Partner", "Contact", "Joined", "Status", ""].map((h,i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.6 }}>{h}</div>
            ))}
          </div>

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
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={name} size={38} index={idx} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{name}</div>
                    {cp.cpCode && <div style={{ fontSize: 11, color: "#9ca3af" }}>#{cp.cpCode}</div>}
                  </div>
                </div>
                <div>
                  {phone && <div style={{ fontSize: 13, color: "#374151" }}>{phone}</div>}
                  {email && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{email}</div>}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{formatDate(joined)}</div>
                <div><StatusChip status={status} /></div>
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
//  ROOT: CpTable
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

  const [selectedCp, setSelectedCp]   = useState(null);
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