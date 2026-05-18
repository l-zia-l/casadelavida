/* ==========================================================================
   MODULE: CATEGORY 3 GRID (modules/category-3-grid.js)
   Purpose: Injects and manages the 3-column responsive category grid.
   Architecture: ES Module, Plug-and-Play. Uses semantic HTML5.
   Security: DOM elements are sanitized prior to injection to prevent XSS.
             Uses data-image-sync to interface with the global image engine.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const defaultConfig = {
  headingLevel: 'h2',
  heading: 'New & Noteworthy',
  categories: [
    {
      title: 'Tea Infusions',
      image: 'assets/images/products/item_2.2.1.jpg',
      alt: 'Assorted premium tea infusions',
      description: 'Limited-run blends featuring unique stems, handpicked and sure to sell out.',
      btnText: 'Shop Now',
      btnLink: 'shop/products/premium-herbal-infusion.html'
    },
    {
      title: 'Wellness Boxes',
      image: 'assets/images/products/box_1.png',
      alt: 'Curated fertility wellness box',
      description: 'The ever-popular, always-sold-out variety that we just can\'t get enough of.',
      btnText: 'Shop Boxes',
      btnLink: 'shop/wellness-boxes.html'
    },
    {
      title: 'Candles & Oils',
      image: 'assets/images/products/item_5.jpg',
      alt: 'Vanilla scented candle',
      description: 'Event florals, oversized arrangements and more for your next celebration.',
      btnText: 'Shop Accessories',
      btnLink: 'shop/all-accessories.html'
    }
  ]
};

/**
 * Basic text node sanitization to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} - Sanitized string safe for DOM injection
 */
function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function init(node, customConfig = {}) {
  // Merge configurations safely
  const config = { ...defaultConfig, ...customConfig };
  
  // Allow array override specifically
  if (customConfig.categories && Array.isArray(customConfig.categories)) {
    config.categories = customConfig.categories;
  }

  // Ensure heading level falls back safely to 'h2' to prevent tag injection
  const validHeading = /^(h[1-6])$/i.test(config.headingLevel) ? config.headingLevel.toLowerCase() : 'h2';

  // Generate the cards
  const cardsHTML = config.categories.map(category => {
    // Graceful fallback for missing images
    const hasImage = category.image && category.image.trim() !== '';
    const safeImage = hasImage ? buildPath(category.image) : '';
    const safeLink = buildPath(category.btnLink);
    
    const imageElement = hasImage 
      ? `<img src="${sanitizeHTML(safeImage)}" 
              alt="${sanitizeHTML(category.alt)}" 
              class="cdlv-category-3-grid__image"
              loading="lazy"
              decoding="async">`
      : ``; // Renders an empty placeholder space using the figure background color if no image
    
    return `
      <a href="${sanitizeHTML(safeLink)}" class="cdlv-category-3-grid__card" aria-label="${sanitizeHTML(category.title)}">
        <figure class="cdlv-category-3-grid__figure">
          ${imageElement}
        </figure>
        <div class="cdlv-category-3-grid__content">
          <h3 class="cdlv-category-3-grid__card-title">${sanitizeHTML(category.title)}</h3>
          <p class="cdlv-category-3-grid__desc">${sanitizeHTML(category.description)}</p>
          <span class="cdlv-category-3-grid__btn">${sanitizeHTML(category.btnText)}</span>
        </div>
      </a>
    `;
  }).join('');

  // The wrapper uses data-image-sync to alert image-render.js 
  // to coordinate the reveal of these clustered images simultaneously.
  const html = `
    <section class="cdlv-category-3-grid" aria-labelledby="category-grid-heading" data-image-sync>
      <header class="cdlv-category-3-grid__header">
        <${validHeading} id="category-grid-heading" class="cdlv-category-3-grid__title">
          ${sanitizeHTML(config.heading)}
        </${validHeading}>
      </header>
      <div class="cdlv-category-3-grid__grid">
        ${cardsHTML}
      </div>
    </section>
  `;

  node.innerHTML = html;
}