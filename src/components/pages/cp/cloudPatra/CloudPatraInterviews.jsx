import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCloudPatraInterviewsByWardChairman,
  updateCloudPatraInterviewStatus,
  selectCpInterviews,
  selectCpInterviewsStatus,
  selectCpInterviewUpdateStatus,
  resetCpInterviewUpdateStatus,
} from "../../../redux/slices/Cponboardingslice";

// ─── Interview Status Config ──────────────────────────────────────────────────
const STATUS_STYLES = {
  SCHEDULED:    { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  RESCHEDULED:  { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  COMPLETED:    { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  CANCELLED:    { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
  NO_SHOW:      { bg: "#F8FAFC", color: "#475569", dot: "#94A3B8" },
};

const MODE_STYLES = {
  IN_PERSON: { icon: "🏢", label: "In-Person", bg: "#F0FDF4", color: "#15803D" },
  ONLINE:    { icon: "🎥", label: "Online",    bg: "#EFF6FF", color: "#2563EB" },
  PHONE:     { icon: "📞", label: "Phone",     bg: "#FFF7ED", color: "#C2410C" },
};

const ALL_INTERVIEW_STATUSES = [
  "RESCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.SCHEDULED;
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

const ModeBadge = ({ mode }) => {
  const m = MODE_STYLES[mode] || { icon: "📋", label: mode, bg: "#F8FAFC", color: "#64748B" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 6,
      background: m.bg, color: m.color,
      fontSize: 12, fontWeight: 600,
    }}>
      {m.icon} {m.label}
    </span>
  );
};

const Avatar = ({ name = "" }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#4F7FFF", "#7C3AED", "#0891B2", "#059669", "#DC2626", "#D97706"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
    }}>{initials || "?"}</div>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "10px 0", borderBottom: "1px solid #F8FAFC", gap: 12,
  }}>
    <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: 0.4, flexShrink: 0, paddingTop: 2 }}>
      {label}
    </span>
    <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 500, textAlign: "right" }}>
      {value || "—"}
    </span>
  </div>
);

