import { GripVertical, Pencil, Trash2, Lock } from "lucide-react";

const TYPE_COLORS = {
  Text: "bg-gray-100 text-gray-600",
  Email: "bg-blue-50 text-blue-600",
  Tel: "bg-teal-50 text-teal-600",
  Number: "bg-amber-50 text-amber-600",
  Date: "bg-purple-50 text-purple-600",
  URL: "bg-cyan-50 text-cyan-600",
  Select: "bg-indigo-50 text-indigo-600",
  Radio: "bg-pink-50 text-pink-600",
  Checkbox: "bg-orange-50 text-orange-600",
  Textarea: "bg-emerald-50 text-emerald-600",
};

/**
 * BuilderField
 * Props:
 *   field      – { id, label, type, required, disabled, isDefault? }
 *   id         – parent section id
 *   onEdit     – (id, fieldId) => void
 *   onDelete   – (id, fieldId) => void  ← blocked silently for isDefault fields
 */
export default function BuilderField({ field, id, onEdit, onDelete }) {
  const typeCls = TYPE_COLORS[field.type] ?? "bg-gray-100 text-gray-600";
  const isDefault = !!field.isDefault;

  const handleDelete = () => {
    // Default fields cannot be deleted — silently blocked
    if (isDefault) return;
    onDelete(id, field.id);
  };

  return (
    <div
      className={`group flex items-center gap-2 px-2.5 py-2 border rounded-lg mb-1.5
        transition-all cursor-default
        ${isDefault
          ? "bg-indigo-50/40 border-indigo-100 hover:border-indigo-200"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
    >
      {/* Drag handle */}
      <GripVertical
        size={14}
        className="text-gray-300 group-hover:text-gray-400 transition-colors shrink-0 cursor-grab"
      />

      {/* Field info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-semibold text-gray-800 truncate">
            {field.label || "Untitled Field"}
          </span>



          {field.required && (
            <span className="inline-flex items-center text-[9.5px] font-bold
              bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">
              REQ
            </span>
          )}
          {field.disabled && (
            <span className="inline-flex items-center text-[9.5px] font-bold
              bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
              OFF
            </span>
          )}
        </div>

        <span className={`inline-flex mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeCls}`}>
          {field.type}
        </span>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Edit always allowed */}
        <button
          onClick={() => onEdit(id, field.id)}
          title="Edit field"
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400
            hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <Pencil size={12} />
        </button>

        {/* Delete: greyed-out + cursor-not-allowed for default fields */}
        <button
          onClick={() => onDelete(id, field.id)}
          title="Delete field"
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400
    hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}