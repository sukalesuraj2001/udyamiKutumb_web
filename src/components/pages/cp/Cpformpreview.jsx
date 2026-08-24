import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../../redux/slices/authSlice";

const API_BASE = "https://backend.udyamikutumba.com";

// ── Field type config ────────────────────────────────────────────────────────
const FIELD_TYPE_CONFIG = {
  text:     { icon: "ti-cursor-text",   label: "Text",      inputType: "text" },
  number:   { icon: "ti-123",           label: "Number",    inputType: "number" },
  mobile:   { icon: "ti-phone",         label: "Mobile",    inputType: "tel" },
  email:    { icon: "ti-mail",          label: "Email",     inputType: "email" },
  date:     { icon: "ti-calendar",      label: "Date",      inputType: "date" },
  textarea: { icon: "ti-align-left",    label: "Textarea",  inputType: "textarea" },
  dropdown: { icon: "ti-chevron-down",  label: "Dropdown",  inputType: "select" },
  radio:    { icon: "ti-circle-dot",    label: "Radio",     inputType: "radio" },
  checkbox: { icon: "ti-checkbox",      label: "Checkbox",  inputType: "checkbox" },
  image:    { icon: "ti-photo",         label: "Image",     inputType: "file" },
  file:     { icon: "ti-file-upload",   label: "File",      inputType: "file" },
};

