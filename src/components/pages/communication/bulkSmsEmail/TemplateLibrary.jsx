import React from "react";
import { Plus } from "lucide-react";
import { TEMPLATE_LIBRARY, TYPE_BADGE_CLASS, TYPE_LABEL } from "./TEMPLATE_LIBRARY.js";

export default function TemplateLibrary({ selectedTemplateId, onSelectTemplate, onNewCampaign, onCreateTemplate }) {
  return (
    <div className="space-y-4">

      {/* New Campaign CTA */}
      <button
        onClick={onNewCampaign}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white
                   text-[13.5px] font-semibold py-2.5 rounded-xl
                   hover:bg-blue-700 active:scale-[0.98]
                   transition-all shadow-sm shadow-blue-200"
      >
        <Plus size={16} /> New Campaign
      </button>

      {/* Section label */}
      <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 px-1">
        Template Library
      </p>

      {/* Template list */}
      <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
        {TEMPLATE_LIBRARY.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTemplate(t)}
            className={`w-full text-left rounded-xl border p-3.5 transition-colors ${selectedTemplateId === t.id
                ? "border-blue-200 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className={`text-[13.5px] font-semibold leading-tight ${selectedTemplateId === t.id ? "text-blue-700" : "text-gray-800"
                }`}>
                {t.name}
              </p>
              <span className={`shrink-0 text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE_CLASS[t.type]}`}>
                {TYPE_LABEL[t.type]}
              </span>
            </div>
            <span className="inline-block text-[11px] font-medium border border-gray-200 text-gray-400 px-2 py-0.5 rounded-full">
              {t.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Create Template */}
      <button
        onClick={onCreateTemplate}
        className="w-full flex items-center justify-center gap-2 border border-gray-200
                   text-gray-700 text-[13px] font-semibold py-2.5 rounded-xl
                   hover:bg-gray-50 transition-colors"
      >
        <Plus size={15} /> Create Template
      </button>

    </div>
  );
}