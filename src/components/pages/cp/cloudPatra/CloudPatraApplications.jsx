import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCloudPatraApplicationsByWard,
  updateCloudPatraApplicationStatus,
  scheduleCloudPatraInterview,
  selectCpApplications,
  selectCpApplicationsStatus,
  selectCpAppUpdateStatus,
  selectCpScheduleStatus,
  resetCpAppUpdateStatus,
  resetCpScheduleStatus,
} from "../../../redux/slices/Cponboardingslice";
import { getLocationByWardHeadId } from "../../../redux/slices/areaChartSlice";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  DRAFT:               { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
  SUBMITTED:           { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  UNDER_REVIEW:        { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  APPROVED:            { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  REJECTED:            { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  TRAINING_PENDING:    { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
  TRAINING_COMPLETED:  { bg: "#F0FDF4", color: "#166534", dot: "#16A34A" },
  ACTIVE:              { bg: "#F0FDF4", color: "#14532D", dot: "#15803D" },
  WITHDRAWN:           { bg: "#F8FAFC", color: "#475569", dot: "#94A3B8" },
};

const ALL_STATUSES = [
  "SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED",
  "TRAINING_PENDING","TRAINING_COMPLETED","ACTIVE","WITHDRAWN",
];

const INTERVIEW_MODES = ["IN_PERSON","ONLINE","PHONE"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status.replace(/_/g, " ")}
    </span>
  );
};

const Avatar = ({ name = "" }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#4F7FFF","#7C3AED","#0891B2","#059669","#DC2626","#D97706"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
    }}>{initials || "?"}</div>
  );
};

