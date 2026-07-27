import { useState } from "react";
import { Search, Plus, LayoutList } from "lucide-react";
import BuilderSection from "./BuilderSection";

/**
 * BuilderSidebar (Left Panel)
 * Props:
 *   sections        – array of section objects
 *   activeSection   – id of the currently active section
 *   expandedMap     – { [sectionId]: boolean }
 *   onToggleSection – (sectionId) => void
 *   onEditField     – (sectionId, fieldId) => void
 *   onDeleteField   – (sectionId, fieldId) => void
 *   onAddField      – (sectionId) => void
 *   onAddSection    – () => void
 */
export default function BuilderSidebar({
  sections,
  activeSection,
  expandedMap,
  onToggleSection,
  onEditField,
  onDeleteField,
  onAddField,
  onAddSection,
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? sections.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
      )
    : sections;

  return (
    <aside className="w-[300px] min-w-[280px] flex flex-col bg-white border-r border-gray-200 overflow-hidden">
      {/* Sidebar header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <LayoutList size={15} className="text-indigo-600" />
          <h2 className="text-[13px] font-bold text-gray-900">Form Structure</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections…"
            className="w-full h-8 pl-7 pr-3 text-[12px] text-gray-700 bg-gray-50 border
              border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300
              focus:border-indigo-400 transition placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Section list — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filtered.length === 0 ? (
          <p className="text-[12px] text-gray-400 text-center py-6">
            No sections match your search.
          </p>
        ) : (
          filtered.map((section) => (
            <BuilderSection
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              isExpanded={!!expandedMap[section.id]}
              onToggle={() => onToggleSection(section.id)}
              onEditField={onEditField}
              onDeleteField={onDeleteField}
              onAddField={onAddField}
            />
          ))
        )}
      </div>

      {/* Footer action buttons */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onAddSection}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[12px]
            font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg
            hover:bg-gray-50 transition-colors"
        >
          <Plus size={13} />
          Add Section
        </button>
        <button
          onClick={() => onAddField(activeSection)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[12px]
            font-semibold text-white bg-indigo-600 rounded-lg
            hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          <Plus size={13} />
          Add Field
        </button>
      </div>
    </aside>
  );
}