import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ChevronDown } from "lucide-react";

// ── Udyami Royal titles — new section ──────────────────────────
const UDYAMI_TITLES = [
  { key: "king", label: "Udyami King" },
  { key: "queens", label: "Udyami Queens" },
  { key: "prices", label: "Udyami Prices" },
  { key: "princess", label: "Udyami Princess" },
];

export default function CustomizeLayoutModal({ wardName, config, onClose, onSave }) {
  const [draft, setDraft] = useState(() => ({
    ...config,
    udyamiTitles: config.udyamiTitles ||
      UDYAMI_TITLES.map((t) => ({ ...t, enabled: true })),
  }));

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [openSection, setOpenSection] = useState({
    slots: true,
    udyami: true,
    sectors: true,
    ums: false,
    brandTiles: false,
  });

  const [customSector, setCustomSector] = useState("");

  const toggle = (section) =>
    setOpenSection((o) => ({ ...o, [section]: !o[section] }));

  const updateCount = (key, delta) =>
    setDraft((d) => ({
      ...d,
      slotCounts: {
        ...d.slotCounts,
        [key]: Math.max(0, (d.slotCounts[key] ?? 0) + delta),
      },
    }));

  const toggleSector = (key) =>
    setDraft((d) => ({
      ...d,
      sectors: d.sectors.map((s) =>
        s.key === key ? { ...s, enabled: !s.enabled } : s
      ),
    }));

  const toggleUms = (key) =>
    setDraft((d) => ({
      ...d,
      umsRoles: d.umsRoles.map((s) =>
        s.key === key ? { ...s, enabled: !s.enabled } : s
      ),
    }));

  const toggleUdyamiTitle = (key) =>
    setDraft((d) => ({
      ...d,
      udyamiTitles: d.udyamiTitles.map((t) =>
        t.key === key ? { ...t, enabled: !t.enabled } : t
      ),
    }));

  const toggleBrandTile = (categoryKey, productName) =>
    setDraft((d) => ({
      ...d,
      brandTiles: d.brandTiles.map((cat) =>
        cat.key === categoryKey
          ? {
            ...cat,
            products: cat.products.map((p) =>
              p.name === productName ? { ...p, enabled: !p.enabled } : p
            ),
          }
          : cat
      ),
    }));

  const addCustomSector = () => {
    const name = customSector.trim();
    if (!name) return;
    setDraft((d) => ({
      ...d,
      sectors: [
        ...d.sectors,
        { key: name.toLowerCase().replace(/\s+/g, "-"), label: name, enabled: true },
      ],
    }));
    setCustomSector("");
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300 ${animate ? "translate-x-0 opacity-100 ease-out" : "translate-x-full opacity-0 ease-in"}`}>

        {/* ── Header ── */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                Customize Layout
              </h2>
              <p className="text-[12.5px] text-gray-400 mt-0.5">
                {wardName} — configure slots & visibility
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

          {/* Slot counts */}
          <Section
            title="Slot Counts"
            badge={null}
            open={openSection.slots}
            onToggle={() => toggle("slots")}
          >
            {[
              { key: "patrons", label: "Patrons" },
              { key: "chairmenPage2", label: "Chairmen (Page 2)" },
              { key: "advisories", label: "Advisories" },
              { key: "mentors", label: "Mentors" },
              { key: "udyamiQueens", label: "UB Queen's" },
              { key: "ubRealtyConstruction", label: "UB Realty Construction" }, 
              { key: "ubFinanceIT", label: "UB Finance & IT" },         
              { key: "ubSocialBrand", label: "UB Social & Brand" },      
            ].map((s) => (
              <CountRow
                key={s.key}
                label={s.label}
                value={draft.slotCounts[s.key] ?? 0}
                onDecrement={() => updateCount(s.key, -1)}
                onIncrement={() => updateCount(s.key, 1)}
              />
            ))}
          </Section>

          {/* Udyami Titles — NEW */}
          {/* <Section
            title="Udyami Titles"
            badge="NEW"
            open={openSection.udyami}
            onToggle={() => toggle("udyami")}
          >
            <div className="grid grid-cols-2 gap-2">
              {draft.udyamiTitles.map((t) => (
                <TileToggle
                  key={t.key}
                  label={t.label}
                  enabled={t.enabled}
                  onToggle={() => toggleUdyamiTitle(t.key)}
                />
              ))}
            </div>
          </Section> */}

          {/* Sectors */}
          <Section
            title="Sectors"
            badge={`${draft.sectors.filter((s) => s.enabled).length} active`}
            open={openSection.sectors}
            onToggle={() => toggle("sectors")}
          >
            <div className="space-y-1">
              {draft.sectors.map((s) => (
                <ToggleRow
                  key={s.key}
                  label={s.label}
                  enabled={s.enabled}
                  onToggle={() => toggleSector(s.key)}
                />
              ))}
            </div>
            {/* Add custom */}
            <div className="flex gap-2 mt-3">
              <input
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomSector()}
                placeholder="Add custom sector…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              <button
                onClick={addCustomSector}
                className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
          </Section>

          {/* UMS Roles */}
          <Section
            title="UMS Roles"
            badge={`${draft.umsRoles.filter((s) => s.enabled).length} active`}
            open={openSection.ums}
            onToggle={() => toggle("ums")}
          >
            <div className="space-y-1">
              {draft.umsRoles.map((s) => (
                <ToggleRow
                  key={s.key}
                  label={s.label}
                  enabled={s.enabled}
                  onToggle={() => toggleUms(s.key)}
                />
              ))}
            </div>
          </Section>

          {/* Brand tiles */}
          <Section
            title="Brand Tiles (Products page)"
            badge={null}
            open={openSection.brandTiles}
            onToggle={() => toggle("brandTiles")}
          >
            <div className="space-y-5">
              {draft.brandTiles.map((cat) => (
                <div key={cat.key}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {cat.label}
                  </p>
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

        {/* ── Footer ── */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap sm:flex-nowrap gap-2">
          <button
            onClick={() => setDraft(config)}
            className="flex-1 min-w-[70px] border border-gray-200 bg-white text-gray-600 text-[13px] font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleClose}
            className="flex-1 min-w-[70px] border border-gray-200 bg-white text-gray-600 text-[13px] font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
          >
            Save layout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function Section({ title, badge, open, onToggle, children }) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-gray-800">{title}</span>
          {badge && (
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function CountRow({ label, value, onDecrement, onIncrement }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrement}
          className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-[14px] font-bold text-gray-900 tabular-nums">
          {value}
        </span>
        <button
          onClick={onIncrement}
          className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, enabled, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-3 py-1.5 cursor-pointer group"
    >
      {/* Toggle switch */}
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${enabled ? "bg-blue-600" : "bg-gray-200"
          }`}
      >
        <span
          className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-[18px]" : "translate-x-[3px]"
            }`}
        />
      </div>
      <span
        className={`text-[13px] transition-colors ${enabled
          ? "text-gray-800 group-hover:text-gray-900"
          : "text-gray-400 line-through"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

function TileToggle({ label, enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-2.5 px-3 rounded-xl border-2 text-[12.5px] font-semibold transition-all ${enabled
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-gray-200 bg-white text-gray-400"
        }`}
    >
      {label}
    </button>
  );
}