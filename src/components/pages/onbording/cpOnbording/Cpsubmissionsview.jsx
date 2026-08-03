import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../../../redux/slices/authSlice.js";

const API_BASE = "https://udyami-circle-db.onrender.com";

function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function getInitials(name = "") {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const STATUS_CFG = {
    Submitted: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", dot: "#3b82f6" },
    Approved: { bg: "#f0fdf4", color: "#15803d", border: "#86efac", dot: "#22c55e" },
    Rejected: { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5", dot: "#ef4444" },
    Pending: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d", dot: "#f59e0b" },
};

// ── Approve / Reject modal ───────────────────────────────────────────────────
function ReviewModal({ submission, formSchema, onClose, onStatusUpdate }) {
    const token = useSelector(selectToken);
    const user = useSelector(selectUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const cp = submission.submittedBy;
    const cpInitials = getInitials(cp?.name);
    const cfg = STATUS_CFG[submission.status] || STATUS_CFG.Submitted;

    // Map field id → label from formSchema
    const fieldMap = {};
    (formSchema || []).forEach((f) => { fieldMap[f.id] = f.label; });

    const answers = submission.answers || {};

    const updateStatus = async (newStatus) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/cp-on-boarding/update-status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    submissionId: submission.submissionId,
                    chairmanUserId: user?.id || user?._id || user?.userId || user?.wardChairmanId, status: newStatus,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            onStatusUpdate(submission.submissionId, newStatus);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isPending = ["Submitted", "Pending"].includes(submission.status);

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(15,23,42,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 20,
                backdropFilter: "blur(2px)",
            }}
        >
            <div style={{
                background: "#fff", borderRadius: 16,
                width: "100%", maxWidth: 540,
                maxHeight: "88vh", display: "flex", flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            }}>
                {/* Modal header */}
                <div style={{
                    padding: "18px 22px 14px",
                    borderBottom: "0.5px solid #e2e8f0",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    flexShrink: 0,
                }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#4f46e5", margin: "0 0 3px" }}>
                            Submission Review
                        </p>
                        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: "#0f172a" }}>
                            {cp?.name || "Channel Partner"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}
                    >✕</button>
                </div>

                {/* Scrollable body */}
                <div style={{ overflowY: "auto", flex: 1, padding: "18px 22px" }}>

                    {/* CP info card */}
                    <div style={{
                        background: "#f8fafc", border: "0.5px solid #e2e8f0",
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: 12,
                        marginBottom: 18,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
                            color: "#fff", fontSize: 14, fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>{cpInitials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 2px" }}>{cp?.name}</p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px" }}>{cp?.email}</p>
                            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{cp?.mobileNumber} · {cp?.businessLocation}</p>
                        </div>
                        <span style={{
                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                            flexShrink: 0,
                        }}>{submission.status}</span>
                    </div>

                    {/* Submitted answers */}
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", margin: "0 0 10px" }}>
                        Submitted answers
                    </p>

                    {Object.keys(answers).length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8", fontSize: 13 }}>
                            No answers submitted
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                            {Object.entries(answers).map(([fieldId, value]) => (
                                <div key={fieldId} style={{
                                    background: "#fff", border: "0.5px solid #e2e8f0",
                                    borderRadius: 8, padding: "10px 14px",
                                    display: "flex", justifyContent: "space-between",
                                    alignItems: "flex-start", gap: 12,
                                }}>
                                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, flexShrink: 0 }}>
                                        {fieldMap[fieldId] || fieldId.slice(0, 8) + "…"}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, textAlign: "right", wordBreak: "break-word" }}>
                                        {String(value) || "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8" }}>
                        <span>Submitted {formatDate(submission.submittedAt)}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 10 }}>{submission.submissionId?.slice(0, 16)}…</span>
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 14, background: "#fef2f2", border: "0.5px solid #fca5a5",
                            borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c",
                        }}>{error}</div>
                    )}
                </div>

                {/* Footer actions */}
                <div style={{
                    borderTop: "0.5px solid #e2e8f0",
                    padding: "14px 22px",
                    display: "flex", gap: 10, justifyContent: "flex-end",
                    flexShrink: 0,
                }}>
                    <button onClick={onClose} style={{
                        padding: "9px 18px", background: "#f1f5f9", border: "none",
                        borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
                    }}>Close</button>

                    {isPending && (
                        <>
                            <button
                                onClick={() => updateStatus("Rejected")}
                                disabled={loading}
                                style={{
                                    padding: "9px 18px", background: "#fef2f2",
                                    border: "0.5px solid #fca5a5", borderRadius: 8,
                                    fontSize: 13, fontWeight: 600, color: "#b91c1c",
                                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {loading ? "…" : "✕ Reject"}
                            </button>
                            <button
                                onClick={() => updateStatus("Approved")}
                                disabled={loading}
                                style={{
                                    padding: "9px 18px", background: "#4f46e5",
                                    border: "none", borderRadius: 8,
                                    fontSize: 13, fontWeight: 600, color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {loading ? "…" : "✓ Approve"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Submission row ───────────────────────────────────────────────────────────
function SubmissionRow({ submission, onReview }) {
    const cp = submission.submittedBy;
    const cfg = STATUS_CFG[submission.status] || STATUS_CFG.Submitted;
    const initials = getInitials(cp?.name);

    return (
        <tr style={{ borderBottom: "0.5px solid #f1f5f9" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={(e) => e.currentTarget.style.background = ""}
        >
            {/* CP */}
            <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg,#4f46e5,#818cf8)",
                        color: "#fff", fontSize: 11, fontWeight: 600,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>{initials}</div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 1px" }}>{cp?.name || "—"}</p>
                        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{cp?.email}</p>
                    </div>
                </div>
            </td>
            {/* Location */}
            <td style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: 12, color: "#374151", margin: "0 0 1px" }}>{cp?.businessLocation || "—"}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{cp?.mobileNumber}</p>
            </td>
            {/* Answers count */}
            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                <span style={{
                    fontSize: 13, fontWeight: 700, color: "#4f46e5",
                    background: "#eff6ff", padding: "3px 10px", borderRadius: 20,
                }}>
                    {Object.keys(submission.answers || {}).length}
                </span>
            </td>
            {/* Submitted at */}
            <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                {formatDate(submission.submittedAt)}
            </td>
            {/* Status */}
            <td style={{ padding: "12px 16px" }}>
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: cfg.bg, color: cfg.color, border: `0.5px solid ${cfg.border}`,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                    {submission.status}
                </span>
            </td>
            {/* Action */}
            <td style={{ padding: "12px 16px" }}>
                <button
                    onClick={() => onReview(submission)}
                    style={{
                        padding: "6px 14px", background: "#eff6ff",
                        border: "0.5px solid #bfdbfe", borderRadius: 7,
                        fontSize: 12, fontWeight: 600, color: "#1d4ed8",
                        cursor: "pointer", whiteSpace: "nowrap",
                    }}
                >
                    Review →
                </button>
            </td>
        </tr>
    );
}

// ── Form accordion row ───────────────────────────────────────────────────────
function FormAccordion({ form, onStatusUpdate }) {
    const [open, setOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);

    const subs = form.submissions || [];
    const pendingCount = subs.filter((s) => ["Submitted", "Pending"].includes(s.status)).length;
    const approvedCount = subs.filter((s) => s.status === "Approved").length;

    return (
        <div style={{
            border: "0.5px solid #e2e8f0", borderRadius: 12,
            overflow: "hidden", marginBottom: 12,
        }}>
            {/* Form header */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: "100%", background: open ? "#f8fafc" : "#fff",
                    border: "none", padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", textAlign: "left",
                    borderBottom: open ? "0.5px solid #e2e8f0" : "none",
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "#eff6ff", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, fontSize: 16, color: "#4f46e5",
                }}>📋</div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{form.title}</span>
                        <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                            {form.formId?.slice(0, 8)}…
                        </span>
                        {pendingCount > 0 && (
                            <span style={{
                                fontSize: 11, fontWeight: 700, background: "#eff6ff",
                                color: "#1d4ed8", border: "0.5px solid #bfdbfe",
                                padding: "1px 8px", borderRadius: 20,
                            }}>
                                {pendingCount} pending
                            </span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>📅 {formatDate(form.createdAt)}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>🧩 {form.formSchema?.length} fields</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>📨 {subs.length} submission{subs.length !== 1 ? "s" : ""}</span>
                        {approvedCount > 0 && <span style={{ fontSize: 11, color: "#15803d" }}>✓ {approvedCount} approved</span>}
                    </div>
                </div>

                {/* Chevron */}
                <span style={{
                    fontSize: 18, color: "#94a3b8", flexShrink: 0,
                    transform: open ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                }}>⌄</span>
            </button>

            {/* Submissions table */}
            {open && (
                subs.length === 0 ? (
                    <div style={{
                        padding: "32px 20px", textAlign: "center",
                        color: "#94a3b8", fontSize: 13,
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                        No submissions yet for this form
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "0.5px solid #e2e8f0" }}>
                                    {["Channel Partner", "Location", "Answers", "Submitted", "Status", "Action"].map((h) => (
                                        <th key={h} style={{
                                            padding: "9px 16px", textAlign: "left",
                                            fontSize: 11, fontWeight: 600,
                                            textTransform: "uppercase", letterSpacing: "0.06em",
                                            color: "#64748b", whiteSpace: "nowrap",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subs.map((sub) => (
                                    <SubmissionRow
                                        key={sub.submissionId}
                                        submission={sub}
                                        onReview={setReviewTarget}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Review modal */}
            {reviewTarget && (
                <ReviewModal
                    submission={reviewTarget}
                    formSchema={form.formSchema}
                    onClose={() => setReviewTarget(null)}
                    onStatusUpdate={(submissionId, newStatus) => {
                        onStatusUpdate(form.formId, submissionId, newStatus);
                        setReviewTarget((prev) =>
                            prev?.submissionId === submissionId ? { ...prev, status: newStatus } : prev
                        );
                    }}
                />
            )}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CpSubmissionsView() {
    const token = useSelector(selectToken);
    const user = useSelector(selectUser);

    const [forms, setForms] = useState([]);
    const [status, setStatus] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    const chairmanId = user?.id || user?._id || user?.userId || user?.wardChairmanId;

    useEffect(() => {
        if (token && chairmanId) fetchSubmissions();
    }, [token, chairmanId]);

    const fetchSubmissions = async () => {
        setStatus("loading");
        setErrorMsg("");
        try {
            const res = await fetch(
                `${API_BASE}/cp-on-boarding/getAllCPSubmittedDataCreatedBYWardChairman/${chairmanId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
            setForms(data.data || data || []);
            setStatus("success");
        } catch (err) {
            setErrorMsg(err.message);
            setStatus("error");
        }
    };

    // Optimistic status update
    const handleStatusUpdate = (formId, submissionId, newStatus) => {
        setForms((prev) =>
            prev.map((f) =>
                f.formId !== formId ? f : {
                    ...f,
                    submissions: f.submissions.map((s) =>
                        s.submissionId !== submissionId ? s : { ...s, status: newStatus }
                    ),
                }
            )
        );
    };

    // Stats
    const allSubs = forms.flatMap((f) => f.submissions || []);
    const totalForms = forms.length;
    const totalSubs = allSubs.length;
    const pendingCount = allSubs.filter((s) => ["Submitted", "Pending"].includes(s.status)).length;
    const approvedCount = allSubs.filter((s) => s.status === "Approved").length;

    // Filter forms
    const filteredForms = forms.filter((f) => {
        const matchSearch =
            !search ||
            f.title?.toLowerCase().includes(search.toLowerCase()) ||
            f.formId?.toLowerCase().includes(search.toLowerCase()) ||
            f.submissions?.some((s) =>
                s.submittedBy?.name?.toLowerCase().includes(search.toLowerCase())
            );

        const matchStatus =
            filterStatus === "ALL" ||
            f.submissions?.some((s) => {
                if (filterStatus === "PENDING") return ["Submitted", "Pending"].includes(s.status);
                return s.status === filterStatus;
            });

        return matchSearch && matchStatus;
    });

    if (status === "loading") {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 14 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: "3px solid #e2e8f0", borderTopColor: "#4f46e5",
                    animation: "cpsv-spin 0.8s linear infinite",
                }} />
                <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Loading submissions…</p>
                <style>{`@keyframes cpsv-spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div style={{
                background: "#fef2f2", border: "0.5px solid #fca5a5",
                borderRadius: 10, padding: "18px 20px",
                display: "flex", alignItems: "flex-start", gap: 12,
            }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#b91c1c", margin: "0 0 6px" }}>Couldn't load submissions</p>
                    <p style={{ fontSize: 13, color: "#b91c1c", opacity: 0.8, margin: "0 0 12px" }}>{errorMsg}</p>
                    <button
                        onClick={fetchSubmissions}
                        style={{
                            padding: "7px 16px", background: "#ef4444", color: "#fff",
                            border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}
                    >Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "var(--font-sans, system-ui)" }}>
            <style>{`@keyframes cpsv-spin{to{transform:rotate(360deg)}}`}</style>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                    { label: "Total Forms", value: totalForms, icon: "📋" },
                    { label: "Total Submissions", value: totalSubs, icon: "📨" },
                    { label: "Pending Review", value: pendingCount, icon: "⏳", accent: pendingCount > 0 },
                    { label: "Approved", value: approvedCount, icon: "✅" },
                ].map((s) => (
                    <div key={s.label} style={{
                        border: s.accent ? "0.5px solid #bfdbfe" : "0.5px solid #e2e8f0",
                        borderRadius: 10, padding: "14px 16px",
                        background: s.accent ? "#eff6ff" : "#fff",
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: s.accent ? "#1d4ed8" : "#94a3b8", margin: "0 0 6px" }}>
                            {s.icon} {s.label}
                        </p>
                        <p style={{ fontSize: 26, fontWeight: 700, color: s.accent ? "#1d4ed8" : "#0f172a", margin: 0, lineHeight: 1 }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8" }}>🔍</span>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by form, partner name…"
                        style={{
                            width: "100%", padding: "8px 12px 8px 32px",
                            border: "0.5px solid #e2e8f0", borderRadius: 8,
                            fontSize: 13, outline: "none", background: "#fff",
                            boxSizing: "border-box", color: "#0f172a",
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
                    {["ALL", "PENDING", "Approved", "Rejected"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            style={{
                                padding: "6px 14px", fontSize: 12,
                                border: "none", borderRadius: 7, cursor: "pointer",
                                background: filterStatus === f ? "#fff" : "none",
                                color: filterStatus === f ? "#4f46e5" : "#64748b",
                                fontWeight: filterStatus === f ? 700 : 500,
                                boxShadow: filterStatus === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                            }}
                        >
                            {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : f}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchSubmissions}
                    style={{
                        padding: "8px 14px", background: "#f1f5f9",
                        border: "0.5px solid #e2e8f0", borderRadius: 8,
                        fontSize: 12, fontWeight: 500, color: "#374151",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    }}
                >
                    ↺ Refresh
                </button>
            </div>

            {/* Forms list */}
            {filteredForms.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "48px 20px",
                    background: "#f8fafc", borderRadius: 12,
                    border: "0.5px solid #e2e8f0",
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>
                        {search ? "No results found" : "No submissions yet"}
                    </p>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                        {search ? "Try a different search term" : "Channel Partners will appear here after they submit their onboarding forms"}
                    </p>
                </div>
            ) : (
                filteredForms.map((form) => (
                    <FormAccordion
                        key={form.formId}
                        form={form}
                        onStatusUpdate={handleStatusUpdate}
                    />
                ))
            )}
        </div>
    );
}