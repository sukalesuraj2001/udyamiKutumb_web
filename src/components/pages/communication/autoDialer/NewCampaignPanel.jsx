import React, { useState } from "react";
import { X, Sparkles, PenLine, Upload, Eye } from "lucide-react";

const PURPOSES  = ["Lead Qualification", "Membership Renewal", "Event Invite", "Feedback Survey"];
const LANGUAGES = ["Hindi", "English", "Tamil", "Kannada", "Telugu"];
const TONES     = ["Friendly", "Formal", "Persuasive", "Neutral"];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13.5px] " +
  "text-gray-800 placeholder:text-gray-400 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function NewCampaignPanel({ onClose, onCreate }) {
  const [name,             setName]             = useState("");
  const [purpose,          setPurpose]          = useState(PURPOSES[0]);
  const [language,         setLanguage]         = useState(LANGUAGES[0]);
  const [tone,             setTone]             = useState(TONES[0]);
  const [scriptMode,       setScriptMode]       = useState("ai");
  const [script,           setScript]           = useState("");
  const [sendImmediately,  setSendImmediately]  = useState(true);
  const [budgetLimit,      setBudgetLimit]      = useState(0);
  const [retryAttempts,    setRetryAttempts]    = useState(2);
  const [retryInterval,    setRetryInterval]    = useState("4hrs");
  const [recordCalls,      setRecordCalls]      = useState(false);
  const [blackoutEnabled,  setBlackoutEnabled]  = useState(true);
  const [blackoutStart,    setBlackoutStart]    = useState("21:00");
  const [blackoutEnd,      setBlackoutEnd]      = useState("08:00");
  const [callListMode,     setCallListMode]     = useState("csv");
  const [contactCount,     setContactCount]     = useState(0);

  const handleGenerateScript = () => {
    setScript(`Hello {first_name}, this is a call from Udyami Bharat regarding ${purpose.toLowerCase()}. ...`);
  };

  const handleSubmit = (asDraft) => {
    onCreate({
      id: `camp-${Date.now()}`,
      name: name.trim() || "Untitled Campaign",
      purposeTag: purpose,
      languageTag: language,
      status: asDraft ? "Draft" : sendImmediately ? "Running" : "Scheduled",
      contacts: contactCount,
      called: 0, connected: 0, failed: 0,
      budget: Number(budgetLimit) || 0,
      scheduledAt: sendImmediately ? "Immediate" : "—",
      progressPct: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto">

        {/* Sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5
                        flex items-start justify-between z-10">
          <div>
            <h2 className="text-[20px] font-bold text-gray-800">New IVR Campaign</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Configure your outbound voice campaign.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* ── 1. Campaign Details ── */}
          <section>
            <SectionTitle n="1" title="Campaign Details" />

            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Campaign Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. April Membership Renewal Drive"
              className={`${inputCls} mb-4`}
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Purpose *</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputCls}>
                  {PURPOSES.map((p)  => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Language *</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputCls}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </section>

          {/* ── 2. IVR Script ── */}
          <section>
            <SectionTitle n="2" title="IVR Script" />

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setScriptMode("ai")}
                className={`flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                  scriptMode === "ai"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Sparkles size={14} /> AI Generate
              </button>
              <button
                onClick={() => setScriptMode("manual")}
                className={`flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                  scriptMode === "manual"
                    ? "bg-gray-800 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <PenLine size={14} /> Write Manually
              </button>
              {scriptMode === "ai" && (
                <button
                  onClick={handleGenerateScript}
                  className="flex items-center gap-1.5 text-[13px] font-semibold
                             text-blue-600 border border-blue-200 px-3.5 py-2 rounded-xl
                             hover:bg-blue-50 transition-colors ml-auto"
                >
                  <Sparkles size={14} /> Generate
                </button>
              )}
            </div>

            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              readOnly={scriptMode === "ai" && !script}
              placeholder="Click 'Generate' to create one with AI…"
              rows={5}
              className={`${inputCls} resize-y font-mono text-[13px]`}
            />
            <button className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-400 hover:text-gray-700 mt-2 transition-colors">
              <Eye size={14} /> Preview Script
            </button>
          </section>

          {/* ── 3. Schedule & Settings ── */}
          <section>
            <SectionTitle n="3" title="Schedule & Settings" />

            <ToggleRow
              label="Send Immediately"
              sublabel="Disables the date/time pickers"
              checked={sendImmediately}
              onChange={setSendImmediately}
            />

            <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Budget Limit (₹)</label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className={inputCls}
                />
                <p className="text-[11px] text-gray-400 mt-1">0 = unlimited</p>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Retry Attempts</label>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRetryAttempts(n)}
                      className={`flex-1 text-[13px] font-semibold py-2 rounded-lg transition-colors ${
                        retryAttempts === n
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Retry Interval</label>
                <div className="flex gap-1.5">
                  {["2hrs", "4hrs", "Next Day"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRetryInterval(v)}
                      className={`flex-1 text-[12px] font-semibold py-2 rounded-lg transition-colors ${
                        retryInterval === v
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Record Calls</label>
                <div className="pt-1.5">
                  <Toggle checked={recordCalls} onChange={setRecordCalls} />
                </div>
              </div>
            </div>

            <ToggleRow
              label="Enforce blackout hours"
              sublabel={`No calls between ${blackoutStart} – ${blackoutEnd}`}
              checked={blackoutEnabled}
              onChange={setBlackoutEnabled}
            />

            {blackoutEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Start</label>
                  <input type="time" value={blackoutStart} onChange={(e) => setBlackoutStart(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">End</label>
                  <input type="time" value={blackoutEnd} onChange={(e) => setBlackoutEnd(e.target.value)} className={inputCls} />
                </div>
              </div>
            )}
          </section>

          {/* ── 4. Call List ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle n="4" title="Call List" noMargin />
              <span className="text-[11.5px] font-semibold border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full">
                {contactCount} contacts
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              {[{ key: "csv", label: "CSV" }, { key: "manual", label: "Manual" }, { key: "database", label: "Database" }].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setCallListMode(m.key)}
                  className={`flex-1 text-[13px] font-semibold py-2 rounded-xl transition-colors ${
                    callListMode === m.key
                      ? "bg-gray-800 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {callListMode === "csv" && (
              <>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed
                                  border-gray-200 rounded-xl py-8 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={22} className="text-gray-400" />
                  <span className="text-[13.5px] font-semibold text-gray-700">Drop CSV / Excel file here</span>
                  <span className="text-[11.5px] text-gray-400">Required columns: Name | Phone | Ward (optional)</span>
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden"
                    onChange={() => setContactCount(Math.floor(Math.random() * 200) + 20)} />
                </label>
                <button className="text-[12.5px] font-medium text-blue-600 hover:text-blue-800 mt-2 transition-colors">
                  Download sample CSV template
                </button>
              </>
            )}

            {callListMode === "manual" && (
              <textarea
                placeholder="Paste phone numbers, one per line"
                rows={5}
                onChange={(e) => setContactCount(e.target.value.split("\n").filter(Boolean).length)}
                className={`${inputCls} resize-y`}
              />
            )}

            {callListMode === "database" && (
              <p className="text-[13px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-8 text-center">
                Database contact picker coming soon.
              </p>
            )}
          </section>

          {/* ── 5. Summary & Save ── */}
          <section>
            <SectionTitle n="5" title="Summary & Save" />
            <div className="border border-gray-200 rounded-xl p-4 space-y-2 mb-5 bg-gray-50">
              <SummaryLine label="Campaign"      value={name || "—"} />
              <SummaryLine label="Total Contacts" value={contactCount} />
              <SummaryLine label="Language"       value={`${language} · ${purpose}`} />
              <SummaryLine label="Scheduled"      value={sendImmediately ? "Immediate" : "Custom"} />
              <SummaryLine label="Est. Duration"  value={`~${Math.round(contactCount * 1.5)} min`} />
              <SummaryLine label="Est. Cost"      value={`~₹${contactCount * 5}`} />
              <SummaryLine label="Budget"         value={`₹${budgetLimit || 0}`} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 border border-gray-200 text-gray-700 text-[13.5px] font-semibold
                           py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={!name.trim()}
                className="flex-1 bg-blue-600 text-white text-[13.5px] font-semibold py-3 rounded-xl
                           hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40
                           disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
              >
                Save & Schedule
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionTitle({ n, title, noMargin }) {
  return (
    <h3 className={`text-[14px] font-bold text-gray-800 ${noMargin ? "" : "mb-4"}`}>
      {n}. {title}
    </h3>
  );
}

function ToggleRow({ label, sublabel, checked, onChange }) {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-semibold text-gray-800">{label}</p>
        {sublabel && <p className="text-[11.5px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-[3px]"
      }`} />
    </button>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-gray-400">{label}:</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}