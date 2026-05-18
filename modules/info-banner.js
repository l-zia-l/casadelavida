/* ==========================================================================
   MODULE: INFO BANNER (info-banner.js)
   Purpose: Injects a full-width announcement bar below the hero.
   ========================================================================== */

const defaultConfig = {
    items: [
        { text: 'Monday – Saturday Delivery in Accra' },
        { text: 'Verified Customer Reviews' }
    ]
};

/**
 * Basic text node sanitization to prevent XSS.
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

export function init(node, customConfig = {}) {
    const config = { ...defaultConfig, ...customConfig };

    // Map through the items to create the flex columns
    const itemsHTML = config.items.map(item => `
        <div class="cdlv-info-banner__item">
            <span class="cdlv-info-banner__text">${sanitizeHTML(item.text)}</span>
        </div>
    `).join('');

    // Inject into the DOM
    const html = `
        <section class="cdlv-info-banner animate-enter" aria-label="Store Information">
            <div class="cdlv-info-banner__inner">
                ${itemsHTML}
            </div>
        </section>
    `;

    node.innerHTML = html;
}