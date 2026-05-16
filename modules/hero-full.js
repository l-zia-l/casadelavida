/* ==========================================================================
   MODULE: HERO FULL (hero-full.js)
   Purpose: Injects and manages the Full-Width Hero (Centered Text/Overlay).
   Architecture: ES Module, Plug-and-Play.
   Security: Data sanitization applied to all configuration variables.
   ========================================================================== */

// 1. Create a helper function to determine the base path
function getBasePath() {
  // Checks if we are on GitHub Pages and extracts the repo name automatically
  if (window.location.hostname.includes('github.io')) {
    const repoName = window.location.pathname.split('/')[1];
    return `/${repoName}`;
  }
  // If we are on localhost or a custom domain, use the standard root
  return '';
}

// 2. Prepend the base path to your asset link
const defaultConfig = {
  bgImage: `${getBasePath()}/assets/images/products/item_2.2.jpg`,
  tagline: 'Sip • Soothe • Blossom',
  heading: 'Your wellness ritual, in one box.',
  description: 'Curated in Ghana for a balanced life. Discover our signature collections.',
  ctaText: 'Begin Your Ritual',
  ctaLink: `${getBasePath()}/shop/wellness-boxes` // Also applied to links!
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
  // Allow overriding defaults via data attributes in the future if needed
  const config = { ...defaultConfig };

  const html = `
    <section class="cdlv-hero cdlv-hero--full animate-enter" 
             style="background-image: url('${encodeURI(config.bgImage)}');"
             aria-label="Welcome to Casa De La Vida">
      
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