import { useState, useEffect } from "react";
import { Pencil, Plus, X, ChevronDown } from "lucide-react";
import { FIELD_TYPES } from "./data/Formbuilderdata.js";

const inputCls =
  "w-full h-9 px-3 text-[12.5px] text-gray-800 bg-white border border-gray-200 rounded-lg " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition placeholder:text-gray-300";

const selectCls =
  "w-full h-9 px-3 pr-8 text-[12.5px] text-gray-800 bg-white border border-gray-200 rounded-lg " +
  "appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition";

function Label({ children, required }) {
  return (
    <label className="block text-[11.5px] font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

/**
 * FieldEditorModal
 * Props:
 *   mode       – "edit" | "add"
 *   field      – existing field object (mode="edit") or null (mode="add")
 *   onSave     – (fieldData) => void
 *   onCancel   – () => void
 */
export default function FieldEditorModal({ mode, field, onSave, onCancel }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    type: "Text",
    placeholder: "",
    required: false,
    disabled: false,
  });

  // Pre-fill when editing
  useEffect(() => {
    if (isEdit && field) {
      setForm({
        name:        field.name        ?? "",
        type:        field.type        ?? "Text",
        placeholder: field.placeholder ?? "",
        required:    field.required    ?? false,
        disabled:    field.disabled    ?? false,
      });
    }
  }, [isEdit, field]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...(isEdit ? { id: field.id } : {}), ...form });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-xl border border-gray-200 w-[460px] max-w-[92vw] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              {isEdit
                ? <Pencil size={14} className="text-indigo-600" />
                : <Plus  size={14} className="text-indigo-600" />}
            </span>
            <h2 className="text-[13.5px] font-bold text-gray-900">
              {isEdit ? "Edit Field" : "Add New Field"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400
              hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Field Label */}
          <div>
            <Label required>Field Label</Label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Company Name"
              className={inputCls}
            />
          </div>

          {/* Field Type */}
          <div>
            <Label>Field Type</Label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={selectCls}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Placeholder */}
          <div>
            <Label>Placeholder / Helper Text</Label>
            <input
              name="placeholder"
              value={form.placeholder}
              onChange={handleChange}
              placeholder="e.g. Enter your full name"
              className={inputCls}
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border
              border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="required"
                checked={form.required}
                onChange={handleChange}
                className="accent-indigo-600 w-3.5 h-3.5"
              />
              <span className="text-[12px] font-semibold text-gray-700">Mark as Required</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border
              border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="disabled"
                checked={form.disabled}
                onChange={handleChange}
                className="accent-indigo-600 w-3.5 h-3.5"
              />
              <span className="text-[12px] font-semibold text-gray-700">Disable this field</span>
            </label>
          </div>

          {/* Info banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
            <p className="text-[11.5px] text-indigo-700 leading-relaxed">
              Field type determines how data is collected. You can change it anytime before publishing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="h-8 px-4 text-[12.5px] font-semibold text-gray-700 bg-white border
              border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="h-8 px-5 text-[12.5px] font-semibold text-white bg-indigo-600 rounded-lg
              hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50
              transition-all flex items-center gap-1.5"
          >
            {isEdit
              ? <><Pencil size={13} /> Save Changes</>
              : <><Plus size={13} /> Add Field</>}
          </button>
        </div>
      </div>
    </div>
  );
}