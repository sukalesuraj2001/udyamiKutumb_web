import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectToken, selectUser } from "../../../redux/slices/authSlice.js";
import {
  createCpForm,
  fetchChannelPartnersByWard,
  resetSaveStatus,
  selectSaveStatus,
  selectSaveError,
  selectPartners,
  selectPartnersStatus,
} from "../../../redux/slices/cpFormSlice.js";
import BuilderSidebar from "./Buildersidebar";
import FormPreview from "./Formpreview";
import FieldEditorModal from "./Fieldeditormodal";
import ConfirmationModal from "./Confirmationmodal";
import {
  Save, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ChevronDown,
} from "lucide-react";

const uid = () => crypto.randomUUID();

// ── Read ward from localStorage ───────────────────────────────────────────────
const locationData = JSON.parse(localStorage.getItem("locationData") || "{}");
const wardName     = locationData.wardName ?? "";

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_FIELDS = [
  { id: "default-name",     label: "Full Name",               type: "Text",     required: true,  disabled: false, placeholder: "Enter full name" },
  { id: "default-mobile",   label: "Mobile Number",           type: "Tel",      required: true,  disabled: false, placeholder: "10-digit mobile number" },
  { id: "default-email",    label: "Email Address",           type: "Email",    required: false, disabled: false, placeholder: "example@email.com" },
  { id: "default-company",  label: "Company / Business Name", type: "Text",     required: false, disabled: false, placeholder: "Business name" },
  { id: "default-address",  label: "Address",                 type: "Textarea", required: false, disabled: false, placeholder: "Full address" },
  { id: "default-pincode",  label: "Pincode",                 type: "Number",   required: false, disabled: false, placeholder: "6-digit pincode" },
];

const KYC_FIELDS = [
  { id: "kyc-pan",          label: "PAN Number",          type: "Text",   required: true,  disabled: false, placeholder: "ABCDE1234F" },
  { id: "kyc-aadhaar",      label: "Aadhaar Number",      type: "Number", required: true,  disabled: false, placeholder: "12-digit Aadhaar number" },
  { id: "kyc-gst",          label: "GST Number",          type: "Text",   required: false, disabled: false, placeholder: "22AAAAA0000A1Z5" },
  { id: "kyc-bank-account", label: "Bank Account Number", type: "Number", required: false, disabled: false, placeholder: "Account number" },
  { id: "kyc-ifsc",         label: "IFSC Code",           type: "Text",   required: false, disabled: false, placeholder: "e.g. SBIN0001234" },
];

