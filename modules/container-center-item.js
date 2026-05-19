/* ==========================================================================
   MODULE: CONTAINER CENTER ITEM (modules/container-center-item.js)
   Purpose: Dynamically renders a full-width call-to-action banner.
   Architecture: Exportable ES Module. Constructs a fragment and injects it.
   Security: Implements DOM-based text sanitization to prevent XSS from 
             malicious or malformed data-config inputs.
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
    heading: "Soften Up Your Inbox",
    text: "Join our email list for fresh wellness drops, enlightening blog posts and exclusive savings.",
    buttonText: "Sign Up",
    buttonLink: "newsletter-sign-up.html"
};

/**
 * Initializes the module, merges configurations, and injects the UI.
 * @param {HTMLElement} node - The DOM element to inject the component into.
 * @param {Object} customConfig - Optional JSON configuration from data-config.
 */
export const init = (node, customConfig = {}) => {
    // Merge defaults with any overrides provided via data-config
    const config = { ...defaultConfig, ...customConfig };

    // Apply the global fluid width utility to the mounting node
    node.classList.add('u-fill-width');

    // Construct the semantic fragment using sanitized inputs
    const html = `
        <section class="cdlv-container-center-item">
            <h2 class="cdlv-container-center-item__heading">
                ${sanitizeText(config.heading)}
            </h2>
            <p class="cdlv-container-center-item__text">
                ${sanitizeText(config.text)}
            </p>
            <a href="${sanitizeText(config.buttonLink)}" class="cdlv-container-center-item__btn">
                ${sanitizeText(config.buttonText)}
            </a>
        </section>
    `;

    // Inject fragment into the DOM
    node.innerHTML = html;
};