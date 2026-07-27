import React from "react";

/**
 * @param {"text"|"select"|"date"|"url"|"textarea"|"chips"} type
 * @param {string[]} [options] - for select
 * @param {string[]} [chips] - for chips (multi-select tag toggles)
 */
export default function CpFormFeild({ label, required, type = "text", value, onChange, options, chips, placeholder }) {
  if (type === "chips") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (chip) =>
      onChange(selected.includes(chip) ? selected.filter((c) => c !== chip) : [...selected, chip]);

    return (
      <div>
        <label className="text-[13px] font-medium text-ink mb-1.5 block">{label}</label>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selected.includes(c) ? "bg-ink text-white border-ink" : "border-hairline text-ink hover:bg-ink/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div>
        <label className="text-[13px] font-medium text-ink mb-1.5 block">
          {label} {required && <span className="text-brick">*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30"
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="text-[13px] font-medium text-ink mb-1.5 block">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink focus:outline-none focus:ring-2 focus:ring-amber/30 resize-y"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="text-[13px] font-medium text-ink mb-1.5 block">
        {label} {required && <span className="text-brick">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 border border-hairline rounded-xl px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber/30"
      />
    </div>
  );
}