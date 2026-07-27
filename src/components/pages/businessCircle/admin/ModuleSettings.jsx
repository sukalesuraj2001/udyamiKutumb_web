import React, { useState } from "react";

const RULES_INIT = [
  { id: "cat_excl",       label: "Category exclusivity per circle"      },
  { id: "tag_excl",       label: "Exclusivity at tag level (not sector)" },
  { id: "flag_same",      label: "Flag same-name tags across sectors"    },
  { id: "gratitude_priv", label: "Gratitude Slip amounts private"        },
  { id: "auto_flag",      label: "Auto-flag <70% attendance"             },
  { id: "substitutes",    label: "Substitutes allowed"                   },
];

const VALUES_INIT = [
  { id: "meeting_cadence",   label: "Meeting cadence",       value: "Weekly · Thu" },
  { id: "spinoff_threshold", label: "Spin-off threshold",    value: "25 active"    },
  { id: "ward_fill",         label: "Ward fill target",      value: "68 members"   },
  { id: "appeal_auto",       label: "Appeal auto-escalate",  value: "7 days"       },
  { id: "guest_visits",      label: "Guest visits before apply", value: "2"        },
];

export default function ModuleSettings() {
  const [rules, setRules]   = useState(() => RULES_INIT.reduce((a, r) => ({ ...a, [r.id]: true }), {}));
  const [values, setValues] = useState(VALUES_INIT);

  const toggle = (id) => setRules((p) => ({ ...p, [id]: !p[id] }));
  const updateVal = (id, val) => setValues((p) => p.map((v) => v.id === id ? { ...v, value: val } : v));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#111827]">Module settings</h2>
        <button className="bg-[#1B4332] hover:bg-[#14532D] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-xl transition-colors">
          Save configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Rules */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[13px] text-[#6B7280] font-medium mb-4">Rules</p>
          <div className="space-y-2">
            {RULES_INIT.map(({ id, label }) => (
              <div key={id} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
                <span className="text-[13.5px] text-[#374151]">{label}</span>
                <button
                  onClick={() => toggle(id)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${rules[id] ? "bg-[#1B4332]" : "bg-[#D1D5DB]"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${rules[id] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-[13px] text-[#6B7280] font-medium mb-4">Values</p>
          <table className="w-full text-[13.5px]">
            <tbody>
              {values.map(({ id, label, value }, i) => (
                <tr key={id} className={i < values.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                  <td className="py-3 text-[#374151]">{label}</td>
                  <td className="py-3 text-right">
                    <input
                      value={value}
                      onChange={(e) => updateVal(id, e.target.value)}
                      className="text-right text-[#111827] font-medium bg-transparent outline-none border-b border-transparent focus:border-[#1B4332] w-36 transition-colors"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
