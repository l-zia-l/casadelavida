/* ==========================================================================
   MODULE: HERO COMPACT (hero-compact.js)
   Purpose: Injects and manages the Compact Hero (40vh, Text Left / Image Right).
   Architecture: ES Module, Plug-and-Play.
   Security: Data sanitization applied to all configuration variables.
   ========================================================================== */

const defaultConfig = {
  bgImage: 'assets/images/products/item_2.2.jpg', // Honey, Black Seed Oil, Tea Infuser
  heading: 'The Shop',
  description: 'Every blend crafted with purpose to support women\'s health. Hand-sourced artisanal ingredients designed to elevate your daily routine.',
  ctaText: 'View All Collections',
  ctaLink: 'shop'
};

/**
 * Basic text node sanitization to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} - Sanitized string safe for DOM injection
 */
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function init(node) {
  const config = { ...defaultConfig };

  const html = `
    <section class="cdlv-hero cdlv-hero--compact animate-enter" aria-label="${sanitizeHTML(config.heading)}">
      
      <div class="cdlv-hero__text-panel">
        <h1 class="cdlv-hero__title">${sanitizeHTML(config.heading)}</h1>
        <p class="cdlv-hero__description">${sanitizeHTML(config.description)}</p>
        
        <a href="${sanitizeHTML(config.ctaLink)}" class="cdlv-hero__btn cdlv-hero__btn--secondary">
          ${sanitizeHTML(config.ctaText)}
        </a>
      </div>

      <div class="cdlv-hero__image-panel" 
           style="background-image: url('${encodeURI(config.bgImage)}');"
           role="img" 
           aria-label="Casa De La Vida Wellness Elements">
      </div>

    </section>
  `;

  node.innerHTML = html;
}