import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExpoAmbassadorApplications,
  updateExpoAmbassadorStatus,
  resetExpoUpdateStatus,
  selectExpoApplications,
  selectExpoApplicationsStatus,
  selectExpoApplicationsError,
  selectExpoUpdateStatus,
  selectExpoUpdateError,
} from "../../../redux/slices/Cponboardingslice";

// ─── Status config (must match backend ExpoAmbassadorStatus) ─────────────────
const STATUS_STYLES = {
  SUBMITTED:    { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  UNDER_REVIEW: { bg: "#FFFBEB", color: "#B45309", dot: "#F59E0B" },
  APPROVED:     { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  REJECTED:     { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444" },
};
const ALL_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

// Same transition rules the backend enforces — only valid targets are shown.
const NEXT_STATUSES = {
  SUBMITTED: ["UNDER_REVIEW", "APPROVED", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  REJECTED: ["UNDER_REVIEW", "APPROVED"],
  APPROVED: ["UNDER_REVIEW", "REJECTED"],
};

const fmtStatus = (s = "") => s.replace(/_/g, " ");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const StatusBadge = ({ status = "SUBMITTED" }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.SUBMITTED;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {fmtStatus(status)}
    </span>
  );
};

const Avatar = ({ name = "" }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#4F7FFF", "#7C3AED", "#0891B2", "#059669", "#DC2626", "#D97706"];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: colors[(name.charCodeAt(0) || 0) % colors.length],
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 13, fontWeight: 700,
    }}>{initials || "?"}</div>
  );
};

