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
  isPriority: false, // NEW: Defaults to false, but allows eager loading if placed above the fold
  categories: [
    {
      title: 'Tea Infusions',
      image: 'assets/images/products/item_2.2.1.webp',
      alt: 'Assorted premium tea infusions',
      description: 'Limited-run blends featuring unique stems, handpicked and sure to sell out.',
      btnText: 'Shop Now',
      btnLink: 'shop/products/premium-herbal-infusion.html'
    },
    {
      title: 'Wellness Boxes',
      image: 'assets/images/products/box_1.webp',
      alt: 'Curated fertility wellness box',
      description: 'The ever-popular, always-sold-out variety that we just can\'t get enough of.',
      btnText: 'Shop Boxes',
      btnLink: 'shop/wellness-boxes.html'
    },
    {
      title: 'Candles & Oils',
      image: 'assets/images/products/item_5.webp',
      alt: 'Vanilla scented candle',
      description: 'Event florals, oversized arrangements and more for your next celebration.',
      btnText: 'Shop Accessories',
      btnLink: 'shop/all-accessories.html'
    }
  ]
};

function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function init(node, customConfig = {}) {
  const config = { ...defaultConfig, ...customConfig };
  
  if (customConfig.categories && Array.isArray(customConfig.categories)) {
    config.categories = customConfig.categories;
  }

  const validHeading = /^(h[1-6])$/i.test(config.headingLevel) ? config.headingLevel.toLowerCase() : 'h2';

  // STRATEGY: Determine if images should block the initial render or defer until scrolled
  const imageLoadingStrategy = config.isPriority 
    ? 'fetchpriority="high" loading="eager"' 
    : 'loading="lazy" decoding="async"';

  const cardsHTML = config.categories.map(category => {
    const safeImage = category.image?.trim() ? buildPath(category.image) : '';
    const safeLink = buildPath(category.btnLink);
    
    const imageElement = safeImage 
      ? `<img src="${sanitizeHTML(safeImage)}" 
              alt="${sanitizeHTML(category.alt)}" 
              class="cdlv-category-3-grid__image u-img-reveal"
              ${imageLoadingStrategy}>`
      : ``; 
    
    return `
      <a href="${sanitizeHTML(safeLink)}" class="cdlv-category-3-grid__card">
        <figure class="cdlv-category-3-grid__figure u-img-loader">
          ${imageElement}
        </figure>
        <div class="cdlv-category-3-grid__content">
          <h3 class="cdlv-category-3-grid__card-title">${sanitizeHTML(category.title)}</h3>
          <p class="cdlv-category-3-grid__desc">${sanitizeHTML(category.description)}</p>
          <span class="cdlv-category-3-grid__btn" aria-hidden="true">${sanitizeHTML(category.btnText)}</span>
        </div>
      </a>
    `;
  }).join('');

  // STRATEGY: Added 'animate-enter' to reuse your global hardware-accelerated will-change rule
  node.innerHTML = `
    <section class="cdlv-category-3-grid u-fill-width animate-enter" aria-labelledby="category-grid-heading">
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
}