import { ChevronDown } from "lucide-react";

// ── Shared primitive styles (read-only) ──────────────────────────────────────
const inputCls =
  "w-full h-9 px-3 text-[12.5px] text-gray-800 bg-white border border-gray-200 " +
  "rounded-lg cursor-default pointer-events-none placeholder:text-gray-300";

const selectCls =
  "w-full h-9 px-3 pr-8 text-[12.5px] text-gray-800 bg-white border border-gray-200 " +
  "rounded-lg appearance-none cursor-default pointer-events-none";

function ReadInput({ placeholder }) {
  return <input readOnly className={inputCls} placeholder={placeholder || "Enter value"} />;
}

function ReadSelect({ placeholder = "Select…" }) {
  return (
    <div className="relative">
      <select disabled className={selectCls}>
        <option>{placeholder}</option>
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
      />
    </div>
  );
}

function ReadTextarea({ placeholder, rows = 3 }) {
  return (
    <textarea
      readOnly
      rows={rows}
      placeholder={placeholder || "Enter text..."}
      className="w-full px-3 py-2 text-[12.5px] text-gray-800 bg-white border border-gray-200
        rounded-lg resize-none cursor-default pointer-events-none placeholder:text-gray-300"
    />
  );
}

function ReadRadio({ options = ["Yes", "No"] }) {
  return (
    <div className="flex gap-5">
      {options.map((o) => (
        <label key={o} className="flex items-center gap-2 cursor-default pointer-events-none">
          <input type="radio" disabled className="accent-indigo-600 w-3.5 h-3.5" />
          <span className="text-[12.5px] text-gray-600">{o}</span>
        </label>
      ))}
    </div>
  );
}

function ReadCheckbox({ label }) {
  return (
    <label className="flex items-center gap-2 cursor-default pointer-events-none">
      <input type="checkbox" disabled className="accent-indigo-600 w-3.5 h-3.5 shrink-0" />
      <span className="text-[12px] text-gray-600">{label || "Checkbox"}</span>
    </label>
  );
}

function ReadCheckboxGrid({ items = [] }) {
  if (items.length === 0) {
    return <p className="text-[12px] text-gray-400">No options configured</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map((item, idx) => (
        <label key={idx} className="flex items-center gap-2 cursor-default pointer-events-none">
          <input type="checkbox" disabled className="accent-indigo-600 w-3.5 h-3.5 shrink-0" />
          <span className="text-[12px] text-gray-600">{item}</span>
        </label>
      ))}
    </div>
  );
}

// ── Section wrapper ─────────────────────────────────────────────────────────
function PreviewSection({ id, icon, title, subtitle, isActive, children }) {
  return (
    <div
      id={`preview-${id}`}
      className={`bg-white rounded-xl border overflow-hidden mb-4 transition-all
        ${isActive
          ? "border-indigo-400 shadow-[0_0_0_2.5px_rgba(79,70,229,0.15)]"
          : "border-gray-200"
        }`}
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[14px] shrink-0">
          {icon || "📋"}
        </span>
        <div>
          <h3 className="text-[13px] font-bold text-gray-900">{title || "Untitled Section"}</h3>
          {subtitle && (
            <p className="text-[11.5px] text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

// helpers
function Label({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
function Grid3({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{children}</div>;
}
function Field({ children }) {
  return <div className="flex flex-col">{children}</div>;
}

// ── Dynamic field renderer ──────────────────────────────────────────────────
function renderField(field) {
  if (!field) return null;

  const commonProps = {
    placeholder: field.placeholder || `Enter ${field.name?.toLowerCase() || "value"}`,
  };

  switch (field.type) {
    case "Text":
    case "Email":
    case "Tel":
    case "Number":
    case "Date":
    case "URL":
      return <ReadInput {...commonProps} />;

    case "Select":
      return <ReadSelect {...commonProps} />;

    case "Textarea":
      return <ReadTextarea {...commonProps} rows={3} />;

    case "Radio":
      return <ReadRadio options={["Yes", "No"]} />;

    case "Checkbox":
      // If it's a checkbox with items (like Skills), show grid
      if (field.options && Array.isArray(field.options) && field.options.length > 0) {
        return <ReadCheckboxGrid items={field.options} />;
      }
      // Single checkbox
      return <ReadCheckbox label={field.name || "Checkbox"} />;

    default:
      return <ReadInput {...commonProps} />;
  }
}

// ── Dynamic Section Renderer ──────────────────────────────────────────────
function DynamicSection({ section, isActive }) {
  if (!section) return null;

  return (
    <PreviewSection
      id={section.id}
      icon={section.icon}
      title={section.title}
      subtitle={section.subtitle}
      isActive={isActive}
    >
      <div className="space-y-4">
        {section.fields && section.fields.length > 0 ? (
          // Group fields in grids based on count for better layout
          (() => {
            const fields = section.fields;
            const groups = [];
            let i = 0;
            while (i < fields.length) {
              // Take 3 fields for a row, or remaining
              const chunk = fields.slice(i, i + 3);
              // If only 2 fields left, use Grid2, else Grid3
              if (chunk.length === 2) {
                groups.push(
                  <Grid2 key={i}>
                    {chunk.map((f) => (
                      <Field key={f.id}>
                        <Label required={f.required}>{f.name}</Label>
                        {renderField(f)}
                      </Field>
                    ))}
                  </Grid2>
                );
                i += 2;
              } else {
                groups.push(
                  <Grid3 key={i}>
                    {chunk.map((f) => (
                      <Field key={f.id}>
                        <Label required={f.required}>{f.name}</Label>
                        {renderField(f)}
                      </Field>
                    ))}
                  </Grid3>
                );
                i += 3;
              }
            }
            return groups;
          })()
        ) : (
          <p className="text-[12px] text-gray-400 text-center py-4">
            No fields in this section. Add fields using the builder.
          </p>
        )}
      </div>
    </PreviewSection>
  );
}

// ─── FormPreview ─────────────────────────────────────────────────────────────
/**
 * FormPreview (Right Panel)
 * Props:
 *   sections      – current section list (used for ordering)
 *   activeSection – id of the active/highlighted section
 */
export default function FormPreview({ sections, activeSection }) {
  // If no sections, show empty state
  if (!sections || sections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-[14px] text-gray-400">No sections configured yet.</p>
          <p className="text-[12px] text-gray-300 mt-1">Add a section using the "Add Section" button.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
      <div className="max-w-3xl mx-auto">
        {/* Preview top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold
              bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              Live Preview
            </span>
            <span className="text-[11.5px] text-gray-400">
              Previewing:{" "}
              <span className="font-semibold text-gray-600">
                {sections.find((s) => s.id === activeSection)?.title ?? "All Sections"}
              </span>
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Read-only</span>
        </div>

        {/* Form header card */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
          <h1 className="text-[15px] font-bold text-gray-900">
            Channel Partner Onboarding
          </h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Complete all required fields to register a new Channel Partner
          </p>
        </div>

        {/* Render sections dynamically */}
        {sections.map((section) => (
          <DynamicSection
            key={section.id}
            section={section}
            isActive={section.id === activeSection}
          />
        ))}
      </div>
    </div>
  );
}