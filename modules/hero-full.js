/* ==========================================================================
   MODULE: HERO FULL (hero-full.js)
   Purpose: Injects and manages the Full-Width Hero (Centered Text/Overlay).
   Architecture: ES Module, Plug-and-Play.
   Security: Data sanitization applied to all configuration variables.
   ========================================================================== */

const defaultConfig = {
  bgImage: 'assets/images/products/item_2.2.jpg',
  tagline: 'Sip • Soothe • Blossom',
  heading: 'Your wellness ritual, in one box.',
  description: 'Curated in Ghana for a balanced life. Discover our signature collections.',
  ctaText: 'Begin Your Ritual',
  ctaLink: 'shop/wellness-boxes'
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

// 1. Add customConfig as an optional second parameter
export function init(node, customConfig = {}) {
  
  // 2. Merge the default config with whatever the page passes in
  // Any properties in customConfig will overwrite the default ones!
  const config = { ...defaultConfig, ...customConfig };

  const html = `
    <section class="cdlv-hero cdlv-hero--full animate-enter" aria-label="${sanitizeHTML(config.heading)}">
      <img src="${sanitizeHTML(config.bgImage)}" alt="Casa De La Vida Background" class="cdlv-hero__bg-img">
      <div class="cdlv-hero__overlay-box">
        <span class="cdlv-hero__tagline">${sanitizeHTML(config.tagline)}</span>
        <h1 class="cdlv-hero__title">${sanitizeHTML(config.heading)}</h1>
        <p class="cdlv-hero__description">${sanitizeHTML(config.description)}</p>
        <a href="${sanitizeHTML(config.ctaLink)}" class="cdlv-hero__btn cdlv-hero__btn--primary">
          ${sanitizeHTML(config.ctaText)}
        </a>
      </div>
    </section>
  `;

  node.innerHTML = html;
}