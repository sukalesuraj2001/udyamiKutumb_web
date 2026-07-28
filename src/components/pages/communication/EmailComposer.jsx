import { useRef, useEffect, useCallback } from "react";

const TB = [
  ["bold", "B"], ["italic", "I"], ["underline", "U"],
  null,
  ["insertOrderedList", "OL"], ["insertUnorderedList", "UL"],
  null,
  ["createLink", "🔗"],
];

export default function EmailComposer({
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  channel = "email",   // ← NEW prop
}) {
  const editorRef = useRef(null);

  const handleInput = useCallback(() => {
    onBodyChange?.(editorRef.current?.innerHTML ?? "");
  }, [onBodyChange]);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== body) el.innerHTML = body ?? "";
  }, [body]);

  const execCmd = (cmd) => {
    if (cmd === "createLink") {
      const url = prompt("URL:");
      if (url) document.execCommand(cmd, false, url);
    } else {
      document.execCommand(cmd, false, null);
    }
    editorRef.current?.focus();
    handleInput();
  };

  // ── channel-aware labels / placeholders ──────────────────
  const subjectLabel =
    channel === "email"    ? "Email subject"    :
    channel === "sms"      ? "SMS title"        :
    channel === "whatsapp" ? "WhatsApp title"   :
                             "IVR script title";

  const subjectPlaceholder =
    channel === "sms"      ? "e.g. Diwali Offer — {ward}"         :
    channel === "whatsapp" ? "e.g. Update from {district}"         :
    channel === "ivr"      ? "e.g. Monthly IVR announcement"       :
                             "e.g. Update from {ward} — {month} Newsletter";

  const bodyLabel =
    channel === "email"    ? "Email body"       :
    channel === "sms"      ? "SMS message"      :
    channel === "whatsapp" ? "WhatsApp message" :
                             "IVR call script";

  const bodyPlaceholder =
    channel === "sms"      ? "Type your SMS here. Use {first_name}, {ward}…" :
    channel === "whatsapp" ? "Type your WhatsApp message here…"               :
    channel === "ivr"      ? "Type your IVR call script here…"                :
                             "Type your email body here…";

  return (
    <div className="space-y-3">

      {/* Subject */}
      <div>
        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
          {subjectLabel}
        </label>
        <input
          value={subject}
          onChange={(e) => onSubjectChange?.(e.target.value)}
          placeholder={subjectPlaceholder}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px]
                     text-gray-800 placeholder:text-gray-400 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
          {bodyLabel}
        </label>

        {/* Toolbar */}
        <div className="flex items-center gap-1 flex-wrap border border-gray-200 border-b-0
                        rounded-t-xl px-3 py-2 bg-gray-50">
          {TB.map((item, i) =>
            item === null ? (
              <div key={i} className="w-px h-4 bg-gray-300 mx-1" />
            ) : (
              <button
                key={item[0]}
                onMouseDown={(e) => { e.preventDefault(); execCmd(item[0]); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[12px]
                           font-semibold text-gray-600 hover:bg-white hover:text-gray-900
                           hover:shadow-sm transition-all"
                title={item[0]}
              >
                {item[1]}
              </button>
            )
          )}
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          data-placeholder={bodyPlaceholder}
          className="min-h-[180px] border border-gray-200 rounded-b-xl px-4 py-3
                     text-[13.5px] text-gray-800 bg-white focus:outline-none
                     focus:ring-2 focus:ring-blue-200 leading-relaxed
                     empty:before:content-[attr(data-placeholder)]
                     empty:before:text-gray-400"
          style={{ whiteSpace: "pre-wrap" }}
        />
      </div>

      <style>{`.merge-chip{display:inline-block;background:#eff6ff;color:#2563eb;
        border:1px solid #bfdbfe;border-radius:4px;padding:0 5px;font-size:12px;
        font-weight:500;user-select:none;cursor:default}`}
      </style>
    </div>
  );
}