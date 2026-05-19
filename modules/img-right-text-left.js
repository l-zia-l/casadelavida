/* ==========================================================================
   MODULE: IMAGE RIGHT TEXT LEFT (modules/img-right-text-left.js)
   Architecture: Exportable ES Module. Generates a responsive, two-column 
   layout with text on the left and an image on the right.
   Security: Implements DOMPurify-style text sanitization for all injected 
   strings to mitigate XSS vulnerabilities. Implements basic URL sanitization.
   Dependencies: Relies on `utils/components.js` for initialization, 
   `components.css` for styling, and `utils/image-render.js` for lazy reveals.
   Performance: Uses native CSS Grid for fluid layout scaling. 
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection from config strings.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

/**
 * Basic URL sanitizer to prevent javascript protocol injection in image sources.
 * @param {string} url - Raw URL string
 * @returns {string} - Sanitized URL string
 */
const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return '';
    const cleanUrl = url.replace(/javascript:/gi, '');
    return encodeURI(cleanUrl);
};

// Default configuration providing the brand's origin story
const defaultConfig = {
    subtitle: "Our Story",
    title: "Supporting Women's Health",
    content: [
        "Casa De La Vida was born from a simple but powerful intention: to remind women to slow down, to breathe, and to nurture themselves. In the middle of busy days, endless responsibilities, and constant giving, we so often forget to give back to ourselves. This is exactly where the journey of Casa De La Vida begins.",
        "What started as a personal passion for tea and natural living quickly blossomed into something much deeper—a desire to create profound moments of calm, softness, and true reconnection for women everywhere. Each signature blend and curated wellness box is designed with absolute care, not just to support the body, but to establish a sacred ritual. It is a dedicated moment to pause, to reset, and to reconnect with positive energy.",
        "Because taking care of yourself is never a luxury; it is an absolute necessity. Casa De La Vida stands as an open invitation to step into the soft life—to slow down, deeply nurture your body, and beautifully recharge for everything that life asks of you."
    ],
    imageSrc: "assets/images/logo.png",
    imageAlt: "Casa De La Vida Logo"
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // Helper to render content whether it's a string or an array of paragraphs
    const renderContent = (contentData) => {
        if (Array.isArray(contentData)) {
            return contentData.map(paragraph => 
                `<p class="cdlv-img-right-text-left__body">${sanitizeText(paragraph)}</p>`
            ).join('');
        }
        return `<p class="cdlv-img-right-text-left__body">${sanitizeText(contentData)}</p>`;
    };
    
    // 1. Build HTML Structure
    // Swapped .container for .container-fluid to break the max-width limits
    const template = `
        <section class="cdlv-img-right-text-left u-fill-width">
            <div class="container-fluid cdlv-img-right-text-left__grid">
                
                <article class="cdlv-img-right-text-left__content animate-enter">
                    ${config.subtitle ? `<span class="cdlv-img-right-text-left__subtitle">${sanitizeText(config.subtitle)}</span>` : ''}
                    <h2 class="cdlv-img-right-text-left__title">${sanitizeText(config.title)}</h2>
                    ${renderContent(config.content)}
                </article>

                <figure class="cdlv-img-right-text-left__media u-img-loader">
                    <img src="${sanitizeUrl(config.imageSrc)}" 
                         alt="${sanitizeText(config.imageAlt)}" 
                         class="cdlv-img-right-text-left__image u-img-reveal" 
                         loading="lazy">
                </figure>
                
            </div>
        </section>
    `;

    // 2. Inject Fragment
    node.innerHTML = template;
};