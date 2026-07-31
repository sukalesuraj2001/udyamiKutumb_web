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
    key: "ub-finance-it",
    label: "UB Finance & IT",
    color: "#D97706",
    products: [
      { key: "firstchoice", name: "First Choice", sub: "First Choice", enabled: true },
      { key: "finserve", name: "UB Finserve", sub: "Udyami Bharat Finserve", enabled: true },
      { key: "yuvaudyami", name: "UB Yuva Udyami", sub: "YUVA UDYAMI", enabled: true },
      { key: "aiml", name: "UB AI/ML", sub: "UB AI / ML ROBOTIC", enabled: true },
      { key: "rownify", name: "UB R Ownify", sub: "OWNIFY", enabled: true },
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

export default function ProductsPage({ code, wardName, region, categories = SAMPLE_PRODUCT_CATEGORIES, assignments = {}, onAssignClick, isSuperAdmin = false }) {
  return (
    <div className="bg-white overflow-hidden min-h-full pb-[28px]">
      <ChartHeaderBanner code={code} wardName={wardName} region={region} />

      <div className="space-y-0">
        {categories.map((cat) => (
          <div key={cat.key} className="flex" style={{ backgroundColor: `${cat.color}18` }}>
            <div className="w-[28px] shrink-0 flex items-center justify-center" style={{ backgroundColor: cat.color }}>
              <span
                className="text-white text-[8px] font-bold tracking-widest whitespace-nowrap uppercase"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {cat.label}
              </span>
            </div>

            <div
              className="flex-1 grid gap-[8px] p-[10px]"
              style={{
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gridTemplateRows: cat.key === "ub-queens" ? "repeat(4, minmax(0, 1fr))" : undefined,
              }}
            >
              {cat.products.map((p) => {
                const slotId = `product-${cat.key}-${p.key}`;
                const assigned = assignments[slotId];

                if (p.isPlaceholder) {
                  const placeholderIndex = cat.products.indexOf(p);
                  const slotId = `product-${cat.key}-slot-${placeholderIndex + 1}`; // ← meaningful slotId

                  return (
                    <div key={p.key}>
                      <p className="text-[8px] font-bold mb-[3px] truncate leading-tight"
                        style={{ color: cat.color }}>
                        {p.name}  
                      </p>
                      <button
                        onClick={() => onAssignClick?.(slotId, p.name)}
                        className="group relative w-full aspect-square bg-white/40 border-[3px] border-dashed rounded-xl flex items-center justify-center overflow-hidden"
                        style={{ borderColor: cat.color }}
                      >
                        {assigned?.photoUrl ? (
                          <img
                            src={assigned.photoUrl}
                            alt={assigned.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-[9px]"
                          />
                        ) : (
                          !isSuperAdmin && (
                            <Plus size={14} className="opacity-30 group-hover:opacity-100 transition-opacity"
                              style={{ color: cat.color }} />
                          )
                        )}
                      </button>
                      {assigned?.name && (
                        <p className="text-[7px] font-medium text-ink mt-[2px] truncate text-center">
                          {assigned.name}
                        </p>
                      )}
                    </div>
                  );
                }

                // ── Normal product slot ── (existing code same)
                return (
                  <div key={p.key}>
                    <p className="text-[8px] font-bold mb-[3px] truncate leading-tight" style={{ color: cat.color }}>
                      {p.name}
                    </p>
                    <button
                      onClick={() => onAssignClick?.(slotId, p.name)}
                      className="group relative w-full aspect-square bg-white border-[3px] rounded-xl flex flex-col items-center justify-center gap-0.5 px-1 overflow-hidden"
                      style={{ borderColor: cat.color }}
                    >
                      {/* ── Assigned image ── */}
                      {assigned?.photoUrl ? (
                        <img
                          src={assigned.photoUrl}
                          alt={assigned.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-[9px]"
                        />
                      ) : (
                        <span className="text-[7px] font-bold uppercase text-muted text-center leading-tight px-0.5 max-w-full truncate block">
                          {p.sub}
                        </span>
                      )}

                      {/* ── Hover overlay — assigned ── */}
                      {!isSuperAdmin && (
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors rounded-[9px]">
                          <Plus size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      )}
                    </button>

                    {/* ── Name below card ── */}
                    {assigned?.name && (
                      <p className="text-[7px] font-medium text-ink mt-[2px] truncate text-center">
                        {assigned.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
