import { useState, useRef } from "react";
import { ChevronDown, GripVertical, Plus, Pencil, Check } from "lucide-react";
import BuilderField from "./Builderfield";

/**
 * BuilderSection
 * Props:
 *   section         – { id, title, icon, subtitle, fields[] }
 *   isActive        – boolean
 *   isExpanded      – boolean
 *   onToggle        – () => void
 *   onEditField     – (id, fieldId) => void
 *   onDeleteField   – (id, fieldId) => void
 *   onAddField      – (id) => void
 *   onRenameSection – (id, newTitle) => void   ← NEW
 */
export default function BuilderSection({
  section,
  isActive,
  isExpanded,
  onToggle,
  onEditField,
  onDeleteField,
  onAddField,
  onRenameSection,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.title);
  const inputRef = useRef(null);

  const startEdit = (e) => {
    e.stopPropagation(); // don't toggle expand
    setDraft(section.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== section.title) {
      onRenameSection(section.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

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
        onClick={!editing ? onToggle : undefined}
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-colors
          ${isActive ? "bg-indigo-50" : "bg-white hover:bg-gray-50"}
          ${editing ? "cursor-default" : ""}`}
      >
        {/* Drag handle */}
        <GripVertical
          size={14}
          className="text-gray-300 hover:text-gray-400 cursor-grab shrink-0"
        />

        {/* Icon */}
        <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-[13px] shrink-0">
          {section.icon || "📋"}
        </span>

        {/* Title — editable inline */}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-[12px] font-semibold text-indigo-700 bg-white border
              border-indigo-400 rounded-md px-2 h-6 outline-none focus:ring-2
              focus:ring-indigo-300 transition min-w-0"
          />
        ) : (
          <span
            className={`flex-1 text-[12px] font-semibold truncate
              ${isActive ? "text-indigo-700" : "text-gray-800"}`}
          >
            {section.title}
          </span>
        )}

        {/* Edit / Confirm button */}
        {editing ? (
          <button
            onClick={(e) => { e.stopPropagation(); commitEdit(); }}
            className="w-5 h-5 flex items-center justify-center rounded text-indigo-600
              hover:bg-indigo-100 transition-colors shrink-0"
          >
            <Check size={12} />
          </button>
        ) : (
          <button
            onClick={startEdit}
            className="w-5 h-5 flex items-center justify-center rounded text-gray-300
              hover:text-indigo-500 hover:bg-indigo-50 transition-colors shrink-0"
            title="Rename section"
          >
            <Pencil size={11} />
          </button>
        )}

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
                id={section.id}
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