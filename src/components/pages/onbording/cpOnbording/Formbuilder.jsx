import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../../../redux/slices/authSlice.js";
import BuilderSidebar from "./Buildersidebar";
import FormPreview from "./Formpreview";
import FieldEditorModal from "./Fieldeditormodal";
import ConfirmationModal from "./Confirmationmodal";
import { Save, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE = "https://udyami-circle-db.onrender.com";

const uid = () => crypto.randomUUID();

const makeSection = (title = "New Section") => ({
  id: uid(),
  title,
  fields: [],
});

// field.label — FieldEditorModal-உடன் consistent
const makeField = () => ({
  id: uid(),
  label: "",        // empty so modal opens fresh, autoFocus kicks in
  type: "Text",
  placeholder: "",
  required: false,
  disabled: false,
  options: [],
});

export default function Formbuilder() {
  const token = useSelector(selectToken);
  const user  = useSelector(selectUser);

  const [formTitle,       setFormTitle]       = useState("Channel Partner Registration");
  const [description,     setDescription]     = useState("");
  const [isActive,        setIsActive]        = useState(true);

  const [sections,        setSections]        = useState(() => {
    const s = makeSection("Personal Details");
    return [s];
  });
  const [activeSection,   setActiveSection]   = useState(() => {
    // derive from initial sections
    const s = makeSection("Personal Details");
    return s.id;
  });
  const [expandedMap,     setExpandedMap]     = useState({});
  const [showPreview,     setShowPreview]     = useState(false);
  const [editorState,     setEditorState]     = useState(null); // { sectionId, field }
  const [confirmState,    setConfirmState]    = useState(null); // { sectionId, fieldId, fieldLabel }
  const [submitStatus,    setSubmitStatus]    = useState("idle");
  const [submitError,     setSubmitError]     = useState(null);

  // ── sections ──────────────────────────────────────────────
  const handleToggleSection = useCallback((sectionId) => {
    setExpandedMap((p) => ({ ...p, [sectionId]: !p[sectionId] }));
    setActiveSection(sectionId);
  }, []);

  const handleAddSection = useCallback(() => {
    const s = makeSection();
    setSections((p) => [...p, s]);
    setActiveSection(s.id);
    setExpandedMap((p) => ({ ...p, [s.id]: true }));
  }, []);

  const handleRenameSection = useCallback((sectionId, newTitle) => {
    setSections((p) =>
      p.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s))
    );
  }, []);

  // ── fields ────────────────────────────────────────────────
  const handleAddField = useCallback((sectionId) => {
    if (!sectionId) return;
    const f = makeField();
    // Add field to section first
    setSections((p) =>
      p.map((s) => s.id === sectionId ? { ...s, fields: [...s.fields, f] } : s)
    );
    // Open modal — user must fill label, can cancel
    setEditorState({ sectionId, fieldId: f.id, field: f, isNew: true });
  }, []);

  const handleEditField = useCallback((sectionId, fieldId) => {
    setSections((prev) => {
      const section = prev.find((s) => s.id === sectionId);
      const field   = section?.fields.find((f) => f.id === fieldId);
      if (field) {
        setEditorState({ sectionId, fieldId, field, isNew: false });
      }
      return prev;
    });
  }, []);

  // onSave from modal — updatedField already has id
  const handleSaveField = useCallback((sectionId, updatedField) => {
    setSections((p) =>
      p.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.map((f) => f.id === updatedField.id ? updatedField : f) }
          : s
      )
    );
    setEditorState(null);
  }, []);

  // onClose — if field was new and label still empty, remove it
  const handleCloseEditor = useCallback(() => {
    if (!editorState) return;
    const { sectionId, fieldId, isNew } = editorState;
    if (isNew) {
      // Remove the placeholder field that was added
      setSections((p) =>
        p.map((s) =>
          s.id === sectionId
            ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
            : s
        )
      );
    }
    setEditorState(null);
  }, [editorState]);

  const handleDeleteField = useCallback((sectionId, fieldId) => {
    setSections((prev) => {
      const section = prev.find((s) => s.id === sectionId);
      const field   = section?.fields.find((f) => f.id === fieldId);
      setConfirmState({ sectionId, fieldId, fieldLabel: field?.label || "this field" });
      return prev;
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmState) return;
    const { sectionId, fieldId } = confirmState;
    setSections((p) =>
      p.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      )
    );
    setConfirmState(null);
  }, [confirmState]);

  // ── API submit ────────────────────────────────────────────
  // Flat array of fields across all sections — matches API payload
  const buildFormSchema = () =>
    sections.flatMap((section) =>
      section.fields.map((f) => ({
        id:          f.id,
        label:       f.label,
        type:        f.type.toLowerCase(),   // API expects lowercase: "text", "email" etc.
        placeholder: f.placeholder || "",
        required:    f.required,
        ...(f.options?.length ? { options: f.options } : {}),
      }))
    );

  const handleSubmit = async () => {
    if (!token) {
      setSubmitError("Authentication error. Please login again.");
      setSubmitStatus("error");
      return;
    }

    // user.id or user.userId — handle both
    const userId = user?.id ?? user?.userId ?? user?._id;
    if (!userId) {
      setSubmitError("User ID not found. Please login again.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("loading");
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/cp-on-boarding/create-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          title:       formTitle.trim() || "Untitled Form",
          description: description.trim(),
          formSchema:  buildFormSchema(),
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || "Failed");
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus("idle"), 4000);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong");
      setSubmitStatus("error");
    }
  };

  // ── render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form title…"
            className="w-full text-[15px] font-semibold text-gray-900 bg-transparent
              border-none outline-none placeholder:text-gray-300 truncate"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)…"
            className="w-full text-[12px] text-gray-400 bg-transparent border-none
              outline-none placeholder:text-gray-300 mt-0.5"
          />
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <span className="text-[12px] text-gray-500">Active</span>
          <div
            onClick={() => setIsActive((v) => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative
              ${isActive ? "bg-indigo-600" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
              transition-transform ${isActive ? "translate-x-4" : ""}`} />
          </div>
        </label>

        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold
            text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? "Builder" : "Preview"}
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitStatus === "loading"}
          className="flex items-center gap-1.5 px-4 h-8 text-[12px] font-semibold
            text-white bg-indigo-600 rounded-lg hover:bg-indigo-700
            active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitStatus === "loading"
            ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : <><Save size={13} /> Save Form</>}
        </button>
      </header>

      {/* Status banners */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border-b border-green-200 text-[13px] text-green-700 flex-shrink-0">
          <CheckCircle size={14} className="flex-shrink-0" />
          Form saved successfully!
        </div>
      )}
      {submitStatus === "error" && submitError && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b border-red-200 text-[13px] text-red-700 flex-shrink-0">
          <AlertCircle size={14} className="flex-shrink-0" />
          {submitError}
          <button onClick={() => setSubmitStatus("idle")}
            className="ml-auto text-red-400 hover:text-red-600 text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {showPreview ? (
          <FormPreview
            sections={sections}
            activeSection={activeSection}
            title={formTitle}
            description={description}
          />
        ) : (
          <>
            <BuilderSidebar
              sections={sections}
              activeSection={activeSection}
              expandedMap={expandedMap}
              onToggleSection={handleToggleSection}
              onEditField={handleEditField}
              onDeleteField={handleDeleteField}
              onAddField={handleAddField}
              onAddSection={handleAddSection}
              onRenameSection={handleRenameSection}
            />

            <main className="flex-1 overflow-y-auto p-6">
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-[14px]">
                  No sections yet. Add one from the sidebar.
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-4">
                  {sections.map((section) => (
                    <div key={section.id}
                      className={`bg-white rounded-xl border p-4 transition-all
                        ${activeSection === section.id
                          ? "border-indigo-400 shadow-sm shadow-indigo-100"
                          : "border-gray-200"}`}
                    >
                      <p className="text-[13px] font-semibold text-gray-800 mb-1">
                        {section.title}
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {section.fields.length === 0
                          ? `No fields — click "Add Field" in the sidebar.`
                          : `${section.fields.length} field${section.fields.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* Field Editor Modal */}
      {editorState && (
        <FieldEditorModal
          field={editorState.field}
          onSave={(updated) => handleSaveField(editorState.sectionId, updated)}
          onClose={handleCloseEditor}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmState && (
        <ConfirmationModal
          fieldName={confirmState.fieldLabel}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}