// ─── Update Status Modal ──────────────────────────────────────────────────────
const UpdateStatusModal = ({ app, onClose, onSave, loading, error }) => {
  const options = NEXT_STATUSES[app.status] || [];
  const [status, setStatus] = useState(options[0] || "");
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const needsReason = status === "REJECTED";
  const canSave = !!status && !loading && (!needsReason || rejectionReason.trim());

  return (
    <div style={styles.overlay}>
      <div style={{ ...styles.modal, maxWidth: 460 }}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.eyebrow}>EXPO Ambassador · Review</p>
            <h2 style={styles.modalTitle}>Update Status</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div style={styles.infoBox}>
            <Avatar name={app.fullName} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{app.fullName}</p>
              <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>
                {app.applicationNumber} · {app.wardName}
              </p>
            </div>
          </div>

          <label style={styles.label}>Current Status</label>
          <div style={{ marginBottom: 20 }}><StatusBadge status={app.status} /></div>

          {options.length === 0 ? (
            <p style={{ color: "#64748B", fontSize: 13 }}>
              This application is {fmtStatus(app.status).toLowerCase()} — no further status changes are allowed.
            </p>
          ) : (
            <>
              <label style={styles.label}>Change To</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {options.map((s) => (
                  <button key={s} onClick={() => setStatus(s)} style={{
                    padding: "9px 12px", borderRadius: 8, border: "1.5px solid",
                    borderColor: status === s ? "#4F7FFF" : "#E2E8F0",
                    background: status === s ? "#EFF4FF" : "#fff",
                    color: status === s ? "#2752D8" : "#374151",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                  }}>{fmtStatus(s)}</button>
                ))}
              </div>

              {needsReason && (
                <div style={{ marginBottom: 16 }}>
                  <label style={styles.label}>Rejection Reason <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea rows={3} value={rejectionReason} style={styles.textarea}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this application is being rejected..." />
                </div>
              )}

              <label style={styles.label}>Remarks (optional)</label>
              <textarea rows={2} value={remarks} style={styles.textarea}
                onChange={(e) => setRemarks(e.target.value)} placeholder="Internal note" />
            </>
          )}

          {error && <p style={{ color: "#B91C1C", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>

        <div style={styles.modalFooter}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
          {options.length > 0 && (
            <button disabled={!canSave} style={{ ...styles.primaryBtn, opacity: canSave ? 1 : 0.6 }}
              onClick={() => onSave({
                status,
                rejectionReason: needsReason ? rejectionReason.trim() : undefined,
                remarks: remarks.trim() || undefined,
              })}>
              {loading ? "Saving…" : "Update Status"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Detail Drawer (all submitted form fields) ────────────────────────────────
const DetailDrawer = ({ app, onClose, onUpdateStatus }) => {
  const mapUrl = app.latitude != null && app.longitude != null
    ? `https://www.google.com/maps?q=${app.latitude},${app.longitude}`
    : null;

  const fields = [
    { label: "Application No.", value: app.applicationNumber },
    { label: "Full Name", value: app.fullName },
    { label: "Email", value: app.email },
    { label: "Mobile", value: app.mobileNumber || app.user?.mobileNumber },
    { label: "State", value: app.state },
    { label: "District", value: app.district },
    { label: "Taluk", value: app.taluk },
    { label: "Ward/Hobli", value: app.wardName },
    { label: "Area", value: app.area },
    { label: "Pincode", value: app.pincode },
    { label: "Availability", value: app.availability },
    { label: "Languages", value: (app.languages || []).join(", ") },
    { label: "Event / Promotion Experience", value: app.experience },
    { label: "Terms Accepted", value: app.consentAccepted ? "Yes" : "No" },
    { label: "Submitted At", value: app.submittedAt ? new Date(app.submittedAt).toLocaleString("en-IN") : "—" },
    { label: "Reviewed At", value: app.reviewedAt ? new Date(app.reviewedAt).toLocaleString("en-IN") : "—" },
  ];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 999 }} onClick={onClose} />
      <div style={styles.drawer}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={app.fullName} />
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0F172A", fontSize: 15 }}>{app.fullName}</p>
              <StatusBadge status={app.status} />
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
              <span style={{ color: "#64748B", fontSize: 13 }}>{label}</span>
              <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 500, textAlign: "right", wordBreak: "break-word" }}>
                {value || "—"}
              </span>
            </div>
          ))}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "#4F7FFF" }}>
              📍 View marked location on map
            </a>
          )}
          {app.rejectionReason && (
            <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#B91C1C" }}>Rejection Reason</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7F1D1D" }}>{app.rejectionReason}</p>
            </div>
          )}
          {app.reviewRemarks && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#475569" }}>Remarks</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#334155" }}>{app.reviewRemarks}</p>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9" }}>
          <button onClick={() => onUpdateStatus(app)} style={{ ...styles.primaryBtn, width: "100%" }}>
            ✏️ Update Status
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ExpoAmbassadorApplications() {
  const dispatch = useDispatch();
  const applications = useSelector(selectExpoApplications);
  const fetchStatus = useSelector(selectExpoApplicationsStatus);
  const fetchError = useSelector(selectExpoApplicationsError);
  const updateStatus = useSelector(selectExpoUpdateStatus);
  const updateError = useSelector(selectExpoUpdateError);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // Ward is resolved by the backend from the logged-in Ward Chairman's JWT.
  const load = () => dispatch(fetchExpoAmbassadorApplications());

  useEffect(() => { load(); }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSaveStatus = async (payload) => {
    try {
      await dispatch(updateExpoAmbassadorStatus({
        applicationId: updateTarget.applicationId,
        ...payload,
      })).unwrap();
      setUpdateTarget(null);
      dispatch(resetExpoUpdateStatus());
      setToast("Application status updated.");
    } catch {
      // Error message is kept in redux (expoUpdateError) and shown in the modal.
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      const matchSearch = !q
        || (a.fullName || "").toLowerCase().includes(q)
        || (a.email || "").toLowerCase().includes(q)
        || (a.mobileNumber || "").includes(q)
        || (a.applicationNumber || "").toLowerCase().includes(q);
      return matchSearch && (filterStatus === "ALL" || a.status === filterStatus);
    });
  }, [applications, search, filterStatus]);

  const counts = useMemo(() => {
    const c = {};
    applications.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [applications]);

  const stats = [
    { key: "ALL", label: "Total", value: applications.length, color: "#4F7FFF" },
    { key: "SUBMITTED", label: "New", value: counts.SUBMITTED || 0, color: "#2563EB" },
    { key: "UNDER_REVIEW", label: "Under Review", value: counts.UNDER_REVIEW || 0, color: "#B45309" },
    { key: "APPROVED", label: "Approved", value: counts.APPROVED || 0, color: "#15803D" },
    { key: "REJECTED", label: "Rejected", value: counts.REJECTED || 0, color: "#B91C1C" },
  ];

  return (
    <div>
      {toast && <div style={styles.toast}>✅ {toast}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={load} style={{ ...styles.outlineBtn, padding: "8px 16px" }}>
          {fetchStatus === "loading" ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.key} onClick={() => setFilterStatus(s.key)} style={{
            ...styles.card, padding: "18px 20px", cursor: "pointer",
            outline: filterStatus === s.key ? `2px solid ${s.color}` : "none",
          }}>
            <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
            <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div style={{ ...styles.card, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, mobile or application no..."
          style={{ ...styles.input, flex: 1, minWidth: 200 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...styles.input, width: 180 }}>
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{fmtStatus(s)}</option>)}
        </select>
        <span style={{ color: "#94A3B8", fontSize: 13 }}>{filtered.length} of {applications.length}</span>
      </div>

      {/* Table */}
      <div style={{ ...styles.card, overflowX: "auto" }}>
        {fetchStatus === "loading" ? (
          <div style={styles.center}><p style={{ color: "#64748B" }}>Loading applications…</p></div>
        ) : fetchStatus === "failed" ? (
          <div style={styles.center}>
            <span style={{ fontSize: 36 }}>⚠️</span>
            <p style={{ color: "#B91C1C", marginTop: 12 }}>{fetchError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.center}>
            <span style={{ fontSize: 40 }}>📭</span>
            <p style={{ color: "#64748B", marginTop: 12 }}>
              {applications.length ? "No applications match your filter." : "No EXPO Ambassador applications for your ward yet."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Applicant", "Ward / Area", "Availability", "Experience", "Submitted", "Status", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.applicationId} style={{ borderBottom: "1px solid #F8FAFC" }}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={a.fullName} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>{a.fullName}</p>
                        <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>{a.applicationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <p style={{ margin: 0 }}>{a.wardName}</p>
                    <p style={{ margin: 0, color: "#94A3B8", fontSize: 12 }}>{a.area} · {a.pincode}</p>
                  </td>
                  <td style={styles.td}>{a.availability}</td>
                  <td style={styles.td}>{a.experience}</td>
                  <td style={styles.td}>{fmtDate(a.submittedAt)}</td>
                  <td style={styles.td}><StatusBadge status={a.status} /></td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setSelectedApp(a)} style={styles.tableActionBtn} title="View Details">👁</button>
                      <button onClick={() => setUpdateTarget(a)} style={styles.tableActionBtn} title="Update Status">✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedApp && (
        <DetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)}
          onUpdateStatus={(a) => { setSelectedApp(null); setUpdateTarget(a); }} />
      )}

      {updateTarget && (
        <UpdateStatusModal
          key={updateTarget.applicationId}
          app={updateTarget}
          loading={updateStatus === "loading"}
          error={updateStatus === "failed" ? updateError : null}
          onClose={() => { setUpdateTarget(null); dispatch(resetExpoUpdateStatus()); }}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}

// ─── Styles (kept in line with CloudPatraApplications) ────────────────────────
const styles = {
  card: {
    background: "#fff", borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9",
  },
  th: {
    padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
    color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.6,
  },
  td: { padding: "14px 16px", color: "#374151", fontSize: 13, verticalAlign: "middle" },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
    zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 16, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "22px 28px", borderBottom: "1px solid #F1F5F9",
  },
  eyebrow: { margin: 0, fontSize: 11, fontWeight: 700, color: "#4F7FFF", textTransform: "uppercase", letterSpacing: 1 },
  modalTitle: { margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#0F172A" },
  modalFooter: {
    padding: "16px 28px", borderTop: "1px solid #F1F5F9",
    display: "flex", justifyContent: "flex-end", gap: 10,
  },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 100vw)",
    background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
    zIndex: 1000, display: "flex", flexDirection: "column",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 14, cursor: "pointer",
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8,
    fontSize: 13, color: "#0F172A", outline: "none", background: "#fff", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F0", borderRadius: 8,
    fontSize: 13, color: "#0F172A", outline: "none", resize: "vertical",
    fontFamily: "inherit", boxSizing: "border-box", marginBottom: 4,
  },
  primaryBtn: {
    padding: "10px 20px", borderRadius: 8, border: "none", background: "#4F7FFF",
    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  outlineBtn: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "#fff", color: "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  tableActionBtn: {
    width: 30, height: 30, borderRadius: 6, border: "1px solid #E2E8F0",
    background: "#fff", cursor: "pointer", fontSize: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  infoBox: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
    background: "#F8FAFC", borderRadius: 10, marginBottom: 20, border: "1px solid #F1F5F9",
  },
  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "60px 20px", textAlign: "center",
  },
  toast: {
    position: "fixed", top: 20, right: 24, zIndex: 9999, background: "#16A34A",
    color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
};
