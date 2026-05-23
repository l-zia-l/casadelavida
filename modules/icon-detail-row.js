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
    const itemsToRender = config.items.slice(0, 3);
    
    // A11y: Generate a unique ID to prevent screen reader mapping collisions
    const instanceId = Math.random().toString(36).substring(2, 9);
    const headingId = `detail-heading-${instanceId}`;

    const templateHTML = `
        <section class="cdlv-icon-detail-row" aria-labelledby="${headingId}">
            <header>
                <h2 id="${headingId}" class="cdlv-icon-detail-row__heading">
                    ${sanitizeText(config.heading)}
                </h2>
            </header>
            
            <!-- SEO/A11y: role="list" fixes Safari voiceover bug when list-style is none -->
            <ul class="cdlv-icon-detail-row__grid" role="list">
                ${itemsToRender.map(item => `
                    <li class="cdlv-icon-detail-row__item">
                        <h3 class="cdlv-icon-detail-row__title">${sanitizeText(item.title)}</h3>
                        <p class="cdlv-icon-detail-row__subtitle">${sanitizeText(item.subtitle)}</p>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;

    node.innerHTML = templateHTML;
};