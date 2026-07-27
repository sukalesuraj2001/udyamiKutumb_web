import { ChevronDown, GripVertical, Plus } from "lucide-react";
import BuilderField from "./Builderfield";

/**
 * BuilderSection
 * Props:
 *   section       – { id, title, icon, subtitle, fields[] }
 *   isActive      – boolean – whether this section is currently selected
 *   isExpanded    – boolean
 *   onToggle      – () => void
 *   onEditField   – (sectionId, fieldId) => void
 *   onDeleteField – (sectionId, fieldId) => void
 *   onAddField    – (sectionId) => void
 */
export default function BuilderSection({
  section,
  isActive,
  isExpanded,
  onToggle,
  onEditField,
  onDeleteField,
  onAddField,
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden mb-2 transition-all
        ${isActive
          ? "border-indigo-300 shadow-[0_0_0_2px_rgba(79,70,229,0.12)]"
          : "border-gray-200"
        }`}
    >
      {/* Section header */}
      <div
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-colors
          ${isActive ? "bg-indigo-50" : "bg-white hover:bg-gray-50"}`}
      >
        {/* Drag handle */}
        <GripVertical
          size={14}
          className="text-gray-300 hover:text-gray-400 cursor-grab shrink-0"
        />

        {/* Icon */}
        <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-[13px] shrink-0">
          {section.icon}
        </span>

        {/* Title */}
        <span
          className={`flex-1 text-[12px] font-semibold truncate
            ${isActive ? "text-indigo-700" : "text-gray-800"}`}
        >
          {section.title}
        </span>

        {/* Field count badge */}
        <span className="text-[10.5px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
          {section.fields.length}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform shrink-0
            ${isExpanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded: field list */}
      {isExpanded && (
        <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50/60">
          {section.fields.length === 0 ? (
            <p className="text-[11.5px] text-gray-400 text-center py-2">
              No fields yet. Add one below.
            </p>
          ) : (
            section.fields.map((field) => (
              <BuilderField
                key={field.id}
                field={field}
                sectionId={section.id}
                onEdit={onEditField}
                onDelete={onDeleteField}
              />
            ))
          )}

          {/* Add field to this section */}
          <button
            onClick={() => onAddField(section.id)}
            className="w-full flex items-center justify-center gap-1.5 mt-1 py-1.5 text-[11px]
              font-semibold text-gray-400 border border-dashed border-gray-300 rounded-lg
              hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <Plus size={12} />
            Add field to this section
          </button>
        </div>
      )}
    </div>
  );
}