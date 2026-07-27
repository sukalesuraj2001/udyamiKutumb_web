import { useState } from "react";
import { Save, Send, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { INITIAL_SECTIONS, SECTION_ICONS } from "./data/Formbuilderdata.js";
import BuilderSidebar      from "./Buildersidebar";
import FormPreview         from "./Formpreview.jsx";
import FieldEditorModal    from "./Fieldeditormodal";
import ConfirmationModal   from "./Confirmationmodal";

function buildExpandedMap(sections) {
  return sections.reduce((acc, s, i) => {
    acc[s.id] = i === 0;
    return acc;
  }, {});
}

// ── AddSectionModal (inline, simple) ────────────────────────────────────────
function AddSectionModal({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon]   = useState("📋");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-xl border border-gray-200 w-[420px] max-w-[92vw] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[13.5px] font-bold text-gray-900">Add New Section</h2>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400
              hover:bg-gray-100 hover:text-gray-600 transition-colors text-[14px]"
          >✕</button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-700 mb-1.5">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Banking Details"
              className="w-full h-9 px-3 text-[12.5px] text-gray-800 bg-white border border-gray-200
                rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                transition placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTION_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg border text-[17px] flex items-center justify-center
                    transition-all
                    ${icon === ic
                      ? "border-indigo-500 bg-indigo-50 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="h-8 px-4 text-[12.5px] font-semibold text-gray-700 bg-white border
              border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >Cancel</button>
          <button
            onClick={() => title.trim() && onSave({ title: title.trim(), icon })}
            disabled={!title.trim()}
            className="h-8 px-5 text-[12.5px] font-semibold text-white bg-indigo-600 rounded-lg
              hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all"
          >＋ Add Section</button>
        </div>
      </div>
    </div>
  );
}

// ── FormBuilder (main page) ──────────────────────────────────────────────────
export default function FormBuilder() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [sections,       setSections]      = useState(INITIAL_SECTIONS);
  const [expandedMap,    setExpandedMap]   = useState(buildExpandedMap(INITIAL_SECTIONS));
  const [activeSection,  setActiveSection] = useState(INITIAL_SECTIONS[0]?.id ?? null);

  // Modal state: null | { type: 'editField'|'deleteField'|'addField'|'addSection', ... }
  const [modal, setModal] = useState(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const closeModal = () => setModal(null);

  // ── Section actions ─────────────────────────────────────────────────────────
  const handleToggleSection = (id) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setActiveSection(id);
  };

  const handleAddSection = () => setModal({ type: "addSection" });

  const handleSaveSection = ({ title, icon }) => {
    const newId = "sec_" + Date.now();
    const newSection = { id: newId, title, icon, subtitle: "", fields: [] };
    setSections((prev) => [...prev, newSection]);
    setExpandedMap((prev) => ({ ...prev, [newId]: true }));
    setActiveSection(newId);
    closeModal();
  };

  // ── Field actions ───────────────────────────────────────────────────────────
  const handleEditField = (sectionId, fieldId) => {
    const section = sections.find((s) => s.id === sectionId);
    const field   = section?.fields.find((f) => f.id === fieldId);
    if (field) setModal({ type: "editField", sectionId, field });
  };

  const handleDeleteField = (sectionId, fieldId) => {
    const section = sections.find((s) => s.id === sectionId);
    const field   = section?.fields.find((f) => f.id === fieldId);
    if (field) setModal({ type: "deleteField", sectionId, fieldId, fieldName: field.name });
  };

  const handleAddField = (sectionId) => {
    setActiveSection(sectionId);
    setModal({ type: "addField", sectionId });
  };

  const handleSaveField = (fieldData) => {
    if (modal?.type === "editField") {
      setSections((prev) =>
        prev.map((s) =>
          s.id !== modal.sectionId
            ? s
            : { ...s, fields: s.fields.map((f) => (f.id === fieldData.id ? fieldData : f)) }
        )
      );
    }
    if (modal?.type === "addField") {
      const newField = { ...fieldData, id: "f_" + Date.now() };
      setSections((prev) =>
        prev.map((s) =>
          s.id !== modal.sectionId
            ? s
            : { ...s, fields: [...s.fields, newField] }
        )
      );
    }
    closeModal();
  };

  const handleConfirmDelete = () => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== modal.sectionId
          ? s
          : { ...s, fields: s.fields.filter((f) => f.id !== modal.fieldId) }
      )
    );
    closeModal();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Settings size={15} className="text-indigo-600" />
          </span>
          <div>
            <h1 className="text-[14px] font-bold text-gray-900">
              Form Builder — Channel Partner Onboarding
            </h1>
            <p className="text-[11.5px] text-gray-400 mt-0.5">
              Configure sections and fields · Live preview updates automatically
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Draft saved!")}
            className="flex items-center gap-1.5 h-8 px-4 text-[12.5px] font-semibold
              text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50
              transition-colors"
          >
            <Save size={13} />
            Save Draft
          </button>
          <button
            onClick={() => {
              // Navigate to cp-onbording page after publishing
              navigate("/super-admin-dashboard/cp-onbording");
            }}
            className="flex items-center gap-1.5 h-8 px-5 text-[12.5px] font-semibold text-white
              bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            <Send size={13} />
            Publish Form
          </button>
        </div>
      </header>

      {/* ── Two-column workspace ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Builder sidebar */}
        <BuilderSidebar
          sections={sections}
          activeSection={activeSection}
          expandedMap={expandedMap}
          onToggleSection={handleToggleSection}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onAddField={handleAddField}
          onAddSection={handleAddSection}
        />

        {/* Right — Live form preview */}
        <FormPreview
          sections={sections}
          activeSection={activeSection}
        />
      </div>

      {/* ── Modals ── */}
      {modal?.type === "addSection" && (
        <AddSectionModal onSave={handleSaveSection} onCancel={closeModal} />
      )}

      {(modal?.type === "editField" || modal?.type === "addField") && (
        <FieldEditorModal
          mode={modal.type === "editField" ? "edit" : "add"}
          field={modal.type === "editField" ? modal.field : null}
          onSave={handleSaveField}
          onCancel={closeModal}
        />
      )}

      {modal?.type === "deleteField" && (
        <ConfirmationModal
          fieldName={modal.fieldName}
          onConfirm={handleConfirmDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}