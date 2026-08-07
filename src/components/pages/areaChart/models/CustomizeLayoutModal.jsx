import React, { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { calculateTotalLayoutCards } from "../utils/calculateLayoutCount.js";

const UDYAMI_TITLES = [
  { key: "king", label: "Udyami King" },
  { key: "queens", label: "Udyami Queens" },
  { key: "prices", label: "Udyami Prices" },
  { key: "princess", label: "Udyami Princess" },
];

// ── Unique key generator (no duplicate keys in batch) ──────────
let _uid = 0;
const uid = () => `${Date.now()}-${++_uid}`;

export default function CustomizeLayoutModal({
  wardName,
  config,
  onClose,
  onSave,
  isWardChairman = false,
}) {
  const [draft, setDraft] = useState(() => ({
    ...config,
    udyamiTitles:
      config.udyamiTitles ||
      UDYAMI_TITLES.map((t) => ({ ...t, enabled: true })),
  }));

  const totalAvailableCards = calculateTotalLayoutCards(draft);

  const [animate, setAnimate] = useState(false);

  // ── Custom sector batch inputs (multiples of 3) ───────────────
  const [customSectors, setCustomSectors] = useState(["", "", ""]);
  const [sectorError, setSectorError] = useState("");

  // ── Custom UMS batch inputs (multiples of 2) ──────────────────
  const [customUms, setCustomUms] = useState(["", ""]);
  const [umsError, setUmsError] = useState("");

  // ── Custom brand product per category ─────────────────────────
  const [customBrand, setCustomBrand] = useState({});

  // ── Derive staged counts from draft vs original enabled config ──
  const originalEnabledSectorsCount = useRef(
    config.sectors?.filter((s) => s.enabled).length ?? 6
  );
  const originalEnabledUmsCount = useRef(
    config.umsRoles?.filter((s) => s.enabled).length ?? 10
  );

  const stagedSectors = draft.sectors.filter((s) => s.enabled).length - originalEnabledSectorsCount.current;
  const stagedUms = draft.umsRoles.filter((s) => s.enabled).length - originalEnabledUmsCount.current;

  useEffect(() => {
    const timer = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 300);
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
    sectors: true,
    ums: false,
    brandTiles: false,
  });

  const toggle = (section) =>
    setOpenSection((o) => ({ ...o, [section]: !o[section] }));

  // ── Brand category expanded input list state ───────────────────
  const [openCategoryInputs, setOpenCategoryInputs] = useState({
    "ub-queens": false,
    "ub-realty": false,
    "yuva-udyami": false,
    "ec": false,
    "ub-finance-it": false,
    "ub-social": false,
  });

  const toggleCategoryInputs = (catKey) => {
    setOpenCategoryInputs((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const ensureCategoryProductsCount = (catKey, catLabel, targetCount) => {
    setDraft((d) => {
      const brandTiles = [...(d.brandTiles || [])];
      const catIdx = brandTiles.findIndex((c) => c.key === catKey);
      if (catIdx === -1) return d;

      const cat = brandTiles[catIdx];
      const products = [...(cat.products || [])];

      while (products.length < targetCount) {
        const idx = products.length;
        products.push({
          key: `${catKey}-item-${uid()}`,
          name: `${catLabel} ${idx + 1}`,
          sub: catLabel,
          enabled: true,
        });
      }

      brandTiles[catIdx] = { ...cat, products };
      return { ...d, brandTiles };
    });
  };

  const updateBrandTileProductName = (catKey, productIdx, newName, catLabel) => {
    setDraft((d) => {
      const brandTiles = [...(d.brandTiles || [])];
      const catIdx = brandTiles.findIndex((c) => c.key === catKey);
      if (catIdx === -1) return d;

      const cat = brandTiles[catIdx];
      const products = [...(cat.products || [])];

      while (products.length <= productIdx) {
        const idx = products.length;
        products.push({
          key: `${catKey}-item-${uid()}`,
          name: `${catLabel} ${idx + 1}`,
          sub: catLabel,
          enabled: true,
        });
      }

      products[productIdx] = {
        ...products[productIdx],
        name: newName,
      };

      brandTiles[catIdx] = { ...cat, products };
      return { ...d, brandTiles };
    });
  };

  // ── Dropdown count update ──────────────────────────────────────
  const updateCountDirect = (key, value) =>
    setDraft((d) => ({
      ...d,
      slotCounts: { ...d.slotCounts, [key]: Number(value) },
    }));

  // ── Sector toggle ──────────────────────────────────────────────
  const toggleSector = (key) =>
    setDraft((d) => ({
      ...d,
      sectors: d.sectors.map((s) =>
        s.key === key ? { ...s, enabled: !s.enabled } : s
      ),
    }));

  // ── UMS toggle ────────────────────────────────────────────────
  const toggleUms = (key) =>
    setDraft((d) => ({
      ...d,
      umsRoles: d.umsRoles.map((s) =>
        s.key === key ? { ...s, enabled: !s.enabled } : s
      ),
    }));

  // ── Remove newly added sector (trash icon) ────────────────────
  const removeSector = (key) => {
    setDraft((d) => ({
      ...d,
      sectors: d.sectors.filter((s) => s.key !== key),
    }));
  };

  // ── Remove newly added UMS role (trash icon) ──────────────────
  const removeUms = (key) => {
    setDraft((d) => ({
      ...d,
      umsRoles: d.umsRoles.filter((s) => s.key !== key),
    }));
  };

  // ── Brand tile toggles ────────────────────────────────────────
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

  // ── Add custom sectors (any count) ────────────────────────────
  const addCustomSectors = () => {
    const filled = customSectors.map((s) => s.trim()).filter(Boolean);
    if (filled.length === 0) {
      setSectorError("Please enter at least one sector name.");
      return;
    }
    setSectorError("");
    setDraft((d) => ({
      ...d,
      sectors: [
        ...d.sectors,
        ...filled.map((name) => ({
          key: `sector-custom-${uid()}`,
          label: name,
          enabled: true,
        })),
      ],
    }));
    setCustomSectors(["", "", ""]);
  };

  const updateCustomSector = (idx, val) => {
    setSectorError("");
    setCustomSectors((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  const addSectorField = () =>
    setCustomSectors((prev) => [...prev, "", "", ""]);

  // ── Add custom UMS roles (any count) ──────────────────────────
  const addCustomUms = () => {
    const filled = customUms.map((s) => s.trim()).filter(Boolean);
    if (filled.length === 0) {
      setUmsError("Please enter at least one UMS role name.");
      return;
    }
    setUmsError("");
    setDraft((d) => ({
      ...d,
      umsRoles: [
        ...d.umsRoles,
        ...filled.map((name) => ({
          key: `ums-custom-${uid()}`,
          label: name,
          enabled: true,
        })),
      ],
    }));
    setCustomUms(["", ""]);
  };

  const updateCustomUms = (idx, val) => {
    setUmsError("");
    setCustomUms((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  const addUmsField = () => setCustomUms((prev) => [...prev, "", ""]);

  // ── Add custom brand product ───────────────────────────────────
  const addCustomBrandProduct = (categoryKey) => {
    const name = (customBrand[categoryKey] || "").trim();
    if (!name) return;
    setDraft((d) => ({
      ...d,
      brandTiles: d.brandTiles.map((cat) =>
        cat.key === categoryKey
          ? {
              ...cat,
              products: [
                ...cat.products,
                {
                  key: `brand-custom-${uid()}`,
                  name,
                  enabled: true,
                },
              ],
            }
          : cat
      ),
    }));
    setCustomBrand((p) => ({ ...p, [categoryKey]: "" }));
  };

  // ── Sector & UMS 3:2 Ratio Validation ─────────────────────────────
  const baseSectorsCount = originalEnabledSectorsCount.current; // default 6
  const baseUmsCount = originalEnabledUmsCount.current;       // default 10

  const activeSectorsCount = draft.sectors.filter((s) => s.enabled).length;
  const activeUmsCount = draft.umsRoles.filter((s) => s.enabled).length;

  const extraSectors = Math.max(0, activeSectorsCount - baseSectorsCount);
  const extraUms = Math.max(0, activeUmsCount - baseUmsCount);

  // Mandatory ratio: Every 3 extra sectors require 2 extra UMS roles
  const requiredExtraUms = Math.ceil(extraSectors / 3) * 2;
  const missingUms = requiredExtraUms - extraUms;

  const isRatioDeficit = extraSectors > 0 && missingUms > 0;
  const ratioValid = !isRatioDeficit;

  const ratioMessage = isRatioDeficit
    ? `Please add ${missingUms} UMS role(s) to match the selected ${extraSectors} extra sector(s).`
    : null;

  // ── Advisory & Mentor Validation (Coupled 3:2 and 6:4 rule) ───────
  const advisoriesCount = Number(draft.slotCounts?.advisories ?? 3);
  const mentorsCount = Number(draft.slotCounts?.mentors ?? 2);

  const advisoryMentorValid =
    (advisoriesCount === 3 && mentorsCount === 2) ||
    (advisoriesCount === 6 && mentorsCount === 4);

  const isSaveAllowed = ratioValid && advisoryMentorValid;

  const advisoryMentorMessage = !advisoryMentorValid
    ? advisoriesCount === 6 && mentorsCount !== 4
      ? "When Advisory is changed to 6, Mentor must also be changed to 4."
      : advisoriesCount === 3 && mentorsCount !== 2
      ? "When Advisory is set to 3, Mentor must also be set to 2."
      : "Advisory 3 requires Mentor 2, and Advisory 6 requires Mentor 4."
    : null;

  // ── Original sector keys (to show remove only on new items) ───
  const originalSectorKeys = useRef(
    new Set(config.sectors?.map((s) => s.key) ?? [])
  );
  const originalUmsKeys = useRef(
    new Set(config.umsRoles?.map((s) => s.key) ?? [])
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col transform transition-all duration-300 ${
          animate
            ? "translate-x-0 opacity-100 ease-out"
            : "translate-x-full opacity-0 ease-in"
        }`}
      >
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

          {/* ── Slot Counts ── */}
          <Section
            title="Slot Counts"
            badge={null}
            open={openSection.slots}
            onToggle={() => toggle("slots")}
          >
            {!isWardChairman && (
              <>
                <DropdownRow
                  label="Patrons"
                  value={draft.slotCounts.patrons ?? 10}
                  options={[5, 10, 15]}
                  onChange={(v) => updateCountDirect("patrons", v)}
                />
                <DropdownRow
                  label="Advisories"
                  value={draft.slotCounts.advisories ?? 3}
                  options={[3, 6]}
                  onChange={(v) => updateCountDirect("advisories", v)}
                />
                <DropdownRow
                  label="Mentors"
                  value={draft.slotCounts.mentors ?? 2}
                  options={[2, 4]}
                  onChange={(v) => updateCountDirect("mentors", v)}
                />
                <div className="my-2 border-t border-gray-100" />
              </>
            )}
            {[
              { catKey: "ub-queens", countKey: "udyamiQueens", label: "UB Queen's" },
              { catKey: "ub-realty", countKey: "ubRealtyConstruction", label: "UB Realty Construction" },
              { catKey: "yuva-udyami", countKey: "yuvaUdyami", label: "Yuva Udyami" },
              { catKey: "ec", countKey: "ec", label: "E3" },
              { catKey: "ub-finance-it", countKey: "ubFinanceIT", label: "UB Finance & IT" },
              { catKey: "ub-social", countKey: "ubSocialBrand", label: "UB Social & Brand" },
            ].map(({ catKey, countKey, label }) => {
              const currentCount = draft.slotCounts?.[countKey] ?? 5;
              const categoryData = (draft.brandTiles || []).find((c) => c.key === catKey);
              const products = categoryData?.products || [];
              const isExpanded = openCategoryInputs[catKey];

              return (
                <div key={catKey} className="border-b border-gray-100/80 last:border-b-0 py-1.5">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-700 font-medium">{label}</span>
                      <button
                        type="button"
                        onClick={() => toggleCategoryInputs(catKey)}
                        className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 bg-blue-50 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {isExpanded ? "Hide names ▲" : `Edit ${currentCount} names ▼`}
                      </button>
                    </div>
                    <select
                      value={currentCount}
                      onChange={(e) => {
                        const newCount = Number(e.target.value);
                        updateCountDirect(countKey, newCount);
                        ensureCategoryProductsCount(catKey, label, newCount);
                        setOpenCategoryInputs((prev) => ({ ...prev, [catKey]: true }));
                      }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer"
                    >
                      {[5, 10, 15, 20, 25].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expanded input fields for slot names */}
                  {isExpanded && (
                    <div className="mt-1.5 mb-2.5 pl-2.5 pr-1.5 py-2 bg-gray-50/90 rounded-xl border border-gray-200/60 space-y-2">
                      <div className="flex items-center justify-between px-0.5">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Slot Names ({currentCount} slots):
                        </p>
                        <span className="text-[10px] text-gray-400">Type custom name for each box</span>
                      </div>
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {Array.from({ length: currentCount }).map((_, idx) => {
                          const prod = products[idx];
                          const val = prod?.name !== undefined ? prod.name : `${label} ${idx + 1}`;
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400 w-5 text-right font-medium shrink-0">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) =>
                                  updateBrandTileProductName(catKey, idx, e.target.value, label)
                                }
                                placeholder={`${label} ${idx + 1}`}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Section>

          {/* ── Sectors ── */}
          <Section
            title="Sectors"
            badge={`${draft.sectors.filter((s) => s.enabled).length} active`}
            open={openSection.sectors}
            onToggle={() => toggle("sectors")}
          >
            {/* Ratio live status */}
            {stagedSectors > 0 && (
              <div className="mb-3 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                <span className="text-[11px] text-blue-600 font-semibold">
                  +{stagedSectors} new sectors staged
                </span>
                <span className="text-[10px] text-blue-400">
                  → {(stagedSectors / 3) * 2} UMS roles needed
                </span>
              </div>
            )}

            <div className="space-y-1">
              {draft.sectors.map((s) => (
                <ToggleRow
                  key={s.key}
                  label={s.label}
                  enabled={s.enabled}
                  onToggle={() => toggleSector(s.key)}
                  // Show remove (×) only for newly added items
                  isNew={!originalSectorKeys.current.has(s.key)}
                  onRemove={() => removeSector(s.key)}
                />
              ))}
            </div>

            {/* Batch add — multiples of 3 */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Custom Sectors (multiples of 3)
                </p>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                  {customSectors.length} fields
                </span>
              </div>

              {Array.from(
                { length: Math.ceil(customSectors.length / 3) },
                (_, groupIdx) => (
                  <div
                    key={groupIdx}
                    className="border border-dashed border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/60"
                  >
                    <p className="text-[10px] text-gray-400 font-medium">
                      Batch {groupIdx + 1}
                    </p>
                    {customSectors
                      .slice(groupIdx * 3, groupIdx * 3 + 3)
                      .map((val, relIdx) => {
                        const absIdx = groupIdx * 3 + relIdx;
                        return (
                          <div key={absIdx} className="flex gap-2 items-center">
                            <span className="text-[11px] text-gray-400 w-4 text-right shrink-0">
                              {absIdx + 1}.
                            </span>
                            <input
                              value={val}
                              onChange={(e) =>
                                updateCustomSector(absIdx, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addCustomSectors();
                              }}
                              placeholder={`Sector ${absIdx + 1} name…`}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                            />
                          </div>
                        );
                      })}
                  </div>
                )
              )}

              {sectorError && (
                <p className="text-[11px] text-red-500 font-medium">
                  ⚠ {sectorError}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addSectorField}
                  className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  <Plus size={12} /> +3 fields
                </button>
                <div className="flex-1" />
                <button
                  onClick={addCustomSectors}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Add Sectors
                </button>
              </div>
            </div>
          </Section>

          {/* ── UMS Roles ── */}
          <Section
            title="UMS Roles"
            badge={`${draft.umsRoles.filter((s) => s.enabled).length} active`}
            open={openSection.ums}
            onToggle={() => toggle("ums")}
          >
            {/* Ratio live status */}
            {stagedUms > 0 && (
              <div className="mb-3 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                <span className="text-[11px] text-blue-600 font-semibold">
                  +{stagedUms} new UMS staged
                </span>
                <span className="text-[10px] text-blue-400">
                  → {(stagedUms / 2) * 3} sectors needed
                </span>
              </div>
            )}

            <div className="space-y-1">
              {draft.umsRoles.map((s) => (
                <ToggleRow
                  key={s.key}
                  label={s.label}
                  enabled={s.enabled}
                  onToggle={() => toggleUms(s.key)}
                  isNew={!originalUmsKeys.current.has(s.key)}
                  onRemove={() => removeUms(s.key)}
                />
              ))}
            </div>

            {/* Batch add — multiples of 2 */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Add UMS Roles (multiples of 2)
                </p>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                  {customUms.length} fields
                </span>
              </div>

              {Array.from(
                { length: Math.ceil(customUms.length / 2) },
                (_, groupIdx) => (
                  <div
                    key={groupIdx}
                    className="border border-dashed border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/60"
                  >
                    <p className="text-[10px] text-gray-400 font-medium">
                      Pair {groupIdx + 1}
                    </p>
                    {customUms
                      .slice(groupIdx * 2, groupIdx * 2 + 2)
                      .map((val, relIdx) => {
                        const absIdx = groupIdx * 2 + relIdx;
                        return (
                          <div key={absIdx} className="flex gap-2 items-center">
                            <span className="text-[11px] text-gray-400 w-4 text-right shrink-0">
                              {absIdx + 1}.
                            </span>
                            <input
                              value={val}
                              onChange={(e) =>
                                updateCustomUms(absIdx, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addCustomUms();
                              }}
                              placeholder={`UMS Role ${absIdx + 1} name…`}
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                            />
                          </div>
                        );
                      })}
                  </div>
                )
              )}

              {umsError && (
                <p className="text-[11px] text-red-500 font-medium">
                  ⚠ {umsError}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addUmsField}
                  className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  <Plus size={12} /> +2 fields
                </button>
                <div className="flex-1" />
                <button
                  onClick={addCustomUms}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Add UMS Roles
                </button>
              </div>
            </div>
          </Section>

          {/* ── Brand Tiles ── */}
          <Section
            title="Brand Tiles (Products page)"
            badge={null}
            open={openSection.brandTiles}
            onToggle={() => toggle("brandTiles")}
          >
            <div className="space-y-6">
              {draft.brandTiles.map((cat) => (
                <div key={cat.key}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    {cat.label}
                  </p>
                  <div className="space-y-1">
                    {cat.products.map((p) => (
                      <ToggleRow
                        key={p.key || p.name}
                        label={p.name}
                        enabled={p.enabled}
                        onToggle={() => toggleBrandTile(cat.key, p.name)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      value={customBrand[cat.key] || ""}
                      onChange={(e) =>
                        setCustomBrand((prev) => ({
                          ...prev,
                          [cat.key]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCustomBrandProduct(cat.key);
                      }}
                      placeholder="New product add pannanum…"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                    <button
                      onClick={() => addCustomBrandProduct(cat.key)}
                      className="w-9 h-9 shrink-0 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          {advisoryMentorMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-1">
              <span className="text-red-500 text-[14px] shrink-0 font-bold">⚠</span>
              <div className="text-[11.5px] text-red-600 font-medium leading-snug">
                <p className="font-bold text-red-700">{advisoryMentorMessage}</p>
                <p className="text-[10.5px] text-red-500 mt-0.5">
                  Rule: Advisory 3 pairs with Mentor 2, and Advisory 6 pairs with Mentor 4.
                </p>
              </div>
            </div>
          )}
          {ratioMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 mb-1">
              <span className="text-red-500 text-[14px] shrink-0 font-bold">⚠</span>
              <div className="text-[11.5px] text-red-600 font-medium leading-snug">
                <p className="font-bold text-red-700">{ratioMessage}</p>
                <p className="text-[10.5px] text-red-500 mt-0.5">
                  Rule: Every 3 extra sectors require 2 extra UMS roles (e.g. 3 sectors : 2 UMS, 6 sectors : 4 UMS).
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3 text-[12px]">
            <span className="text-gray-500 font-medium">Total Available Cards:</span>
            <span className="font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
              {totalAvailableCards} cards
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <button
              onClick={() => {
                setDraft(config);
                setCustomSectors(["", "", ""]);
                setCustomUms(["", ""]);
                setSectorError("");
                setUmsError("");
              }}
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
              onClick={() => {
                if (isSaveAllowed) onSave(draft);
              }}
              disabled={!isSaveAllowed}
              className={`flex-1 min-w-[100px] text-[13px] font-semibold py-2.5 rounded-xl transition-colors ${
                isSaveAllowed
                  ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
              }`}
            >
              Save layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function Section({ title, badge, open, onToggle, children }) {
  return (
    <div className="px-6 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-gray-800">
            {title}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function DropdownRow({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── ToggleRow — now supports isNew + onRemove ─────────────────────
function ToggleRow({ label, enabled, onToggle, isNew = false, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <div
        onClick={onToggle}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </div>
      <span
        onClick={onToggle}
        className={`flex-1 text-[13px] transition-colors cursor-pointer ${
          enabled
            ? "text-gray-800 group-hover:text-gray-900"
            : "text-gray-400 line-through"
        }`}
      >
        {label}
      </span>
      {/* Remove button — only for newly added items */}
      {isNew && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition-all text-[10px] font-bold shrink-0"
          title="Remove"
        >
          ×
        </button>
      )}
      {/* "New" badge */}
      {isNew && (
        <span className="text-[9px] font-bold bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">
          NEW
        </span>
      )}
    </div>
  );
}