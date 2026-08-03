/**
 * Dynamic A4 Pagination Engine for Ward Chart Product Pages
 * Calculates page distribution based on usable content height and category heights.
 * Never splits a category across page boundaries.
 */

/**
 * Calculates deterministic height of a category block rendered in a 5-column grid layout.
 * 
 * @param {number} productCount - Number of products in category
 * @param {number} pageWidth - Logical A4 page width in px (855 for preview, 794 for PDF)
 * @returns {number} Height in pixels
 */
export function calculateCategoryHeight(productCount = 0, pageWidth = 855) {
  if (productCount <= 0) return 0;
  const cols = 5;
  const rows = Math.ceil(productCount / cols);

  // Available width for 5 columns: pageWidth - sidebar(32px) - padding(16px) - grid gaps(32px)
  const availW = Math.max(100, pageWidth - 32 - 16 - 32);
  const tileW = availW / cols;
  const titleH = 11; // text 8.5px + mb 2.5px
  const nameH = 9;   // text 8px + mt 1px
  const rowH = tileW + titleH + nameH;

  // Total height = rows * rowH + (rows - 1) * 8px gap + 16px vertical padding
  return Math.ceil(rows * rowH + (rows - 1) * 8 + 16);
}

/**
 * Paginates an array of brand categories into separate pages.
 * 
 * @param {Array} categories - Array of category objects (each with a unique `key`)
 * @param {Object} measuredHeights - Map of `category.key` -> measured DOM height in pixels
 * @param {number} usableContentHeight - Total available content height for categories per A4 page
 * @param {number} categoryGap - Vertical gap between categories (default: 0)
 * @param {number} pageWidth - Logical A4 page width in px (default: 855)
 * @returns {Array<Array>} Array of pages, where each page is an array of category objects
 */
export function paginateBrandCategories(
  categories = [],
  measuredHeights = {},
  usableContentHeight = 1000,
  categoryGap = 0,
  pageWidth = 855
) {
  if (!categories || categories.length === 0) return [];
  if (!usableContentHeight || usableContentHeight <= 0) return [categories];

  const pages = [];
  let currentPage = [];
  let currentHeight = 0;

  for (const cat of categories) {
    const fallbackH = calculateCategoryHeight(cat.products?.length || 0, pageWidth);
    const measuredH = Math.ceil(measuredHeights[cat.key] || 0);
    
    // Use measured DOM height if valid (> 50px) and within expected threshold, otherwise precise formula
    const catHeight = (measuredH > 50 && Math.abs(measuredH - fallbackH) < 60) ? measuredH : fallbackH;

    if (currentPage.length === 0) {
      currentPage.push(cat);
      currentHeight = catHeight;
    } else {
      const heightWithNext = currentHeight + categoryGap + catHeight;
      if (heightWithNext <= usableContentHeight) {
        currentPage.push(cat);
        currentHeight = heightWithNext;
      } else {
        pages.push(currentPage);
        currentPage = [cat];
        currentHeight = catHeight;
      }
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}
