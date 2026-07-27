import React, { useMemo } from "react";
import { Smartphone } from "lucide-react";
import { TEMPLATE_LIBRARY, TYPE_LABEL } from "./TEMPLATE_LIBRARY.js";

const VARIABLES = ["{first_name}", "{business_name}", "{ward_name}", "{lead_count}"];

const MOCK_RECIPIENT = {
  "{first_name}": "Priya",
  "{business_name}": "Shivaji Textiles",
  "{ward_name}": "Shivajinagar Ward 14",
  "{lead_count}": "6",
};

export default function CampaignComposer({
  campaignName, setCampaignName,
  type, setType,
  templateId, setTemplateId,
  messageBody, setMessageBody,
  previewMode, setPreviewMode,
}) {
  const insertVariable = (variable) => {
    setMessageBody((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${variable}`);
  };

  const charCount = messageBody.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));

  // counter color — dashboard-safe tokens
  const counterClass =
    charCount === 0     ? "text-gray-400" :
    segments === 1      ? "text-green-600" :
    segments <= 3       ? "text-amber-500" :
                          "text-red-500";

  const previewText = useMemo(() => {
    if (previewMode === "generic") return messageBody || "Your message will appear here.";
    let text = messageBody;
    Object.entries(MOCK_RECIPIENT).forEach(([token, value]) => {
      text = text.replaceAll(token, value);
    });
    return text || "Your message will appear here.";
  }, [messageBody, previewMode]);

  const filteredTemplatesForType = TEMPLATE_LIBRARY.filter((t) => t.type === type);

  // Shared input class
  const inputCls =
    "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] text-gray-800 " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">

      {/* Header */}
      <h2 className="text-[17px] font-bold text-gray-800 mb-5">Campaign Composer</h2>

      {/* Campaign Name */}
      <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
        Campaign Name
      </label>
      <input
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        placeholder="e.g. Diwali Business Boost"
        className={`${inputCls} mb-5`}
      />

      {/* Type toggle */}
      <p className="text-[13px] font-semibold text-gray-700 mb-2">Type</p>
      <div className="flex gap-2 mb-5">
        {["sms", "email", "whatsapp"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 text-[13px] font-semibold py-2 rounded-xl transition-colors ${
              type === t
                ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {/* Template select */}
      <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
        Template
      </label>
      <select
        value={templateId || ""}
        onChange={(e) => setTemplateId(e.target.value)}
        className={`${inputCls} mb-5`}
      >
        <option value="">Select a template…</option>
        {filteredTemplatesForType.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* Message body */}
      <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
        Message Body
      </label>
      <textarea
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
        placeholder="Type your message…"
        rows={5}
        className={`${inputCls} resize-y`}
      />

      {/* SMS counter */}
      {type === "sms" && (
        <p className={`text-[11.5px] font-medium mt-1.5 ${counterClass}`}>
          {charCount} / 160 chars — {segments} segment{segments !== 1 ? "s" : ""}
        </p>
      )}

      {/* Variable chips */}
      <div className="flex flex-wrap gap-2 mt-4 mb-6">
        {VARIABLES.map((v) => (
          <button
            key={v}
            onClick={() => insertVariable(v)}
            className="text-[12px] font-medium border border-gray-200 text-gray-600
                       px-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {v}
          </button>
        ))}
      </div>

      {/* Preview header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-semibold text-gray-700">Preview</p>

        {/* Toggle pill */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          {[
            { key: "personalized", label: "Personalized" },
            { key: "generic",      label: "Generic"       },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPreviewMode(key)}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-md transition-colors ${
                previewMode === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview phone card */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-2xl p-5 max-w-sm w-full">
          <p className="flex items-center gap-2 text-[11.5px] text-gray-400 mb-3">
            <Smartphone size={13} /> Preview · Mock Recipient
          </p>
          <div className="bg-white/10 rounded-xl px-4 py-3.5">
            <p className="text-[13.5px] text-white leading-relaxed">{previewText}</p>
          </div>
        </div>
      </div>

    </div>
  );
}