const INITIAL_SECTIONS = [
  { id: "section-basic-info", title: "Personal Details", icon: "👤", subtitle: "Core CP details",                 fields: DEFAULT_FIELDS },
  { id: "section-kyc",        title: "KYC Details",      icon: "🪪", subtitle: "Identity & banking verification", fields: KYC_FIELDS },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeSection = (title = "New Section") => ({
  id: uid(), title, icon: "📋", subtitle: "", fields: [],
});

const makeField = () => ({
  id: uid(), label: "", type: "Text", placeholder: "",
  required: false, disabled: false, options: [],
});

// ── SelectBox ─────────────────────────────────────────────────────────────────

function SelectBox({ value, onChange, placeholder, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-9 pl-3 pr-8 text-[12px] rounded-lg border appearance-none
          outline-none transition-colors bg-white
          ${disabled
            ? "text-gray-300 border-gray-100 cursor-not-allowed"
            : "text-gray-700 border-gray-200 hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
          }`}
      >
        <option value="" disabled>{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={13}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
          ${disabled ? "text-gray-200" : "text-gray-400"}`}
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Formbuilder() {
  const dispatch       = useDispatch();
  const token          = useSelector(selectToken);
  const user           = useSelector(selectUser);
  const saveStatus     = useSelector(selectSaveStatus);
  const saveError      = useSelector(selectSaveError);
  const partners       = useSelector(selectPartners);
  const partnersStatus = useSelector(selectPartnersStatus);

  const [formTitle,         setFormTitle]         = useState("Channel Partner Registration");
  const [description,       setDescription]       = useState("");
  const [isActive,          setIsActive]          = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const [sections,      setSections]      = useState(INITIAL_SECTIONS);
  const [activeSection, setActiveSection] = useState(INITIAL_SECTIONS[0].id);
  const [expandedMap,   setExpandedMap]   = useState({ [INITIAL_SECTIONS[0].id]: true });

  const [showPreview,  setShowPreview]  = useState(false);
  const [editorState,  setEditorState]  = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  // Fetch partners on mount using ward from localStorage
  useEffect(() => {
    if (!wardName || !token) return;
    dispatch(fetchChannelPartnersByWard({ token, ward: wardName }));
  }, [token, dispatch]);

  // Auto-clear success banner after 4s
  useEffect(() => {
    if (saveStatus === "success") {
      const t = setTimeout(() => dispatch(resetSaveStatus()), 4000);
      return () => clearTimeout(t);
    }
  }, [saveStatus, dispatch]);

  // Derived: selected partner object
  const selectedPartner = partners.find((p) => p.userId === selectedPartnerId) ?? null;

  // ── Sections ──────────────────────────────────────────────────────────────

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
    setSections((p) => p.map((s) => s.id === sectionId ? { ...s, title: newTitle } : s));
  }, []);

  // ── Fields ────────────────────────────────────────────────────────────────

  const handleAddField = useCallback((sectionId) => {
    if (!sectionId) return;
    const f = makeField();
    setSections((p) => p.map((s) => s.id === sectionId ? { ...s, fields: [...s.fields, f] } : s));
    setEditorState({ sectionId, fieldId: f.id, field: f, isNew: true });
  }, []);

  const handleEditField = useCallback((sectionId, fieldId) => {
    setSections((prev) => {
      const field = prev.find((s) => s.id === sectionId)?.fields.find((f) => f.id === fieldId);
      if (field) setEditorState({ sectionId, fieldId, field, isNew: false });
      return prev;
    });
  }, []);

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

  const handleCloseEditor = useCallback(() => {
    if (!editorState) return;
    const { sectionId, fieldId, isNew } = editorState;
    if (isNew) {
      setSections((p) =>
        p.map((s) =>
          s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s
        )
      );
    }
    setEditorState(null);
  }, [editorState]);

  const handleDeleteField = useCallback((sectionId, fieldId) => {
    setSections((prev) => {
      const field = prev.find((s) => s.id === sectionId)?.fields.find((f) => f.id === fieldId);
      setConfirmState({ sectionId, fieldId, fieldLabel: field?.label || "this field" });
      return prev;
    });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmState) return;
    const { sectionId, fieldId } = confirmState;
    setSections((p) =>
      p.map((s) =>
        s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s
      )
    );
    setConfirmState(null);
  }, [confirmState]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const buildFormSchema = () =>
    sections.flatMap((section) =>
      section.fields.map((f) => ({
        id:          f.id,
        label:       f.label,
        type:        f.type.toLowerCase(),
        placeholder: f.placeholder || "",
        required:    f.required,
        ...(f.options?.length ? { options: f.options } : {}),
      }))
    );

  const handleSubmit = () => {
    const userId = user?.id ?? user?.userId ?? user?._id;
    if (!token || !userId) return;
    dispatch(createCpForm({
      token,
      userId,
      title:            formTitle.trim() || "Untitled Form",
      description:      description.trim(),
      channelPartnerId: selectedPartnerId || undefined,
      businessName:     selectedPartner?.profile?.businessDetails?.businessName
                          ?? selectedPartner?.name
                          ?? undefined,
      formSchema:       buildFormSchema(),
      isActive,
    }));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">

        {/* Title + description */}
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

        {/* Ward pill + CP dropdown */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Ward read-only pill */}
          {wardName ? (
            <div className="flex items-center gap-1.5 px-2.5 h-9 bg-gray-50 border
              border-gray-200 rounded-lg text-[12px] shrink-0">
              <span className="text-gray-400 text-[10px] font-medium">Ward</span>
              <span className="font-semibold text-gray-700">{wardName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 h-9 bg-amber-50 border
              border-amber-200 rounded-lg text-[11px] text-amber-600 shrink-0">
              <AlertCircle size={12} />
              No ward in location data
            </div>
          )}

          {/* CP dropdown */}
          <div className="w-60">
            {partnersStatus === "loading" ? (
              <div className="h-9 flex items-center gap-1.5 px-3 text-[12px] text-gray-400
                border border-gray-200 rounded-lg bg-white">
                <Loader2 size={12} className="animate-spin text-indigo-400" />
                Loading partners…
              </div>
            ) : (
              <SelectBox
                value={selectedPartnerId}
                onChange={setSelectedPartnerId}
                placeholder={
                  !wardName            ? "No ward found"            :
                  partners.length === 0 ? "No partners in this ward" :
                                         "Select Channel Partner…"
                }
                disabled={!wardName || partners.length === 0}
              >
                {partners.map((p) => {
                  const bizName = p.profile?.businessDetails?.businessName;
                  const label   = bizName
                    ? `${bizName} — ${p.name}`
                    : `${p.name} (${p.email})`;
                  return (
                    <option key={p.userId} value={p.userId}>{label}</option>
                  );
                })}
              </SelectBox>
            )}
          </div>

          {/* Selected CP avatar pill */}
          {selectedPartner && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border
              border-indigo-200 rounded-lg text-[11px] text-indigo-700 shrink-0 max-w-[180px]">
              <span className="w-5 h-5 rounded-full bg-indigo-200 flex items-center
                justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                {selectedPartner.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="truncate font-medium">
                {selectedPartner.profile?.businessDetails?.businessName ?? selectedPartner.name}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 shrink-0" />

        {/* Active toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
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

        {/* Preview toggle */}
        <button
          onClick={() => setShowPreview((v) => !v)}
          className="flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold
            text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50
            transition-colors shrink-0"
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? "Builder" : "Preview"}
        </button>

        {/* Save */}
        <button
          onClick={handleSubmit}
          disabled={saveStatus === "loading" || !selectedPartnerId}
          title={!selectedPartnerId ? "Select a Channel Partner first" : ""}
          className="flex items-center gap-1.5 px-4 h-8 text-[12px] font-semibold
            text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98]
            transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {saveStatus === "loading"
            ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : <><Save size={13} /> Save Form</>}
        </button>
      </header>

      {/* ── Status banners ── */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 border-b
          border-green-200 text-[13px] text-green-700 flex-shrink-0">
          <CheckCircle size={14} className="flex-shrink-0" />
          Form saved successfully for&nbsp;
          <span className="font-semibold">
            {selectedPartner?.profile?.businessDetails?.businessName
              ?? selectedPartner?.name
              ?? "Channel Partner"}
          </span>!
        </div>
      )}
      {saveStatus === "error" && saveError && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 border-b
          border-red-200 text-[13px] text-red-700 flex-shrink-0">
          <AlertCircle size={14} className="flex-shrink-0" />
          {saveError}
          <button
            onClick={() => dispatch(resetSaveStatus())}
            className="ml-auto text-red-400 hover:text-red-600 text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* No CP selected nudge */}
      {!selectedPartnerId && partnersStatus !== "loading" && (
        <div className="flex items-center gap-2 px-5 py-2 bg-amber-50 border-b
          border-amber-200 text-[12px] text-amber-700 flex-shrink-0">
          <AlertCircle size={13} className="flex-shrink-0" />
          Select a channel partner above to assign this form before saving.
        </div>
      )}

      {/* ── Body ── */}
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

            {/* Canvas */}
            <main className="flex-1 overflow-y-auto p-6">
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-[14px]">
                  No sections yet. Add one from the sidebar.
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-4">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`bg-white rounded-xl border p-4 transition-all
                        ${activeSection === section.id
                          ? "border-indigo-400 shadow-sm shadow-indigo-100"
                          : "border-gray-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{section.icon}</span>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {section.title}
                        </p>
                        <span className="ml-auto text-[11px] text-gray-400 bg-gray-100
                          px-2 py-0.5 rounded-full">
                          {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {section.fields.length === 0 ? (
                        <p className="text-[12px] text-gray-400 italic">
                          No fields — click "Add Field" in the sidebar.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {section.fields.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg
                                border bg-gray-50 border-gray-200 text-[12px] text-gray-700"
                            >
                              <span className="font-medium flex-1 truncate">{field.label}</span>
                              <span className="text-[10px] text-gray-400 shrink-0">{field.type}</span>
                              {field.required && (
                                <span className="text-[9px] font-bold text-amber-600
                                  bg-amber-50 px-1.5 py-0.5 rounded shrink-0">REQ</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {editorState && (
        <FieldEditorModal
          field={editorState.field}
          onSave={(updated) => handleSaveField(editorState.sectionId, updated)}
          onClose={handleCloseEditor}
        />
      )}
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