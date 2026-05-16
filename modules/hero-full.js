/* ==========================================================================
   MODULE: HERO FULL (hero-full.js)
   Purpose: Injects and manages the Full-Width Hero (Centered Text/Overlay).
   Architecture: ES Module, Plug-and-Play.
   Security: Data sanitization applied to all configuration variables.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const defaultConfig = {
  bgImage: 'assets/images/products/item_2.2.jpg',
  tagline: 'Sip • Soothe • Blossom',
  heading: 'Your wellness ritual, in one box.',
  description: 'Curated in Ghana for a balanced life. Discover our signature collections.',
  ctaText: 'Begin Your Ritual',
  ctaLink: 'shop/wellness-boxes.html',
  isPriority: true // Defaults to true for the main hero
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

export function init(node, customConfig = {}) {
  const config = { ...defaultConfig, ...customConfig };

  // Determine loading strategy based on priority
  const loadingStrategy = config.isPriority 
    ? 'fetchpriority="high" loading="eager"' 
    : 'loading="lazy"';

  const safeBgImage = buildPath(config.bgImage);
  const safeCtaLink = buildPath(config.ctaLink);

  const html = `
    <section class="cdlv-hero cdlv-hero--full animate-enter" role="region" aria-label="${sanitizeHTML(config.heading)}">
      
      <img src="${sanitizeHTML(safeBgImage)}" 
           alt="" 
           aria-hidden="true" 
           class="cdlv-hero__bg-img"
           ${loadingStrategy}
           decoding="async">
      
      <div class="cdlv-hero__overlay-box">
        <span class="cdlv-hero__tagline">${sanitizeHTML(config.tagline)}</span>
        <h1 class="cdlv-hero__title">${sanitizeHTML(config.heading)}</h1>
        <p class="cdlv-hero__description">${sanitizeHTML(config.description)}</p>
        
        <a href="${sanitizeHTML(safeCtaLink)}" class="cdlv-hero__btn cdlv-hero__btn--primary">
          ${sanitizeHTML(config.ctaText)}
        </a>
      </div>
    </section>
  `;

  node.innerHTML = html;
}