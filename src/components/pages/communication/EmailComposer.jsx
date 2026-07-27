import { useRef, useEffect, useCallback } from "react";

const MERGE_FIELDS = [
  { label: "First Name",      value: "first_name" },
  { label: "Ward",            value: "ward" },
  { label: "District",        value: "district" },
  { label: "Month",           value: "month" },
  { label: "Membership Type", value: "membership_type" },
];

const TB = [
  ["bold","B"],["italic","I"],["underline","U"],
  null,
  ["insertOrderedList","OL"],["insertUnorderedList","UL"],
  null,
  ["createLink","🔗"],
];

export default function EmailComposer({ subject, onSubjectChange, body, onBodyChange }) {
  const editorRef = useRef(null);

  // Sync outward on input
  const handleInput = useCallback(() => {
    onBodyChange?.(editorRef.current?.innerHTML ?? "");
  }, [onBodyChange]);

  // Keep editor in sync if body prop changes externally (e.g. clear)
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

  const insertMerge = (field) => {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML", false,
      `<span class="merge-chip" contenteditable="false">{{${field}}}</span>&nbsp;`
    );
    handleInput();
  };

  return (
    <div className="space-y-3">
      {/* Subject */}
      <div>
        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
          Email Subject
        </label>
        <input
          value={subject}
          onChange={(e) => onSubjectChange?.(e.target.value)}
          placeholder="e.g. Update from {ward} — {month} Newsletter"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px]
                     text-gray-800 placeholder:text-gray-400 bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
          Email Body
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
          data-placeholder="Type your email here…"
          className="min-h-[180px] border border-gray-200 rounded-b-xl px-4 py-3
                     text-[13.5px] text-gray-800 bg-white focus:outline-none
                     focus:ring-2 focus:ring-blue-200 leading-relaxed
                     empty:before:content-[attr(data-placeholder)]
                     empty:before:text-gray-400"
          style={{ whiteSpace: "pre-wrap" }}
        />

        {/* Merge pills */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {/* <span className="text-[11.5px] text-gray-400">Insert:</span> */}
          {/* {MERGE_FIELDS.map((f) => (
            <button
              key={f.value}
              onMouseDown={(e) => { e.preventDefault(); insertMerge(f.value); }}
              className="text-[11.5px] font-medium px-2.5 py-1 rounded-full
                         bg-blue-50 text-blue-600 border border-blue-200
                         hover:bg-blue-100 transition-colors"
            >
              {"{{"}{f.label}{"}}"}
            </button>
          ))} */}
        </div>
      </div>

      {/* Chip style injected once */}
      <style>{`.merge-chip{display:inline-block;background:#eff6ff;color:#2563eb;
        border:1px solid #bfdbfe;border-radius:4px;padding:0 5px;font-size:12px;
        font-weight:500;user-select:none;cursor:default}`}
      </style>
    </div>
  );
}