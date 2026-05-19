import { buildPath } from '../utils/path.js';

const defaultConfig = {
  headingLevel: 'h2',
  heading: 'New & Noteworthy',
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
  
  // Ensure categories array falls back safely
  if (!Array.isArray(config.categories)) {
    config.categories = defaultConfig.categories;
  }

  const validHeading = /^(h[1-6])$/i.test(config.headingLevel) ? config.headingLevel.toLowerCase() : 'h2';

  const cardsHTML = config.categories.map(category => {
    const safeImage = category.image?.trim() ? buildPath(category.image) : '';
    const safeLink = buildPath(category.btnLink);
    
    const imageElement = safeImage 
      ? `<img src="${sanitizeHTML(safeImage)}" 
              alt="${sanitizeHTML(category.alt)}" 
              class="cdlv-category-3-grid__image"
              loading="lazy"
              decoding="async">`
      : ``; 
    
    return `
      <a href="${sanitizeHTML(safeLink)}" class="cdlv-category-3-grid__card" aria-label="${sanitizeHTML(category.title)}">
        <figure class="cdlv-category-3-grid__figure u-img-loader">
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

  // Added 'u-fill-width' utility class to inherit global logic
  node.innerHTML = `
    <section class="cdlv-category-3-grid u-fill-width" aria-labelledby="category-grid-heading">
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