// ─── Update Interview Status Modal ────────────────────────────────────────────
const UpdateInterviewStatusModal = ({ interview, onClose, onSave, loading }) => {
  const [status, setStatus]               = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [newScheduledAt, setNewScheduledAt]     = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [interviewNotes, setInterviewNotes]     = useState("");

  const isValid = () => {
    if (!status) return false;
    if (status === "RESCHEDULED") return rescheduleReason.trim() && newScheduledAt;
    if (status === "CANCELLED")   return cancellationReason.trim();
    return true;
  };

  const handleSave = () => {
    const payload = {
      interviewId: interview.interviewId || interview._id,
      status,
    };
    if (status === "RESCHEDULED") {
      payload.rescheduleReason = rescheduleReason;
      payload.scheduledAt = new Date(newScheduledAt).toISOString();
    }
    if (status === "CANCELLED") {
      payload.cancellationReason = cancellationReason;
    }
    if (status === "COMPLETED") {
      payload.interviewNotes = interviewNotes || undefined;
    }
    onSave(payload);
  };

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: 480 }}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalEyebrow}>Interview Management</p>
            <h2 style={styles.modalTitle}>Update Interview Status</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ padding: "22px 28px", overflowY: "auto", maxHeight: "68vh" }}>

          {/* Interview info summary */}
          <div style={styles.infoBox}>
            <Avatar name={interview?.applicantName || "?"} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                {interview?.applicantName || "—"}
              </p>
              <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: 12 }}>
                {interview?.scheduledAt
                  ? new Date(interview.scheduledAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "—"}{" "}
                · {interview?.durationMinutes ? `${interview.durationMinutes} min` : ""}
              </p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <StatusBadge status={interview?.status || "SCHEDULED"} />
            </div>
          </div>

          {/* Status picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Change Status To</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {ALL_INTERVIEW_STATUSES.map(s => {
                const st = STATUS_STYLES[s] || {};
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, border: "1.5px solid",
                      borderColor: status === s ? st.dot || "#4F7FFF" : "#E2E8F0",
                      background: status === s ? st.bg || "#EFF4FF" : "#fff",
                      color: status === s ? st.color || "#2752D8" : "#374151",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: status === s ? st.dot || "#4F7FFF" : "#CBD5E1",
                      flexShrink: 0,
                    }} />
                    {s.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional fields */}
          {status === "RESCHEDULED" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>
                  New Date & Time <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newScheduledAt}
                  onChange={e => setNewScheduledAt(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>
                  Reason for Rescheduling <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  placeholder="Why is this interview being rescheduled?"
                  rows={3}
                  style={styles.textarea}
                />
              </div>
            </>
          )}

          {status === "CANCELLED" && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>
                Cancellation Reason <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                placeholder="Why is this interview being cancelled?"
                rows={3}
                style={styles.textarea}
              />
            </div>
          )}

          {status === "COMPLETED" && (
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Interview Notes (optional)</label>
              <textarea
                value={interviewNotes}
                onChange={e => setInterviewNotes(e.target.value)}
                placeholder="Add any notes about the interview outcome..."
                rows={3}
                style={styles.textarea}
              />
            </div>
          )}

          {status === "NO_SHOW" && (
            <div style={{
              ...styles.infoBox,
              background: "#FFF7ED", border: "1px solid #FED7AA", marginBottom: 0,
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ margin: 0, color: "#C2410C", fontSize: 13 }}>
                Marking this interview as <strong>No Show</strong>. The applicant did not attend.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading || !isValid()}
            style={{
              ...styles.primaryBtn,
              opacity: (loading || !isValid()) ? 0.5 : 1,
              cursor: (loading || !isValid()) ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Interview Detail Drawer ──────────────────────────────────────────────────
const InterviewDetailDrawer = ({ interview, onClose, onUpdateStatus }) => {
  if (!interview) return null;

  const scheduledDate = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleString("en-IN", {
        weekday: "long", day: "2-digit", month: "long",
        year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 440,
      background: "#fff", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
      zIndex: 1000, display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px", borderBottom: "1px solid #F1F5F9",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar name={interview.applicantName || "?"} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: 15 }}>
              {interview.applicantName || "—"}
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              <StatusBadge status={interview.status || "SCHEDULED"} />
              <ModeBadge mode={interview.interviewMode} />
            </div>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

        {/* Scheduled time highlight card */}
        <div style={{
          background: "linear-gradient(135deg, #4F7FFF 0%, #7C3AED 100%)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 20, color: "#fff",
        }}>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: 0.8 }}>
            SCHEDULED FOR
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700 }}>
            {scheduledDate}
          </p>
          {interview.durationMinutes && (
            <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
              Duration: {interview.durationMinutes} minutes
            </p>
          )}
        </div>

        {/* Applicant Contact */}
        <p style={styles.sectionLabel}>Applicant Info</p>
        <InfoRow label="Name" value={interview.applicantName} />
        <InfoRow label="Email" value={interview.applicantEmail} />
        <InfoRow label="Mobile" value={interview.applicantMobileNumber} />
        <InfoRow label="Ward" value={interview.wardName} />
        <InfoRow label="Sub-Vertical" value={interview.subVerticalName} />

        {/* Interview Details */}
        <p style={{ ...styles.sectionLabel, marginTop: 20 }}>Interview Details</p>
        <InfoRow label="Mode" value={<ModeBadge mode={interview.interviewMode} />} />
        {interview.locationName && (
          <InfoRow label="Location" value={interview.locationName} />
        )}
        {interview.locationAddress && (
          <InfoRow label="Address" value={interview.locationAddress} />
        )}
        {interview.meetingLink && (
          <InfoRow label="Meeting Link"
            value={
              <a href={interview.meetingLink} target="_blank" rel="noreferrer"
                style={{ color: "#4F7FFF", fontSize: 13, wordBreak: "break-all" }}>
                {interview.meetingLink}
              </a>
            }
          />
        )}
        {interview.interviewInstructions && (
          <div style={{ marginTop: 12 }}>
            <p style={styles.sectionLabel}>Instructions</p>
            <div style={{
              background: "#F8FAFC", borderRadius: 8, padding: "12px 14px",
              border: "1px solid #F1F5F9", color: "#374151", fontSize: 13, lineHeight: 1.6,
            }}>
              {interview.interviewInstructions}
            </div>
          </div>
        )}

        {/* Reschedule / Cancel / Completion info */}
        {interview.status === "RESCHEDULED" && (
          <div style={{ ...styles.alertBox, background: "#FFFBEB", border: "1px solid #FEF08A", marginTop: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#854D0E", fontSize: 12 }}>Rescheduled</p>
            <p style={{ margin: "4px 0 0", color: "#78350F", fontSize: 13 }}>
              {interview.rescheduleReason || "—"}
            </p>
            {interview.rescheduledAt && (
              <p style={{ margin: "4px 0 0", color: "#92400E", fontSize: 12 }}>
                On: {new Date(interview.rescheduledAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}

        {interview.status === "CANCELLED" && (
          <div style={{ ...styles.alertBox, background: "#FEF2F2", border: "1px solid #FECACA", marginTop: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#991B1B", fontSize: 12 }}>Cancelled</p>
            <p style={{ margin: "4px 0 0", color: "#7F1D1D", fontSize: 13 }}>
              {interview.cancellationReason || "—"}
            </p>
          </div>
        )}

        {interview.status === "COMPLETED" && interview.interviewNotes && (
          <div style={{ ...styles.alertBox, background: "#F0FDF4", border: "1px solid #BBF7D0", marginTop: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#166534", fontSize: 12 }}>Interview Notes</p>
            <p style={{ margin: "4px 0 0", color: "#14532D", fontSize: 13 }}>
              {interview.interviewNotes}
            </p>
          </div>
        )}

        {/* Scheduled by */}
        <p style={{ ...styles.sectionLabel, marginTop: 20 }}>Scheduled By</p>
        <InfoRow label="Name" value={interview.scheduledByUserName} />
        <InfoRow label="Created" value={
          interview.createdAt
            ? new Date(interview.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"
        } />
      </div>

      {/* Actions */}
      {["SCHEDULED", "RESCHEDULED"].includes(interview.status) && (
        <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9" }}>
          <button onClick={() => onUpdateStatus(interview)} style={{ ...styles.primaryBtn, width: "100%" }}>
            ✏️ Update Interview Status
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Interview Card (grid view) ───────────────────────────────────────────────
const InterviewCard = ({ interview, onClick, onUpdate }) => {
  const scheduledDate = interview.scheduledAt
    ? new Date(interview.scheduledAt)
    : null;

  const isUpcoming = scheduledDate && scheduledDate > new Date();

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #F1F5F9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden",
      transition: "box-shadow 0.15s, transform 0.15s",
      cursor: "pointer",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,127,255,0.12)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top color strip based on status */}
      <div style={{
        height: 4,
        background: interview.status === "SCHEDULED" ? "#4F7FFF"
          : interview.status === "COMPLETED" ? "#22C55E"
          : interview.status === "CANCELLED" ? "#EF4444"
          : interview.status === "RESCHEDULED" ? "#F59E0B"
          : "#94A3B8",
      }} />

      <div style={{ padding: "16px 18px" }} onClick={() => onClick(interview)}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar name={interview.applicantName || "?"} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#0F172A", fontSize: 14 }}>
                {interview.applicantName || "—"}
              </p>
              <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>
                {interview.applicantMobileNumber || "—"}
              </p>
            </div>
          </div>
          <StatusBadge status={interview.status || "SCHEDULED"} />
        </div>

        {/* Schedule info */}
        <div style={{
          background: "#F8FAFC", borderRadius: 8, padding: "10px 12px",
          marginBottom: 12, display: "flex", gap: 8, alignItems: "center",
        }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
              {scheduledDate
                ? scheduledDate.toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })
                : "—"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
              {scheduledDate
                ? scheduledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "—"}
              {interview.durationMinutes ? ` · ${interview.durationMinutes} min` : ""}
            </p>
          </div>
          {isUpcoming && (
            <span style={{
              marginLeft: "auto", background: "#EFF6FF", color: "#2563EB",
              fontSize: 10, fontWeight: 700, padding: "2px 8px",
              borderRadius: 20, letterSpacing: 0.5,
            }}>UPCOMING</span>
          )}
        </div>

        {/* Mode + Ward */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <ModeBadge mode={interview.interviewMode} />
          {interview.wardName && (
            <span style={{
              padding: "3px 9px", borderRadius: 6, background: "#F8FAFC",
              color: "#64748B", fontSize: 12, fontWeight: 500,
              border: "1px solid #F1F5F9",
            }}>
              📍 {interview.wardName}
            </span>
          )}
          {interview.subVerticalName && (
            <span style={{
              padding: "3px 9px", borderRadius: 6, background: "#F5F3FF",
              color: "#6D28D9", fontSize: 12, fontWeight: 500,
            }}>
              {interview.subVerticalName}
            </span>
          )}
        </div>
      </div>

      {/* Card footer actions */}
      {["SCHEDULED", "RESCHEDULED"].includes(interview.status) && (
        <div style={{
          borderTop: "1px solid #F8FAFC", padding: "10px 18px",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={e => { e.stopPropagation(); onUpdate(interview); }}
            style={{
              padding: "6px 14px", borderRadius: 7,
              border: "1.5px solid #4F7FFF", background: "#EFF4FF",
              color: "#2752D8", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            ✏️ Update Status
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CloudPatraInterviews() {
  const dispatch = useDispatch();

  const interviews        = useSelector(selectCpInterviews);
  const fetchStatus       = useSelector(selectCpInterviewsStatus);
  const ivUpdateStatus    = useSelector(selectCpInterviewUpdateStatus);

  const { user } = useSelector(s => s.auth);
  const wardChairmanUserId = user?._id || user?.userId;

  // UI state
  const [filterStatus, setFilterStatus]   = useState("ALL");
  const [filterMode, setFilterMode]       = useState("ALL");
  const [search, setSearch]               = useState("");
  const [viewMode, setViewMode]           = useState("grid"); // grid | table
  const [selectedIv, setSelectedIv]       = useState(null);
  const [updateTarget, setUpdateTarget]   = useState(null);
  const [toast, setToast]                 = useState(null);

  // Fetch on mount
  useEffect(() => {
    if (wardChairmanUserId) {
      dispatch(fetchCloudPatraInterviewsByWardChairman(wardChairmanUserId));
    }
  }, [wardChairmanUserId]);

  // Toast auto-clear
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  // Update success
  useEffect(() => {
    if (ivUpdateStatus === "succeeded") {
      setUpdateTarget(null);
      dispatch(resetCpInterviewUpdateStatus());
      setToast({ type: "success", msg: "Interview status updated successfully." });
      if (wardChairmanUserId) {
        dispatch(fetchCloudPatraInterviewsByWardChairman(wardChairmanUserId));
      }
    }
    if (ivUpdateStatus === "failed") {
      setToast({ type: "error", msg: "Failed to update interview status." });
      dispatch(resetCpInterviewUpdateStatus());
    }
  }, [ivUpdateStatus]);

  // Filter + Search
  const filtered = interviews.filter(iv => {
    const matchSearch =
      (iv.applicantName || "").toLowerCase().includes(search.toLowerCase()) ||
      (iv.applicantMobileNumber || "").includes(search) ||
      (iv.wardName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || iv.status === filterStatus;
    const matchMode   = filterMode   === "ALL" || iv.interviewMode === filterMode;
    return matchSearch && matchStatus && matchMode;
  });

  // Stat counts
  const counts = {};
  interviews.forEach(iv => { counts[iv.status] = (counts[iv.status] || 0) + 1; });

  const stats = [
    { label: "Total", value: interviews.length, color: "#4F7FFF", bg: "#EFF4FF", filter: "ALL" },
    { label: "Scheduled", value: counts.SCHEDULED || 0, color: "#2563EB", bg: "#EFF6FF", filter: "SCHEDULED" },
    { label: "Rescheduled", value: counts.RESCHEDULED || 0, color: "#B45309", bg: "#FFFBEB", filter: "RESCHEDULED" },
    { label: "Completed", value: counts.COMPLETED || 0, color: "#15803D", bg: "#F0FDF4", filter: "COMPLETED" },
    { label: "Cancelled", value: counts.CANCELLED || 0, color: "#B91C1C", bg: "#FEF2F2", filter: "CANCELLED" },
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
          display: "flex", alignItems: "center", gap: 8,
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
          <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", fontWeight: 600,
            letterSpacing: 1, textTransform: "uppercase" }}>
            Cloud Patra · Channel Partner
          </p>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
            My Scheduled Interviews
          </h1>
        </div>
        <button
          onClick={() => wardChairmanUserId && dispatch(fetchCloudPatraInterviewsByWardChairman(wardChairmanUserId))}
          style={{ ...styles.outlineBtn, padding: "8px 16px" }}
        >
          {fetchStatus === "loading" ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      <div style={{ padding: "24px 32px" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
          {stats.map(s => (
            <div
              key={s.label}
              onClick={() => setFilterStatus(s.filter)}
              style={{
                background: filterStatus === s.filter ? s.bg : "#fff",
                borderRadius: 12, padding: "16px 18px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                border: `1.5px solid ${filterStatus === s.filter ? s.color + "44" : "#F1F5F9"}`,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s.label}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters bar ── */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "14px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
          marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by applicant, mobile, ward..."
              style={{ ...styles.input, paddingLeft: 34, margin: 0, width: "100%", boxSizing: "border-box" }}
            />
          </div>

          {/* Mode filter */}
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
            style={{ ...styles.input, width: 150, margin: 0 }}>
            <option value="ALL">All Modes</option>
            <option value="IN_PERSON">🏢 In-Person</option>
            <option value="ONLINE">🎥 Online</option>
            <option value="PHONE">📞 Phone</option>
          </select>

          {/* Clear */}
          {(search || filterStatus !== "ALL" || filterMode !== "ALL") && (
            <button
              onClick={() => { setSearch(""); setFilterStatus("ALL"); setFilterMode("ALL"); }}
              style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontSize: 13, cursor: "pointer" }}
            >
              Clear
            </button>
          )}

          <span style={{ color: "#94A3B8", fontSize: 13 }}>
            {filtered.length} of {interviews.length}
          </span>

          {/* View toggle */}
          <div style={{ display: "flex", gap: 4, background: "#F1F5F9", padding: 4, borderRadius: 8 }}>
            {[["grid","⊞"],["table","☰"]].map(([v, icon]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none",
                background: viewMode === v ? "#fff" : "transparent",
                color: viewMode === v ? "#0F172A" : "#94A3B8",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: viewMode === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {fetchStatus === "loading" ? (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={{ color: "#64748B", marginTop: 12 }}>Loading interviews…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...styles.center, background: "#fff", borderRadius: 12, border: "1px solid #F1F5F9", padding: "60px 20px" }}>
            <span style={{ fontSize: 44 }}>📅</span>
            <p style={{ color: "#374151", marginTop: 12, fontSize: 15, fontWeight: 600 }}>
              No interviews found
            </p>
            <p style={{ color: "#94A3B8", fontSize: 13, margin: "4px 0 0" }}>
              {search || filterStatus !== "ALL" || filterMode !== "ALL"
                ? "Try adjusting your filters."
                : "You haven't scheduled any interviews yet."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {filtered.map((iv, i) => (
              <InterviewCard
                key={iv._id || iv.interviewId || i}
                interview={iv}
                onClick={setSelectedIv}
                onUpdate={setUpdateTarget}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div style={{
            background: "#fff", borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
            overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                  {["Applicant","Scheduled","Mode","Ward","Status","Action"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: "#94A3B8",
                      textTransform: "uppercase", letterSpacing: 0.6,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((iv, i) => (
                  <tr key={iv._id || i}
                    style={{ borderBottom: "1px solid #F8FAFC", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => setSelectedIv(iv)}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={iv.applicantName || "?"} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 13 }}>
                            {iv.applicantName || "—"}
                          </p>
                          <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>
                            {iv.applicantMobileNumber || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", color: "#374151", fontSize: 13 }}>
                      {iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }) : "—"}
                      {iv.durationMinutes && (
                        <p style={{ margin: "2px 0 0", color: "#94A3B8", fontSize: 12 }}>
                          {iv.durationMinutes} min
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <ModeBadge mode={iv.interviewMode} />
                    </td>
                    <td style={{ padding: "13px 16px", color: "#64748B", fontSize: 13 }}>
                      {iv.wardName || "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge status={iv.status || "SCHEDULED"} />
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      {["SCHEDULED", "RESCHEDULED"].includes(iv.status) && (
                        <button
                          onClick={e => { e.stopPropagation(); setUpdateTarget(iv); }}
                          style={styles.tableActionBtn}
                          title="Update Status"
                        >✏️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Drawer overlay ── */}
      {selectedIv && (
        <>
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 999,
          }} onClick={() => setSelectedIv(null)} />
          <InterviewDetailDrawer
            interview={selectedIv}
            onClose={() => setSelectedIv(null)}
            onUpdateStatus={(iv) => { setSelectedIv(null); setUpdateTarget(iv); }}
          />
        </>
      )}

      {/* ── Update Status Modal ── */}
      {updateTarget && (
        <UpdateInterviewStatusModal
          interview={updateTarget}
          loading={ivUpdateStatus === "loading"}
          onClose={() => { setUpdateTarget(null); dispatch(resetCpInterviewUpdateStatus()); }}
          onSave={(payload) => dispatch(updateCloudPatraInterviewStatus(payload))}
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
  modalTitle: { margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#0F172A" },
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
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0",
    borderRadius: 8, fontSize: 13, color: "#0F172A",
    outline: "none", background: "#fff", boxSizing: "border-box",
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
    borderRadius: 10, marginBottom: 20, border: "1px solid #F1F5F9",
  },
  alertBox: {
    borderRadius: 8, padding: "12px 14px",
  },
  sectionLabel: {
    margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94A3B8",
    letterSpacing: 1, textTransform: "uppercase",
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