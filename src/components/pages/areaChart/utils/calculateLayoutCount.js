/**
 * Dynamic A4 Card Calculation Utility
 * Calculates the total number of available cards/slots across the entire Ward Chart PDF.
 * Dynamic recalculation occurs whenever slot counts, enabled items, or custom fields change.
 */

const CATEGORY_COUNT_MAP = {
  "ub-queens": "udyamiQueens",
  "ub-realty": "ubRealtyConstruction",
  "yuva-udyami": "yuvaUdyami",
  "ec": "ec",
  "ub-finance-it": "ubFinanceIT",
  "ub-social": "ubSocialBrand",
};

/**
 * Calculates the total number of available cards/slots across the entire Ward Chart PDF.
 * 
 * @param {Object} config - Ward chart layout configuration
 * @returns {number} Total count of available cards
 */
export function calculateTotalLayoutCards(config, wardLength = 9) {
  if (!config) return 95;

  const slotCounts = config.slotCounts || {};

  const mlaCount = 1;
  const patronsCount = Number(slotCounts.patrons ?? 10);
  const officialsCount = Number(slotCounts.officials ?? 4);
  const chairmanCount = 1;
  const totalChairmenCount = Number(wardLength || 9);
  const advisoriesCount = Number(slotCounts.advisories ?? 3);
  const mentorsCount = Number(slotCounts.mentors ?? 2);
  const coreRolesCount = 4; // President, Vice-President, General Secretary, Treasurer

  // Count all enabled sectors (including newly added custom sectors)
  const sectorsCount = (config.sectors || []).filter((s) => s.enabled !== false).length;

  // Count all enabled UMS roles (including newly added custom UMS roles)
  const umsCount = (config.umsRoles || []).filter((u) => u.enabled !== false).length;

  // Count all enabled product tiles per brand category
  let totalBrandProductCards = 0;
  if (Array.isArray(config.brandTiles) && config.brandTiles.length > 0) {
    config.brandTiles.forEach((cat) => {
      const countKey = CATEGORY_COUNT_MAP[cat.key] || cat.countKey || `count_${cat.key}`;
      const slotCount = countKey ? Number(slotCounts[countKey] ?? 0) : 0;
      const enabledProducts = (cat.products || []).filter((p) => p.enabled !== false).length;
      totalBrandProductCards += Math.max(slotCount, enabledProducts);
    });
  } else {
    totalBrandProductCards += Number(slotCounts.udyamiQueens ?? 20);
    totalBrandProductCards += Number(slotCounts.ubRealtyConstruction ?? 5);
    totalBrandProductCards += Number(slotCounts.yuvaUdyami ?? 5);
    totalBrandProductCards += Number(slotCounts.ec ?? 5);
    totalBrandProductCards += Number(slotCounts.ubFinanceIT ?? 5);
    totalBrandProductCards += Number(slotCounts.ubSocialBrand ?? 5);
  }

  return (
    mlaCount +
    patronsCount +
    officialsCount +
    chairmanCount +
    totalChairmenCount +
    advisoriesCount +
    mentorsCount +
    coreRolesCount +
    sectorsCount +
    umsCount +
    totalBrandProductCards
  );
}

/**
 * Returns the total layout card count as a string format for API payload.
 * 
 * @param {Object} config 
 * @param {number} wardLength
 * @returns {string} E.g. "95"
 */
export function getLayoutCountString(config, wardLength = 9) {
  return String(calculateTotalLayoutCards(config, wardLength));
}
