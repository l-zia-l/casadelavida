/* ==========================================================================
   MODULE: CONTAINER CENTER ITEM (modules/container-center-item.js)
   Purpose: Dynamically renders a full-width call-to-action banner.
   Architecture: Exportable ES Module. Constructs a fragment and injects it.
   Security: Implements DOM-based text sanitization.
   A11y: Dynamic ID generation for ARIA labeling.
   SEO: Dynamic heading level mapping to prevent skipped hierarchy.
   ========================================================================== */

/**
 * Sanitizes input strings by converting them to text nodes, neutralizing HTML execution.
 * @param {string} str - The raw string from the config.
 * @returns {string} The safely encoded string.
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Default configurable text parameters
const defaultConfig = {
    headingLevel: "h2", // Configurable for strict SEO hierarchy
    heading: "Brighten Up Your Inbox",
    text: "Join our email list for fresh floral drops, curated picks and exclusive savings.",
    buttonText: "Sign Up",
    buttonLink: "newsletter-sign-up.html"
};

/**
 * Initializes the module, merges configurations, and injects the UI.
 * @param {HTMLElement} node - The DOM element to inject the component into.
 * @param {Object} customConfig - Optional JSON configuration from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    node.classList.add('u-fill-width');

    // Generate a unique ID to link the section to its heading for screen readers
    const uniqueId = `cta-heading-${Math.random().toString(36).substring(2, 9)}`;

    // Validate the heading level to prevent HTML injection of unsupported tags
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const semanticTag = validHeadings.includes(config.headingLevel.toLowerCase()) 
        ? config.headingLevel.toLowerCase() 
        : 'h2';

    const html = `
        <section class="cdlv-container-center-item" aria-labelledby="${uniqueId}">
            <${semanticTag} id="${uniqueId}" class="cdlv-container-center-item__heading">
                ${sanitizeText(config.heading)}
            </${semanticTag}>
            <p class="cdlv-container-center-item__text">
                ${sanitizeText(config.text)}
            </p>
            <a href="${sanitizeText(config.buttonLink)}" 
               class="cdlv-container-center-item__btn"
               aria-label="${sanitizeText(config.buttonText)} for ${sanitizeText(config.heading)}">
                ${sanitizeText(config.buttonText)}
            </a>
        </section>
    `;

    node.innerHTML = html;
};