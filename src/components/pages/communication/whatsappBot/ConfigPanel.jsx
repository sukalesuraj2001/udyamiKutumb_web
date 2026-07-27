import React from "react";
import { Bot, Briefcase, Sun, Trophy, X, Plus } from "lucide-react";

const AVATARS = [
  { key: "bot",       icon: Bot       },
  { key: "briefcase", icon: Briefcase },
  { key: "sun",       icon: Sun       },
  { key: "trophy",    icon: Trophy    },
];

const LANGUAGES        = ["Hindi", "English", "Marathi", "Kannada", "Hinglish"];
const TONES            = ["Helpful & Friendly", "Professional", "Motivational"];
const RESPONSE_LENGTHS = ["Brief", "Balanced", "Detailed"];

const EXPERTISE_OPTIONS = [
  { key: "compliance", label: "Business Registration & Compliance (GST, MSME, Udyam)" },
  { key: "schemes",    label: "Government Schemes (PM Mudra, Stand-Up India, Startup India)" },
  { key: "leads",      label: "Lead Generation & Sales Tips" },
  { key: "membership", label: "Membership Plans & Benefits" },
  { key: "events",     label: "Events & Ward Meetings" },
  { key: "training",   label: "Skill Training & Job Placement" },
  { key: "women",      label: "Women Entrepreneur (Udyami Queens) Support" },
];

const ESCALATION_OPTIONS = [
  { key: "refund",     label: "Member asks for refund" },
  { key: "complaint",  label: "Complaint or grievance detected" },
  { key: "unresolved", label: "Query not resolved after 3 turns" },
  { key: "human",      label: "Member explicitly asks for human" },
];

const ESCALATION_CONTACTS = [
  "Rohit Patil — Ward 14 Shivajinagar",
  "Anita Deshmukh — Ward 7 Kothrud",
  "Suresh Nair — Ward 22 Hadapsar",
];

// Shared input / select / textarea class
const inputCls =
  "w-full min-w-0 border border-gray-200 rounded-xl px-3.5 py-2.5 " +
  "text-[13.5px] text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200";

export default function ConfigPanel({ config, setConfig, onSave, onDeploy }) {
  const update = (patch) => setConfig((c) => ({ ...c, ...patch }));

  const toggleExpertise  = (key) => update({ expertise:       { ...config.expertise,       [key]: !config.expertise[key]       } });
  const toggleEscalation = (key) => update({ escalationRules: { ...config.escalationRules, [key]: !config.escalationRules[key] } });
  const removeQuickReply = (id)  => update({ quickReplies: config.quickReplies.filter((q) => q.id !== id) });

  const [newReply, setNewReply] = React.useState("");
  const addQuickReply = () => {
    const label = newReply.trim();
    if (!label) return;
    update({ quickReplies: [...config.quickReplies, { id: `qr-${Date.now()}`, label }] });
    setNewReply("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-7">

      {/* Header */}
      <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
        <Bot size={19} className="text-blue-500" /> Configure Your AI Assistant
      </h2>

      {/* ── A. Bot Identity ─────────────────────────────────────────── */}
      <section>
        <SectionLabel letter="A" title="Bot Identity" />

        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Bot Name</label>
        <input
          value={config.botName}
          onChange={(e) => update({ botName: e.target.value })}
          className={`${inputCls} mb-4`}
        />

        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Bot Avatar</label>
        <div className="flex gap-2.5 mb-4">
          {AVATARS.map((a) => (
            <button
              key={a.key}
              onClick={() => update({ avatarKey: a.key })}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                config.avatarKey === a.key
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <a.icon size={19} className={config.avatarKey === a.key ? "text-blue-600" : "text-gray-500"} />
            </button>
          ))}
        </div>

        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Welcome Message</label>
        <textarea
          value={config.welcomeMessage}
          onChange={(e) => update({ welcomeMessage: e.target.value })}
          rows={4}
          className={`${inputCls} resize-y`}
        />
      </section>

      {/* ── B. AI Personality ───────────────────────────────────────── */}
      <section>
        <SectionLabel letter="B" title="AI Personality" />

        <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Primary Language</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {LANGUAGES.map((l) => (
            <Chip key={l} active={config.language === l} onClick={() => update({ language: l })}>{l}</Chip>
          ))}
        </div>

        <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Tone</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {TONES.map((t) => (
            <Chip key={t} active={config.tone === t} onClick={() => update({ tone: t })}>{t}</Chip>
          ))}
        </div>

        <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Response Length</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {RESPONSE_LENGTHS.map((r) => (
            <Chip key={r} active={config.responseLength === r} onClick={() => update({ responseLength: r })}>{r}</Chip>
          ))}
        </div>

        <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Areas of Expertise</label>
        <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3">
          {EXPERTISE_OPTIONS.map((opt) => (
            <CheckRow
              key={opt.key}
              checked={!!config.expertise[opt.key]}
              onToggle={() => toggleExpertise(opt.key)}
              label={opt.label}
            />
          ))}
        </div>
      </section>

      {/* ── C. Quick Reply Buttons ──────────────────────────────────── */}
      <section>
        <SectionLabel letter="C" title="Quick Reply Buttons" />

        <div className="flex flex-wrap gap-2 mb-3">
          {config.quickReplies.map((q) => (
            <span
              key={q.id}
              className="flex items-center gap-1.5 bg-gray-800 text-white
                         text-[12.5px] font-medium pl-3 pr-2 py-1.5 rounded-full"
            >
              {q.label}
              <button onClick={() => removeQuickReply(q.id)} className="hover:text-white/60">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuickReply()}
            placeholder="New quick reply"
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3.5 py-2
                       text-[13px] text-gray-800 placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          />
          <button
            onClick={addQuickReply}
            className="flex items-center gap-1.5 border border-gray-200 text-[13px] font-semibold
                       text-gray-700 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors shrink-0"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </section>

      {/* ── D. Escalation Rules ─────────────────────────────────────── */}
      <section>
        <SectionLabel letter="D" title="Escalation Rules" />

        <div className="space-y-2 mb-4">
          {ESCALATION_OPTIONS.map((opt) => (
            <CheckRow
              key={opt.key}
              checked={!!config.escalationRules[opt.key]}
              onToggle={() => toggleEscalation(opt.key)}
              label={opt.label}
            />
          ))}
        </div>

        <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
          Escalation contact
        </label>
        <select
          value={config.escalationContact}
          onChange={(e) => update({ escalationContact: e.target.value })}
          className={inputCls}
        >
          {ESCALATION_CONTACTS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={onSave}
          className="w-full bg-blue-600 text-white text-[13.5px] font-semibold py-3 rounded-xl
                     hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-200"
        >
          Save Configuration
        </button>
        <button
          onClick={onDeploy}
          className="w-full bg-green-600 text-white text-[13.5px] font-semibold py-3 rounded-xl
                     hover:bg-green-700 active:scale-[0.98] transition-all shadow-sm shadow-green-200"
        >
          Deploy to WhatsApp
        </button>
      </div>

    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ letter, title }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
      {letter} · {title}
    </p>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

// ── CheckRow ──────────────────────────────────────────────────────────────────

function CheckRow({ checked, onToggle, label }) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-2.5 text-left">
      <span
        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-white" />}
      </span>
      <span className="text-[13px] text-gray-700 leading-snug">{label}</span>
    </button>
  );
}