// ─── Update Status Modal ──────────────────────────────────────────────────────
const UpdateStatusModal = ({ app, onClose, onSave, loading }) => {
  const [status, setStatus] = useState(app?.status || "SUBMITTED");
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: 460 }}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalEyebrow}>Application Review</p>
            <h2 style={styles.modalTitle}>Update Status</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* Applicant Info */}
          <div style={styles.infoBox}>
            <Avatar name={app?.fullName || "?"} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                {app?.fullName || "—"}
              </p>
              <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>
                {app?.mobileNumber || "—"} · {app?.appliedTerritory || "—"}
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Current Status</label>
            <div style={{ marginTop: 6 }}>
              <StatusBadge status={app?.status || "SUBMITTED"} />
            </div>
          </div>

          {/* New Status */}
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Change To</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: "1.5px solid",
                    borderColor: status === s ? "#4F7FFF" : "#E2E8F0",
                    background: status === s ? "#EFF4FF" : "#fff",
                    color: status === s ? "#2752D8" : "#374151",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    textAlign: "left", transition: "all 0.15s",
                  }}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Rejection reason */}
          {status === "REJECTED" && (
            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}>Rejection Reason <span style={{ color: "#EF4444" }}>*</span></label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={3}
                style={styles.textarea}
              />
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button
            onClick={() => onSave({ status, rejectionReason })}
            disabled={loading || (status === "REJECTED" && !rejectionReason.trim())}
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Schedule Interview Modal ─────────────────────────────────────────────────
const ScheduleInterviewModal = ({ app, wardChairmanUserId, onClose, onSave, loading }) => {
  const [form, setForm] = useState({
    scheduledAt: "",
    durationMinutes: 30,
    interviewMode: "IN_PERSON",
    locationName: "",
    locationAddress: "",
    latitude: "",
    longitude: "",
    meetingLink: "",
    interviewInstructions: "",
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    onSave({
      applicationId: app.applicationId || app._id,
      scheduledByUserId: wardChairmanUserId,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      durationMinutes: Number(form.durationMinutes),
      interviewMode: form.interviewMode,
      locationName: form.locationName || null,
      locationAddress: form.locationAddress || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      meetingLink: form.meetingLink || null,
      interviewInstructions: form.interviewInstructions || null,
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: 540 }}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalEyebrow}>Interview Scheduling</p>
            <h2 style={styles.modalTitle}>Schedule Interview</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ padding: "24px 28px", maxHeight: "65vh", overflowY: "auto" }}>
          {/* Applicant Info */}
          <div style={styles.infoBox}>
            <Avatar name={app?.fullName || "?"} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                {app?.fullName || "—"}
              </p>
              <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>
                {app?.appliedTerritory || "—"}
              </p>
            </div>
          </div>

          {/* Date & Duration row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={styles.label}>Date & Time <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => set("scheduledAt", e.target.value)}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Duration (minutes)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={e => set("durationMinutes", e.target.value)}
                min={15} step={15}
                style={styles.input}
              />
            </div>
          </div>

          {/* Interview Mode */}
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Interview Mode</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {INTERVIEW_MODES.map(m => (
                <button
                  key={m}
                  onClick={() => set("interviewMode", m)}
                  style={{
                    flex: 1, padding: "9px 8px", borderRadius: 8, border: "1.5px solid",
                    borderColor: form.interviewMode === m ? "#4F7FFF" : "#E2E8F0",
                    background: form.interviewMode === m ? "#EFF4FF" : "#fff",
                    color: form.interviewMode === m ? "#2752D8" : "#374151",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {m === "IN_PERSON" ? "🏢 In-Person"
                    : m === "ONLINE" ? "🎥 Online"
                    : "📞 Phone"}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional fields */}
          {form.interviewMode === "IN_PERSON" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Location Name</label>
                <input placeholder="e.g. Udyami Office, Bengaluru"
                  value={form.locationName} onChange={e => set("locationName", e.target.value)}
                  style={styles.input} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Full Address</label>
                <input placeholder="Street, Area, City"
                  value={form.locationAddress} onChange={e => set("locationAddress", e.target.value)}
                  style={styles.input} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={styles.label}>Latitude (optional)</label>
                  <input placeholder="12.9716" value={form.latitude}
                    onChange={e => set("latitude", e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Longitude (optional)</label>
                  <input placeholder="77.5946" value={form.longitude}
                    onChange={e => set("longitude", e.target.value)} style={styles.input} />
                </div>
              </div>
            </>
          )}

          {form.interviewMode === "ONLINE" && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Meeting Link <span style={{ color: "#EF4444" }}>*</span></label>
              <input placeholder="https://meet.google.com/..."
                value={form.meetingLink} onChange={e => set("meetingLink", e.target.value)}
                style={styles.input} />
            </div>
          )}

          {form.interviewMode === "PHONE" && (
            <div style={{ ...styles.infoBox, background: "#F0F9FF", border: "1px solid #BAE6FD", marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>📞</span>
              <p style={{ margin: 0, color: "#0369A1", fontSize: 13 }}>
                Applicant will be contacted on their registered mobile number.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label style={styles.label}>Instructions for Applicant (optional)</label>
            <textarea
              value={form.interviewInstructions}
              onChange={e => set("interviewInstructions", e.target.value)}
              placeholder="e.g. Please bring all required documents..."
              rows={3}
              style={styles.textarea}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.scheduledAt || (form.interviewMode === "ONLINE" && !form.meetingLink)}
            style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Scheduling…" : "Confirm Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Application Detail Drawer ────────────────────────────────────────────────
const AppDetailDrawer = ({ app, onClose, onUpdateStatus, onSchedule }) => {
  if (!app) return null;

  const fields = [
    { label: "Full Name", value: app.fullName },
    { label: "Date of Birth", value: app.dateOfBirth },
    { label: "Mobile", value: app.mobileNumber },
    { label: "Locality", value: app.residenceLocality },
    { label: "Applied Territory", value: app.appliedTerritory },
    { label: "Business Address", value: app.businessOfficeAddress },
    { label: "Ownership", value: app.ownership },
    { label: "Years of Experience", value: app.yearsOfExperience },
    { label: "Expected Subscribers (Month 1)", value: app.expectedSubscribersMonthOne },
    { label: "Submitted At", value: app.submittedAt ? new Date(app.submittedAt).toLocaleString() : "—" },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
      background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
      zIndex: 1000, display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px", borderBottom: "1px solid #F1F5F9",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar name={app.fullName || "?"} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: 15 }}>
              {app.fullName || "—"}
            </p>
            <StatusBadge status={app.status || "SUBMITTED"} />
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase" }}>
          Applicant Details
        </p>
        {fields.map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "10px 0", borderBottom: "1px solid #F8FAFC",
          }}>
            <span style={{ color: "#64748B", fontSize: 13 }}>{label}</span>
            <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 500, maxWidth: 220, textAlign: "right" }}>
              {value || "—"}
            </span>
          </div>
        ))}

        {app.rejectionReason && (
          <div style={{
            marginTop: 16, padding: "12px 14px", borderRadius: 8,
            background: "#FEF2F2", border: "1px solid #FECACA",
          }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#B91C1C" }}>
              Rejection Reason
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7F1D1D" }}>
              {app.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid #F1F5F9",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <button onClick={() => onUpdateStatus(app)} style={styles.primaryBtn}>
          ✏️ Update Status
        </button>
        <button onClick={() => onSchedule(app)} style={styles.outlineBtn}>
          📅 Schedule Interview
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CloudPatraApplications() {
  const dispatch = useDispatch();

  // Redux state
  const applications   = useSelector(selectCpApplications);
  const fetchStatus    = useSelector(selectCpApplicationsStatus);
  const appUpdateStatus= useSelector(selectCpAppUpdateStatus);
  const scheduleStatus = useSelector(selectCpScheduleStatus);

  // Auth & Location state
  const { user } = useSelector(s => s.auth);
  const wardInfo = useSelector(s => s.areaChart?.wardInfo);

  // Helper to extract wardId from stored location data
  const getStoredWardId = () => {
    try {
      const loc = JSON.parse(
        localStorage.getItem("locationData") ||
        sessionStorage.getItem("locationData") ||
        "{}"
      );
      return loc?.wardId || loc?.ward_id || null;
    } catch {
      return null;
    }
  };

  const wardId =
    user?.wardId ||
    user?.ward?.wardId ||
    user?.ward?._id ||
    (typeof user?.ward === "string" ? user.ward : null) ||
    wardInfo?.wardId ||
    getStoredWardId();

  const userId = user?._id || user?.userId;

  // UI state
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp]   = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  // 1. Fetch location hierarchy if wardId is not available yet
  useEffect(() => {
    if (!wardId && userId) {
      dispatch(getLocationByWardHeadId(userId));
    }
  }, [wardId, userId, dispatch]);

  // 2. Fetch applications when wardId is available
  useEffect(() => {
    if (wardId) dispatch(fetchCloudPatraApplicationsByWard(wardId));
  }, [wardId, dispatch]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  // Success side-effects
  useEffect(() => {
    if (appUpdateStatus === "succeeded") {
      setUpdateTarget(null);
      dispatch(resetCpAppUpdateStatus());
      setToast({ type: "success", msg: "Application status updated." });
      if (wardId) dispatch(fetchCloudPatraApplicationsByWard(wardId));
    }
  }, [appUpdateStatus]);

  useEffect(() => {
    if (scheduleStatus === "succeeded") {
      setScheduleTarget(null);
      dispatch(resetCpScheduleStatus());
      setToast({ type: "success", msg: "Interview scheduled successfully." });
    }
  }, [scheduleStatus]);

  // Filtered list
  const filtered = applications.filter(app => {
    const matchSearch = (app.fullName || "").toLowerCase().includes(search.toLowerCase())
      || (app.mobileNumber || "").includes(search)
      || (app.appliedTerritory || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stat counts
  const counts = {};
  applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

  const stats = [
    { label: "Total", value: applications.length, color: "#4F7FFF", bg: "#EFF4FF" },
    { label: "Under Review", value: counts.UNDER_REVIEW || 0, color: "#B45309", bg: "#FFFBEB" },
    { label: "Approved", value: counts.APPROVED || 0, color: "#15803D", bg: "#F0FDF4" },
    { label: "Rejected", value: counts.REJECTED || 0, color: "#B91C1C", bg: "#FEF2F2" },
    { label: "Active", value: counts.ACTIVE || 0, color: "#14532D", bg: "#DCFCE7" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 24, zIndex: 9999,
          background: toast.type === "success" ? "#16A34A" : "#DC2626",
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontSize: 14, fontWeight: 500, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #F1F5F9",
        padding: "20px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Cloud Patra · Channel Partner
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
            Applications
          </h1>
        </div>
        <button
          onClick={() => wardId && dispatch(fetchCloudPatraApplicationsByWard(wardId))}
          style={{ ...styles.outlineBtn, padding: "8px 16px" }}
        >
          {fetchStatus === "loading" ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 12, padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #F1F5F9",
              cursor: "pointer", transition: "box-shadow 0.15s",
            }}
              onClick={() => setFilterStatus(
                s.label === "Total" ? "ALL"
                  : s.label === "Under Review" ? "UNDER_REVIEW"
                  : s.label.toUpperCase()
              )}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s.label}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search & Filter ── */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
          marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, mobile, or territory..."
              style={{ ...styles.input, paddingLeft: 36, margin: 0, width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...styles.input, width: 180, margin: 0 }}
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          {(search || filterStatus !== "ALL") && (
            <button
              onClick={() => { setSearch(""); setFilterStatus("ALL"); }}
              style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, cursor: "pointer" }}
            >
              Clear
            </button>
          )}
          <span style={{ color: "#94A3B8", fontSize: 13 }}>
            {filtered.length} of {applications.length} applications
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{
          background: "#fff", borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
          overflow: "hidden",
        }}>
          {fetchStatus === "loading" ? (
            <div style={styles.center}>
              <div style={styles.spinner} />
              <p style={{ color: "#64748B", marginTop: 12 }}>Loading applications…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.center}>
              <span style={{ fontSize: 40 }}>📭</span>
              <p style={{ color: "#64748B", marginTop: 12, fontSize: 15 }}>No applications found.</p>
              {search || filterStatus !== "ALL"
                ? <p style={{ color: "#94A3B8", fontSize: 13 }}>Try adjusting your search or filter.</p>
                : <p style={{ color: "#94A3B8", fontSize: 13 }}>No applications have been submitted to this ward yet.</p>}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                  {["Applicant","Territory","Sub-Vertical","Submitted","Status","Actions"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#94A3B8",
                      textTransform: "uppercase", letterSpacing: 0.6,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app._id || app.applicationId || i} style={{
                    borderBottom: "1px solid #F8FAFC",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Applicant */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={app.fullName || "?"} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                            {app.fullName || "—"}
                          </p>
                          <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>
                            {app.mobileNumber || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Territory */}
                    <td style={{ padding: "14px 16px", color: "#374151", fontSize: 13 }}>
                      {app.appliedTerritory || "—"}
                    </td>
                    {/* Sub-Vertical */}
                    <td style={{ padding: "14px 16px", color: "#374151", fontSize: 13 }}>
                      {app.subVerticalName || app.subVerticalId || "—"}
                    </td>
                    {/* Submitted */}
                    <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 13 }}>
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      }) : "—"}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={app.status || "SUBMITTED"} />
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setSelectedApp(app)}
                          style={styles.tableActionBtn}
                          title="View Details"
                        >👁</button>
                        <button
                          onClick={() => setUpdateTarget(app)}
                          style={styles.tableActionBtn}
                          title="Update Status"
                        >✏️</button>
                        <button
                          onClick={() => setScheduleTarget(app)}
                          style={{ ...styles.tableActionBtn, color: "#4F7FFF" }}
                          title="Schedule Interview"
                        >📅</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {selectedApp && (
        <>
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 999,
          }} onClick={() => setSelectedApp(null)} />
          <AppDetailDrawer
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
            onUpdateStatus={(app) => { setSelectedApp(null); setUpdateTarget(app); }}
            onSchedule={(app) => { setSelectedApp(null); setScheduleTarget(app); }}
          />
        </>
      )}

      {/* ── Update Status Modal ── */}
      {updateTarget && (
        <UpdateStatusModal
          app={updateTarget}
          loading={appUpdateStatus === "loading"}
          onClose={() => { setUpdateTarget(null); dispatch(resetCpAppUpdateStatus()); }}
          onSave={({ status, rejectionReason }) => {
            dispatch(updateCloudPatraApplicationStatus({
              applicationId: updateTarget.applicationId || updateTarget._id,
              userId,
              status,
              rejectionReason: rejectionReason || undefined,
            }));
          }}
        />
      )}

      {/* ── Schedule Interview Modal ── */}
      {scheduleTarget && (
        <ScheduleInterviewModal
          app={scheduleTarget}
          wardChairmanUserId={userId}
          loading={scheduleStatus === "loading"}
          onClose={() => { setScheduleTarget(null); dispatch(resetCpScheduleStatus()); }}
          onSave={(payload) => dispatch(scheduleCloudPatraInterview(payload))}
        />
      )}
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)",
    zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 16, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column", maxHeight: "90vh",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "22px 28px", borderBottom: "1px solid #F1F5F9",
  },
  modalEyebrow: {
    margin: 0, fontSize: 11, fontWeight: 700, color: "#4F7FFF",
    textTransform: "uppercase", letterSpacing: 1,
  },
  modalTitle: {
    margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#0F172A",
  },
  modalFooter: {
    padding: "16px 28px", borderTop: "1px solid #F1F5F9",
    display: "flex", justifyContent: "flex-end", gap: 10,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    border: "1px solid #E2E8F0", background: "#fff",
    color: "#64748B", fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  label: {
    display: "block", fontSize: 12, fontWeight: 600, color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
    borderRadius: 8, fontSize: 13, color: "#0F172A",
    outline: "none", background: "#fff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
    borderRadius: 8, fontSize: 13, color: "#0F172A",
    outline: "none", resize: "vertical", fontFamily: "inherit",
    boxSizing: "border-box",
  },
  primaryBtn: {
    padding: "10px 20px", borderRadius: 8, border: "none",
    background: "#4F7FFF", color: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    transition: "opacity 0.15s",
  },
  outlineBtn: {
    padding: "10px 20px", borderRadius: 8,
    border: "1.5px solid #E2E8F0", background: "#fff",
    color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px", borderRadius: 8,
    border: "1.5px solid #E2E8F0", background: "#fff",
    color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  tableActionBtn: {
    width: 30, height: 30, borderRadius: 6, border: "1px solid #E2E8F0",
    background: "#fff", cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  infoBox: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", background: "#F8FAFC",
    borderRadius: 10, marginBottom: 20,
    border: "1px solid #F1F5F9",
  },
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "60px 20px", textAlign: "center",
  },
  spinner: {
    width: 36, height: 36, borderRadius: "50%",
    border: "3px solid #E2E8F0", borderTop: "3px solid #4F7FFF",
    animation: "spin 0.8s linear infinite",
  },
};