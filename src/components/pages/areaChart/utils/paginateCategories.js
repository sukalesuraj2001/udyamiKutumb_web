export const ROWS_PER_PAGE = 7;
export const COLS_PER_PAGE = 5;
export const SLOTS_PER_PAGE = ROWS_PER_PAGE * COLS_PER_PAGE;

/**
 * Calculates height of a category block rendered in a 5-column grid layout.
 * 
 * @param {number} productCount - Number of products in category
 * @returns {number} Height in pixels
 */
export function calculateCategoryHeight(productCount = 0) {
  if (productCount <= 0) return 0;
  const rows = Math.ceil(productCount / COLS_PER_PAGE);
  return rows * 134 + (rows - 1) * 6;
}

/**
 * Paginates an array of brand categories into separate pages with a strict 7-row (35 slots max) limit.
 * 
 * @param {Array} categories - Array of category objects
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

  const pages = [];
  let currentPage = [];
  let currentRows = 0;

  for (const cat of categories) {
    if (!cat.products || cat.products.length === 0) continue;

    let remainingProducts = [...cat.products];

    while (remainingProducts.length > 0) {
      if (currentRows >= ROWS_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
        currentRows = 0;
      }

      const rowsAvailable = ROWS_PER_PAGE - currentRows;
      const availableSlots = rowsAvailable * COLS_PER_PAGE;
      const productsToTake = remainingProducts.slice(0, availableSlots);
      const rowsTaken = Math.ceil(productsToTake.length / COLS_PER_PAGE);

      currentPage.push({
        ...cat,
        products: productsToTake,
      });

      currentRows += rowsTaken;
      remainingProducts = remainingProducts.slice(availableSlots);
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  if (pages.length === 0) {
    return [[]];
  }

  return pages;
}

