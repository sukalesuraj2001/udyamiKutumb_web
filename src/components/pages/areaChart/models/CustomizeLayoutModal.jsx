import React, { useState } from "react";
import { X, Minus, Plus, ChevronDown } from "lucide-react";

export default function CustomizeLayoutModal({ wardName, config, onClose, onSave }) {
  const [draft, setDraft] = useState(config);
  const [openSection, setOpenSection] = useState({ slots: true, sectors: true, ums: false, brandTiles: false });
  const [customSector, setCustomSector] = useState("");

  const updateCount = (key, delta) =>
    setDraft((d) => ({ ...d, slotCounts: { ...d.slotCounts, [key]: Math.max(0, d.slotCounts[key] + delta) } }));

  const toggleSector = (key) =>
    setDraft((d) => ({
      ...d,
      sectors: d.sectors.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)),
    }));

  const toggleUms = (key) =>
    setDraft((d) => ({
      ...d,
      umsRoles: d.umsRoles.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)),
    }));

  // Brand tiles are grouped by category (UB Queen's / Realty Construction / Finance & IT / PAC).
  // Toggling one flips just that product, inside just that category — everything else in draft.brandTiles stays untouched.
  const toggleBrandTile = (categoryKey, productName) =>
    setDraft((d) => ({
      ...d,
      brandTiles: d.brandTiles.map((cat) =>
        cat.key === categoryKey
          ? { ...cat, products: cat.products.map((p) => (p.name === productName ? { ...p, enabled: !p.enabled } : p)) }
          : cat
      ),
    }));

  const addCustomSector = () => {
    const name = customSector.trim();
    if (!name) return;
    setDraft((d) => ({
      ...d,
      sectors: [...d.sectors, { key: name.toLowerCase().replace(/\s+/g, "-"), label: name, enabled: true }],
    }));
    setCustomSector("");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-hairline">
          <div className="flex items-start justify-between">
            <h2 className="font-display text-[20px] text-ink">Customize Layout</h2>
            <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
          </div>
          <p className="text-[13px] text-muted mt-1">
            Add or remove boxes for {wardName}. Anything left on stays standard.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Slot counts */}
          <Section title="Slot counts" open={openSection.slots} onToggle={() => setOpenSection((o) => ({ ...o, slots: !o.slots }))}>
            {[
              { key: "patrons", label: "Patrons" },
              { key: "chairmen", label: "Chairmen" },
              { key: "advisories", label: "Advisories (per unit)" },
              { key: "mentors", label: "Mentors (per unit)" },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between py-1.5">
                <span className="text-[13.5px] text-ink">{s.label}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCount(s.key, -1)} className="w-7 h-7 rounded-lg border border-hairline flex items-center justify-center hover:bg-ink/5">
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center text-[13.5px] font-semibold text-ink tabular-nums">{draft.slotCounts[s.key]}</span>
                  <button onClick={() => updateCount(s.key, 1)} className="w-7 h-7 rounded-lg border border-hairline flex items-center justify-center hover:bg-ink/5">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </Section>

          {/* Sectors */}
          <Section title="Sectors (Page 3 red grid)" open={openSection.sectors} onToggle={() => setOpenSection((o) => ({ ...o, sectors: !o.sectors }))}>
            {draft.sectors.map((s) => (
              <ToggleRow key={s.key} label={s.label} enabled={s.enabled} onToggle={() => toggleSector(s.key)} />
            ))}
            <div className="flex items-center gap-2 mt-2">
              <input
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Add custom sector…"
                className="flex-1 border border-hairline rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber/30"
              />
              <button onClick={addCustomSector} className="w-9 h-9 shrink-0 rounded-lg bg-ink text-white flex items-center justify-center hover:bg-ink/90">
                <Plus size={16} />
              </button>
            </div>
          </Section>

          {/* UMS roles */}
          <Section title="UMS roles (Page 3)" open={openSection.ums} onToggle={() => setOpenSection((o) => ({ ...o, ums: !o.ums }))}>
            {draft.umsRoles.map((s) => (
              <ToggleRow key={s.key} label={s.label} enabled={s.enabled} onToggle={() => toggleUms(s.key)} />
            ))}
          </Section>

          {/* Brand tiles (Products page) — grouped by category */}
          <Section title="Brand tiles (Page 4)" open={openSection.brandTiles} onToggle={() => setOpenSection((o) => ({ ...o, brandTiles: !o.brandTiles }))}>
            <div className="space-y-4">
              {draft.brandTiles.map((cat) => (
                <div key={cat.key}>
                  <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-2">{cat.label}</p>
                  <div className="space-y-1">
                    {cat.products.map((p) => (
                      <ToggleRow
                        key={p.name}
                        label={p.name}
                        enabled={p.enabled}
                        onToggle={() => toggleBrandTile(cat.key, p.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex gap-3 p-6 border-t border-hairline">
          <button onClick={() => setDraft(config)} className="flex-1 border border-hairline text-ink text-[13.5px] font-medium py-2.5 rounded-xl hover:bg-ink/5">
            Reset
          </button>
          <button onClick={onClose} className="flex-1 border border-hairline text-ink text-[13.5px] font-medium py-2.5 rounded-xl hover:bg-ink/5">
            Cancel
          </button>
          <button onClick={() => onSave(draft)} className="flex-1 bg-ink text-white text-[13.5px] font-semibold py-2.5 rounded-xl hover:bg-ink/90">
            Save layout
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between mb-2">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function ToggleRow({ label, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-1">
      <button
        onClick={onToggle}
        className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${enabled ? "bg-ink" : "bg-hairline"}`}
        style={{ height: 22 }}
      >
        <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-[20px]" : "translate-x-[3px]"}`} />
      </button>
      <span
        className={`flex-1 ml-3 text-[13px] border border-hairline rounded-lg px-3 py-1.5 transition-colors ${
          enabled ? "text-ink" : "text-muted/60 line-through"
        }`}
      >
        {label}
      </span>
    </div>
  );
}