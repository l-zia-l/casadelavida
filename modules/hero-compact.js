/* ==========================================================================
   MODULE: HERO COMPACT (hero-compact.js)
   Purpose: Injects and manages the Compact Hero (40vh, Text Left / Image Right).
   Architecture: ES Module, Plug-and-Play.
   Security: Data sanitization applied to all configuration variables.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const defaultConfig = {
  bgImage: '', 
  imageAlt: '',
  headingLevel: 'h2', 
  heading: 'The Shop',
  description: 'Every blend crafted with purpose to support women\'s health. Hand-sourced artisanal ingredients designed to elevate your daily routine.',
  ctaText: 'View All Collections',
  ctaLink: 'shop.html',
  isPriority: false 
};

/**
 * Basic text node sanitization to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} - Sanitized string safe for DOM injection
 */
function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

export function init(node, customConfig = {}) {
  const config = { ...defaultConfig, ...customConfig };

  const loadingStrategy = config.isPriority 
    ? 'fetchpriority="high" loading="eager"' 
    : 'loading="lazy"';

  const validHeading = /^(h[1-6])$/i.test(config.headingLevel) ? config.headingLevel.toLowerCase() : 'h2';
  const safeCtaLink = buildPath(config.ctaLink);

  let imageHTML = '';
  if (config.bgImage?.trim()) {
    const safeBgImage = buildPath(config.bgImage);
    imageHTML = `
      <img src="${sanitizeHTML(safeBgImage)}" 
           alt="${sanitizeHTML(config.imageAlt)}" 
           class="cdlv-hero__bg-img u-img-reveal" 
           ${loadingStrategy}
           decoding="async">
    `;
  }

  // Added 'u-fill-width' to inherit the global breakout utility
  const html = `
    <section class="cdlv-hero cdlv-hero--compact u-fill-width animate-enter" role="region" aria-label="${sanitizeHTML(config.heading)}">
      ${imageHTML}
      <div class="cdlv-hero__compact-overlay">
        <${validHeading} class="cdlv-hero__title">${sanitizeHTML(config.heading)}</${validHeading}>
        <p class="cdlv-hero__description">${sanitizeHTML(config.description)}</p>
        <a href="${sanitizeHTML(safeCtaLink)}" class="cdlv-hero__btn cdlv-hero__btn--secondary">
          ${sanitizeHTML(config.ctaText)}
        </a>
      </div>
    </section>
  `;

  node.innerHTML = html;
}