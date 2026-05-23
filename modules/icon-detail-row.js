/* ==========================================================================
   MODULE: ICON DETAIL ROW (modules/icon-detail-row.js)
   Architecture: Exportable ES Module generating semantic HTML.
   Security: Strict DOMPurify-style text sanitization for all injected strings 
   to prevent XSS payloads via custom JSON configs.
   Purpose: Renders a minimalist, high-contrast 3-box grid for key details.
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

const defaultConfig = {
    heading: "The Consultation Experience",
    items: [
        {
            title: "30 Mins",
            subtitle: "Dedicated Session"
        },
        {
            title: "Online",
            subtitle: "Secure Video Link"
        },
        {
            title: "Tailored Tea",
            subtitle: "Custom Wellness Plan"
        }
    ]
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // Architectural constraint: Force exactly 3 items to maintain the design system
    const itemsToRender = config.items.slice(0, 3);

    // 1. Build Semantic HTML
    const templateHTML = `
        <section class="cdlv-icon-detail-row" aria-labelledby="detail-row-heading">
            <header>
                <h2 id="detail-row-heading" class="cdlv-icon-detail-row__heading">
                    ${sanitizeText(config.heading)}
                </h2>
            </header>
            <div class="cdlv-icon-detail-row__grid">
                ${itemsToRender.map(item => `
                    <article class="cdlv-icon-detail-row__item">
                        <h3 class="cdlv-icon-detail-row__title">${sanitizeText(item.title)}</h3>
                        <p class="cdlv-icon-detail-row__subtitle">${sanitizeText(item.subtitle)}</p>
                    </article>
                `).join('')}
            </div>
        </section>
    `;

    // 2. Inject Fragment into DOM target
    node.innerHTML = templateHTML;
};