function getConfig(type) {
  return FIELD_TYPE_CONFIG[type?.toLowerCase()] || FIELD_TYPE_CONFIG.text;
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Injected styles ──────────────────────────────────────────────────────────
const STYLES = `
  @keyframes cpfp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes cpfp-fade-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .cpfp-field-card {
    background: #fff;
    border: 1px solid #eef0f4;
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: box-shadow 0.18s ease, border-color 0.18s ease;
    animation: cpfp-fade-in 0.25s ease both;
  }
  .cpfp-field-card:hover {
    border-color: #d6e4ff;
    box-shadow: 0 2px 10px 0 rgba(59,130,246,0.07);
  }
  .cpfp-refresh-btn {
    background: none;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    width: 30px; height: 30px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #9ca3af;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .cpfp-refresh-btn:hover {
    background: #f0f4ff;
    color: #3b82f6;
    border-color: #bfdbfe;
  }
  .cpfp-retry-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; font-size: 13px; font-weight: 500;
    background: #ef4444; color: #fff;
    border: none; border-radius: 7px; cursor: pointer;
    transition: background 0.15s;
  }
  .cpfp-retry-btn:hover { background: #dc2626; }
`;

// ── Field preview card ───────────────────────────────────────────────────────
function FieldCard({ field, index }) {
  const cfg = getConfig(field.type);

  const inputBase = {
    pointerEvents: "none",
    userSelect: "none",
    width: "100%",
    background: "#f9fafb",
    border: "1px solid #eef0f4",
    borderRadius: 7,
    padding: "7px 11px",
    fontSize: 13,
    color: "#b0b8c8",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const renderInput = () => {
    if (field.type === "textarea") {
      return <textarea readOnly style={{ ...inputBase, resize: "none", height: 64 }} placeholder={field.placeholder || field.label} />;
    }
    if (field.type === "dropdown" && field.options?.length) {
      return (
        <select disabled style={inputBase}>
          <option>{field.placeholder || `Select ${field.label}`}</option>
          {field.options.map((o, i) => <option key={i}>{o}</option>)}
        </select>
      );
    }
    if (field.type === "image" || field.type === "file") {
      return (
        <div style={{ ...inputBase, display: "flex", alignItems: "center", gap: 8 }}>
          <i className={`ti ${cfg.icon}`} style={{ fontSize: 14, color: "#b0b8c8" }} aria-hidden="true" />
          <span style={{ fontSize: 12 }}>{field.type === "image" ? "Upload image" : "Upload file"}</span>
        </div>
      );
    }
    if (field.type === "radio" && field.options?.length) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {field.options.map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#b0b8c8" }}>
              <input type="radio" disabled style={{ accentColor: "#3b82f6" }} /> {o}
            </label>
          ))}
        </div>
      );
    }
    if (field.type === "checkbox" && field.options?.length) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {field.options.map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#b0b8c8" }}>
              <input type="checkbox" disabled style={{ accentColor: "#3b82f6" }} /> {o}
            </label>
          ))}
        </div>
      );
    }
    return <input readOnly type={cfg.inputType} placeholder={field.placeholder || field.label} style={inputBase} />;
  };

  return (
    <div className="cpfp-field-card" style={{ animationDelay: `${index * 40}ms` }}>
      {/* Icon badge */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#3b82f6", fontSize: 15,
          boxShadow: "0 1px 3px rgba(59,130,246,0.12)",
        }}>
          <i className={`ti ${cfg.icon}`} aria-hidden="true" />
        </div>
        <span style={{ fontSize: 9.5, color: "#c0c8d8", fontWeight: 600, letterSpacing: "0.02em" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
            {field.label}
          </span>
          {field.required ? (
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.03em",
              background: "#fff0f0", color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "1px 8px", borderRadius: 20,
            }}>Required</span>
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 500, letterSpacing: "0.03em",
              background: "#f8fafc", color: "#94a3b8",
              border: "1px solid #e9ecf0",
              padding: "1px 8px", borderRadius: 20,
            }}>Optional</span>
          )}
        </div>

        {renderInput()}

        <div style={{
          fontSize: 11, color: "#b0b8c8", marginTop: 6,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <i className={`ti ${cfg.icon}`} style={{ fontSize: 11 }} aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>{cfg.label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 60, r = 10 }) {
  return (
    <div style={{
      height: h, borderRadius: r,
      background: "linear-gradient(90deg, #f1f5f9 25%, #e8edf3 50%, #f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "cpfp-pulse 1.4s ease-in-out infinite",
    }} />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CpFormPreview() {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const chairmanId = user?.id || user?._id || user?.userId || user?.wardChairmanId;

  useEffect(() => {
    if (!token || !chairmanId) return;
    fetchForm();
  }, [token, chairmanId]);

  const fetchForm = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/cp-on-boarding/form/${chairmanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || "Failed to load form");
      setFormData(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const totalFields = formData?.formSchema?.length || 0;
  const requiredCount = formData?.formSchema?.filter((f) => f.required).length || 0;
  const createdBy = formData?.createdBy;
  const initials = createdBy?.name
    ? createdBy.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "WC";
  const isActive = formData?.isActive;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ padding: "20px 0", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>

        {/* ── Loading ── */}
        {status === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton h={100} />
            <Skeleton h={76} />
            <Skeleton h={76} />
            <Skeleton h={76} />
            <Skeleton h={52} />
          </div>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div style={{
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "20px 22px",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: "#fee2e2",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#dc2626", fontSize: 18, flexShrink: 0,
            }}>
              <i className="ti ti-alert-circle" aria-hidden="true" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#b91c1c", margin: "0 0 3px" }}>
                Couldn't load form
              </p>
              <p style={{ fontSize: 13, color: "#ef4444", margin: "0 0 14px", opacity: 0.85 }}>
                {errorMsg}
              </p>
              <button className="cpfp-retry-btn" onClick={fetchForm}>
                <i className="ti ti-refresh" style={{ fontSize: 13 }} aria-hidden="true" />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── No form ── */}
        {status === "success" && !formData && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "56px 20px", textAlign: "center",
            background: "#f9fafb", borderRadius: 14,
            border: "1.5px dashed #d1d5db",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#cbd5e1", fontSize: 26, marginBottom: 14,
            }}>
              <i className="ti ti-clipboard-x" aria-hidden="true" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#334155", margin: "0 0 6px" }}>
              No form created yet
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
              Create a form in the Form Builder tab to get started.
            </p>
          </div>
        )}

        {/* ── Form preview ── */}
        {status === "success" && formData && (
          <div style={{
            background: "#fff",
            border: "1px solid #eef0f4",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03)",
          }}>

            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              borderBottom: "1px solid #dde8fb",
              padding: "18px 22px 16px",
            }}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 18, flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                }}>
                  <i className="ti ti-clipboard-list" aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1e3a8a", margin: "0 0 2px", letterSpacing: "-0.01em" }}>
                    {formData.title || "Onboarding Form"}
                  </p>
                  {formData.description && (
                    <p style={{ fontSize: 12, color: "#3b82f6", opacity: 0.8, margin: 0 }}>
                      {formData.description}
                    </p>
                  )}
                </div>
                {/* Status badge */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 600,
                  color: isActive ? "#166534" : "#6b7280",
                  background: isActive ? "#f0fdf4" : "#f9fafb",
                  border: `1px solid ${isActive ? "#bbf7d0" : "#e5e7eb"}`,
                  padding: "4px 12px", borderRadius: 20, flexShrink: 0,
                  letterSpacing: "0.01em",
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: isActive ? "#22c55e" : "#9ca3af",
                    display: "inline-block",
                    boxShadow: isActive ? "0 0 0 2px rgba(34,197,94,0.2)" : "none",
                  }} />
                  {isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Meta chips */}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {[
                  { icon: "ti-layout-list", text: `${totalFields} field${totalFields !== 1 ? "s" : ""}` },
                  { icon: "ti-asterisk", text: `${requiredCount} required` },
                  { icon: "ti-calendar-event", text: formatDate(formData.createdAt) },
                ].map((chip) => (
                  <span key={chip.text} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 11.5, fontWeight: 500,
                    color: "#1d4ed8",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(147,197,253,0.6)",
                    padding: "4px 11px", borderRadius: 20,
                    backdropFilter: "blur(4px)",
                  }}>
                    <i className={`ti ${chip.icon}`} style={{ fontSize: 11 }} aria-hidden="true" />
                    {chip.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {formData.formSchema?.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "36px 20px",
                  color: "#94a3b8", fontSize: 13,
                }}>
                  <i className="ti ti-layout-list" style={{ fontSize: 30, display: "block", marginBottom: 10 }} aria-hidden="true" />
                  No fields added yet. Go to Form Builder to add fields.
                </div>
              ) : (
                formData.formSchema.map((field, i) => (
                  <FieldCard key={field.id || i} field={field} index={i} />
                ))
              )}
            </div>

            {/* Footer — Created by */}
            {createdBy && (
              <div style={{
                borderTop: "1px solid #f1f3f6",
                padding: "12px 22px",
                background: "#fafbfc",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  color: "#fff", fontSize: 11.5, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, letterSpacing: "0.02em",
                  boxShadow: "0 1px 4px rgba(99,102,241,0.3)",
                }}>
                  {initials}
                </div>

                {/* Name + email */}
                <div style={{ fontSize: 12.5, color: "#64748b", flex: 1, minWidth: 0 }}>
                  <span>Created by </span>
                  <strong style={{ color: "#1e293b", fontWeight: 600 }}>
                    {createdBy.name}
                  </strong>
                  {createdBy.email && (
                    <span style={{ color: "#94a3b8" }}>&nbsp;·&nbsp;{createdBy.email}</span>
                  )}
                </div>

                {/* Refresh */}
                <button className="cpfp-refresh-btn" onClick={fetchForm} title="Refresh form">
                  <i className="ti ti-refresh" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}