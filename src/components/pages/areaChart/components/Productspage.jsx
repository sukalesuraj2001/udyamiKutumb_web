import React from "react";
import { Plus } from "lucide-react";
import ChartHeaderBanner from "./Chartheaderbanner.jsx";
import { PRODUCT_LOGOS } from "../chartAssets.js";

export const SAMPLE_PRODUCT_CATEGORIES = [
  {
    key: "ub-queens",
    label: "UB QUEEN'S",
    color: "#D6357F",
    products: [
      { key: "dark-store", name: "UB Q Dark Store", sub: "Udyami Queen's", enabled: true },
      { key: "wellness", name: "Wellness Supplements", sub: "MORINGA/ TURMERIC CAPSULES", enabled: true },
      { key: "jute", name: "Jute & Fabric Bags", sub: "TIFFIN/ SHOPPING BAGS", enabled: true },
      { key: "kitchen", name: "Kitchen Utility", sub: "WOODEN SPOONS/ CLAY POTS", enabled: true },
      { key: "candles", name: "Hand-Poured Soy Candles", sub: "FRAGRANCE/ WELLNESS", enabled: true },
      { key: "stationary", name: "UB Q Mart – Stationary", sub: "SEED PAPER/ RECYCLED PENS", enabled: true },
      { key: "batter", name: "Idli/Dosa Batter", sub: "STOCKED DAILY AT 6 AM", enabled: true },
      { key: "spices", name: "Hand-Pounded Spices", sub: "SMALL HIGH-VALUE PACKETS", enabled: true },
      { key: "oils", name: "Cold-Pressed Oils", sub: "HEAVY STOCKED IN 500ML/1L.", enabled: true },
      { key: "snacks", name: "Traditional Snacks", sub: "MURUKKU NIPPATTU KODUBALE", enabled: true },
      { key: "breakfast", name: "Millet-Based Breakfast", sub: "READY-TO COOK MIXES.", enabled: true },
      { key: "jaggery", name: "Artisanal Jaggery Sweets", sub: "GUILT-FREE TREATS/LADOOS", enabled: true },
      { key: "cleaners", name: "Eco-Friendly Cleaners", sub: "BIO-ENZYME FLOOR/ DISH WASH.", enabled: true },
      { key: "teas", name: "Herbal Teas & Coffee", sub: "STONE-GROUND/ SMALL BATCH.", enabled: true },
      { key: "babyfood", name: "Organic Baby Food", sub: "CHEMICAL FREE PORRIDGES", enabled: true },
      { key: "hygiene", name: "Menstrual Hygiene", sub: "CLOTH/ BAMBOO PADS", enabled: true },
      { key: "soaps", name: "Handmade Soaps", sub: "ESSENTIAL OIL-BASED", enabled: true },
      { key: "dryfruits", name: "Dry Fruits & Seeds", sub: "NUT MIXES/ SUPERFOODS", enabled: true },
      { key: "honey", name: "Forest Honey & Preserves", sub: "RAW, UNHEATED VARIETIES", enabled: true },
      { key: "pickles", name: "Ready-to-Eat Pickles", sub: "TRADITIONAL RECIPES", enabled: true },
    ],
  },
  {
    key: "ub-realty",
    label: "UB Realty Construction",
    color: "#3B5BA8",
    products: [
      { key: "cloudpatra", name: "UB Cloudpatra", sub: "Cloud Patra", enabled: true },
      { key: "bhoomivalut", name: "UB Bhoomivalut", sub: "Bhoomi Vault", enabled: true },
      { key: "landshomes", name: "Lands & Homes", sub: "L&H", enabled: true },
      { key: "buildhive", name: "UB Build Hive", sub: "Build Hive", enabled: true },
      { key: "buildaihome", name: "UB Build AI Home", sub: "Build AI Homes", enabled: true },
    ],
  },
  {
    key: "yuva-udyami",
    label: "Yuva Udyami",
    color: "#dbc118",
    products: [
      { key: "slot1", name: "Yuva Udyami 1", sub: "Yuva Udyami", enabled: true },
      { key: "slot2", name: "Yuva Udyami 2", sub: "Yuva Udyami", enabled: true },
      { key: "slot3", name: "Yuva Udyami 3", sub: "Yuva Udyami", enabled: true },
      { key: "slot4", name: "Yuva Udyami 4", sub: "Yuva Udyami", enabled: true },
      { key: "slot5", name: "Yuva Udyami 5", sub: "Yuva Udyami", enabled: true },
    ],
  },
  {
    key: "ec",
    label: "E3",
    color: "#b7492b",
    products: [
      { key: "slot1", name: "E3 1", sub: "E3", enabled: true },
      { key: "slot2", name: "E3 2", sub: "E3", enabled: true },
      { key: "slot3", name: "E3 3", sub: "E3", enabled: true },
      { key: "slot4", name: "E3 4", sub: "E3", enabled: true },
      { key: "slot5", name: "E3 5", sub: "E3", enabled: true },
    ],
  },
  {
    key: "ub-finance-it",
    label: "UB Finance & IT",
    color: "#D97706",
    products: [
      { key: "firstchoice", name: "First Choice", sub: "First Choice", enabled: true },
      { key: "finserve", name: "UB Finserve", sub: "Udyami Bharat Finserve", enabled: true },
      { key: "yuvaudyami", name: "UB Yuva Udyami", sub: "YUVA UDYAMI", enabled: true },
      { key: "aiml", name: "UB AI/ML", sub: "UB AI / ML ROBOTIC", enabled: true },
      { key: "rownify", name: "UB R Ownify", sub: "OWNIFY", enabled: true },
      // { key: "rownify", name: "UB R Ownify", sub: "OWNIFY", enabled: true },
      // { key: "rownify", name: "UB R Ownify", sub: "OWNIFY", enabled: true },
    ],
  },
  {
    key: "ub-social",
    label: "UB Social & Brand",
    color: "#2F6F4E",
    products: [
      { key: "pac", name: "UB PAC", sub: "JANATA CIRCLE", enabled: true },
      { key: "socials", name: "UB Socials", sub: "UB SOCIALS", enabled: true },
      { key: "firstgo", name: "UB First Go", sub: "FIRST GO", enabled: true },
      { key: "esalt", name: "UB E Salt", sub: "UB SALT", enabled: true },
      { key: "brandlook", name: "UB Brand Look", sub: "CORPORATE GIFTING", enabled: true },
    ],
  },
];

export default function ProductsPage({
  code,
  wardName,
  region,
  categories = SAMPLE_PRODUCT_CATEGORIES,
  assignments = {},
  onAssignClick,
  showPlus = true,
  isSuperAdmin = false
}) {
  const TOTAL_PAGE_ROWS = 7;
  const COLS = 5;

  let totalRowsUsed = 0;
  const processedCats = [];

  categories.forEach((cat) => {
    if (totalRowsUsed >= TOTAL_PAGE_ROWS) return;

    const availableRows = TOTAL_PAGE_ROWS - totalRowsUsed;
    const catProducts = cat.products || [];
    const neededRows = Math.max(1, Math.ceil(catProducts.length / COLS));
    const rowsToRender = Math.min(neededRows, availableRows);

    if (rowsToRender > 0) {
      const maxSlots = rowsToRender * COLS;
      const productsForCat = catProducts.slice(0, maxSlots);

      const paddedProducts = [...productsForCat];
      while (paddedProducts.length < maxSlots) {
        paddedProducts.push(null);
      }

      processedCats.push({
        ...cat,
        rows: rowsToRender,
        products: paddedProducts,
      });

      totalRowsUsed += rowsToRender;
    }
  });

  const emptyRowsNeeded = Math.max(0, TOTAL_PAGE_ROWS - totalRowsUsed);

  return (
    <div className="bg-white overflow-hidden flex flex-col min-h-[1123px] max-h-[1123px] w-[794px] mx-auto">
      <ChartHeaderBanner code={code} wardName={wardName} region={region} />

      <div className="flex-1 p-[8px] flex flex-col justify-start gap-[6px]">
        {processedCats.map((cat, catIdx) => {
          const isSectorsUms = cat.key === "extra-sectors-ums";

          return (
            <div
              key={cat.key || `cat-${catIdx}`}
              className="flex items-stretch rounded-sm overflow-hidden shrink-0"
              style={{ backgroundColor: isSectorsUms ? "#c8102e" : `${cat.color}15` }}
            >
              {/* ── Left Category Strip ── */}
              <div
                className="w-[32px] shrink-0 flex items-center justify-center"
                style={{ backgroundColor: isSectorsUms ? "#1a2e5e" : cat.color }}
              >
                <span
                  className="text-white text-[9px] font-bold tracking-widest whitespace-nowrap uppercase"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  {cat.label}
                </span>
              </div>

              {/* ── Fixed 5-Column Grid ── */}
              <div
                className="flex-1 grid gap-x-[8px] gap-y-[6px] p-[6px]"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, 138px)`,
                  gridTemplateRows: `repeat(${cat.rows}, 134px)`,
                }}
              >
                {cat.products.map((p, pIdx) => {
                  if (!p) {
                    return (
                      <div key={`empty-slot-${pIdx}`} className="w-[138px] h-[134px] flex flex-col items-center justify-between p-1">
                        <div className="h-[14px] w-full" />
                        <div className={`w-[104px] h-[104px] rounded-xl border-[2px] border-dashed ${isSectorsUms ? "border-white/30 bg-white/10" : "border-gray-200/60 bg-white/20"}`} />
                        <div className="h-[12px] w-full" />
                      </div>
                    );
                  }

                  const slotId = p.isPlaceholder
                    ? `product-${cat.key}-slot-${pIdx + 1}`
                    : (p.key && (p.key.startsWith("sector-") || p.key.startsWith("ums-")))
                      ? p.key
                      : `product-${cat.key}-${p.key}`;
                  const assigned = assignments[slotId];

                  // Sector / UMS styling override inside extra-sectors-ums category
                  if (isSectorsUms) {
                    const isUmsType = p.itemType === "ums" || p.key?.startsWith("ums-");

                    if (isUmsType) {
                      return (
                        <div key={p.key || `p-${pIdx}`} className="w-[138px] h-[134px] flex flex-col items-center justify-between p-1">

                          {/* ✅ Outer white bg wrapper */}
                          <div className="bg-white rounded-xl p-[4px] flex flex-col items-center w-[114px]">

                            {/* Title */}
                            <p className="text-[6.5px] font-bold text-[#b5121b] text-center truncate leading-tight w-full mb-1 uppercase">
                              {p.name}
                            </p>

                            {/* Card button */}
                            <button
                              onClick={() => onAssignClick?.(slotId, p.name)}
                              className="group relative w-[104px] h-[104px] bg-white border-[3px] border-[#1a2e5e] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden cursor-pointer shrink-0"
                            >
                              {assigned?.photoUrl ? (
                                <img
                                  src={assigned.photoUrl}
                                  alt={assigned.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[6.5px] font-bold uppercase text-[#b5121b] text-center px-1 leading-tight">
                                  {p.sub || p.name}
                                </span>
                              )}

                              {showPlus && (
                                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                  <Plus
                                    size={14}
                                    className={
                                      assigned?.photoUrl
                                        ? "text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        : "text-[#b5121b] opacity-50 group-hover:opacity-100 transition-opacity"
                                    }
                                  />
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Assigned name */}
                          <p
                            className="text-[7.5px] font-bold text-white h-[12px] w-full truncate text-center cursor-pointer mt-0.5"
                            onClick={() => onAssignClick?.(slotId, p.name)}
                          >
                            {assigned?.name || ""}
                          </p>
                        </div>
                      );
                    }

                    // Sector Card matching Page 4 Sector Card exactly
                    return (
                      <div key={p.key || `p-${pIdx}`} className="w-[138px] h-[134px] flex flex-col items-center justify-between p-1">
                        {/* Outer card frame with dark header strip */}
                        <div className="w-[104px] rounded-sm overflow-hidden border border-white/10 shrink-0 flex flex-col">
                          {/* Dark Header Strip */}
                          <div className=" text-white text-[6.5px] font-bold uppercase tracking-wide text-center py-[2.5px] px-1 leading-tight truncate shrink-0">
                            {p.name}
                          </div>

                          {/* Card Button / Image Area */}
                          <button
                            onClick={() => onAssignClick?.(slotId, p.name)}
                            className="group relative w-[104px] h-[104px] bg-white border-[3px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden cursor-pointer shrink-0"
                          >
                            {assigned?.photoUrl ? (
                              <img
                                src={assigned.photoUrl}
                                alt={assigned.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[6px] font-semibold uppercase text-slate-400 text-center px-1 leading-tight">
                                {p.sub || p.name}
                              </span>
                            )}

                            {showPlus && (
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                                <Plus
                                  size={14}
                                  className={
                                    assigned?.photoUrl
                                      ? "text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                      : "text-[#1a2e5e] opacity-40 group-hover:opacity-100 transition-opacity"
                                  }
                                />
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Assigned name */}
                        <p
                          className="text-[7.5px] font-bold text-white h-[12px] w-full truncate text-center cursor-pointer mt-0.5"
                          onClick={() => onAssignClick?.(slotId, p.name)}
                        >
                          {assigned?.name || ""}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={p.key || `p-${pIdx}`} className="w-[138px] h-[134px] flex flex-col items-center justify-between p-1">
                      <p
                        className="text-[9px] font-bold h-[14px] w-full truncate leading-tight text-center"
                        style={{ color: cat.color }}
                      >
                        {p.name}
                      </p>

                      <button
                        onClick={() => onAssignClick?.(slotId, p.name)}
                        className="group relative w-[104px] h-[104px] bg-white border-[3px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden cursor-pointer shrink-0"
                        style={{
                          borderColor: cat.color,
                          borderStyle: p.isPlaceholder ? "dashed" : "solid",
                        }}
                      >
                        {assigned?.photoUrl ? (
                          <img
                            src={assigned.photoUrl}
                            alt={assigned.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-[9px]"
                          />
                        ) : (
                          !p.isPlaceholder && (
                            <span className="text-[8px] font-bold uppercase text-muted text-center leading-tight px-0.5 max-w-full truncate block">
                              {p.sub}
                            </span>
                          )
                        )}

                        {showPlus && (
                          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors rounded-[9px]">
                            <Plus
                              size={16}
                              className={
                                assigned?.photoUrl
                                  ? "text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  : "opacity-40 group-hover:opacity-100 transition-opacity"
                              }
                              style={!assigned?.photoUrl ? { color: cat.color } : {}}
                            />
                          </span>
                        )}
                      </button>

                      <p
                        className="text-[8px] font-medium text-ink h-[12px] w-full truncate text-center cursor-pointer"
                        onClick={() => onAssignClick?.(slotId, p.name)}
                      >
                        {assigned?.name || ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Empty Rows to complete 7 Rows on Page ── */}
        {emptyRowsNeeded > 0 && (
          <div className="flex items-stretch rounded-sm overflow-hidden bg-slate-50/50 border border-dashed border-gray-200 shrink-0">
            <div className="w-[32px] shrink-0 bg-slate-200/50 flex items-center justify-center" />
            <div
              className="flex-1 grid gap-x-[8px] gap-y-[6px] p-[6px]"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 138px)`,
                gridTemplateRows: `repeat(${emptyRowsNeeded}, 134px)`,
              }}
            >
              {Array.from({ length: emptyRowsNeeded * COLS }).map((_, idx) => (
                <div key={`empty-page-cell-${idx}`} className="w-[138px] h-[134px] flex flex-col items-center justify-between p-1">
                  <div className="h-[14px] w-full" />
                  <div className="w-[104px] h-[104px] rounded-xl border-[2px] border-dashed border-gray-200/40 bg-white/20" />
                  <div className="h-[12px] w-full" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}