/* ==========================================================================
   MODULE: CATALOG GRID LOGIC (modules/catalog-grid.js)
   Purpose: Renders a dynamic product grid based on external configuration.
   Architecture: ES Module. Imports global path builder for asset resolution.
   Security: Uses DOM-based sanitization to prevent XSS from config payloads.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

// Default configuration fallback
const defaultConfig = {
    heading: 'Our Collection',
    products: []
};

/**
 * Sanitizes strings to prevent Cross-Site Scripting (XSS).
 * @param {string|number} str - The raw input.
 * @returns {string} - The sanitized HTML string.
 */
function sanitizeHTML(str) {
    if (!str && str !== 0) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Initializes the module by compiling the config and injecting the DOM elements.
 * @param {HTMLElement} node - The DOM node assigned to this module.
 * @param {Object} customConfig - The configuration parsed from data-config.
 */
export const init = (node, customConfig = {}) => {
    // Merge provided config with defaults
    const config = { ...defaultConfig, ...customConfig };
    const products = customConfig.products || config.products;

    if (!products || !Array.isArray(products) || products.length === 0) {
        console.warn('Catalog Grid Initialization Error: No products array found in config.', node);
        return;
    }

    const headingText = sanitizeHTML(config.heading);

    // Map through the products and build the HTML fragments
    const productsHTML = products.map((product, index) => {
        const title = sanitizeHTML(product.title);
        const safeImage = buildPath(product.image);
        const safeLink = buildPath(product.link || '#');
        const basePrice = parseFloat(product.price || 0);
        const discount = product.subscriptionDiscount ? parseFloat(product.subscriptionDiscount) : 0;
        
        // Eager load the first 4 visible cards (desktop grid baseline), lazy load the rest
        const isVisible = index < 4;
        const loadingStrategy = isVisible ? 'loading="eager" decoding="sync"' : 'loading="lazy" decoding="async"';

        let subInfoHTML = '';
        let actionBtnHTML = '';

        // If actions are not hidden, process subscriptions and buttons
        if (!product.hideActions) {
            if (discount > 0) {
                const subPrice = (basePrice - (basePrice * (discount / 100))).toFixed(2);
                subInfoHTML = `
                    <hr class="cdlv-catalog-grid__divider">
                    <p class="cdlv-catalog-grid__sub-text">Subscribe for ${sanitizeHTML(discount)}% off + free shipping</p>
                    <p class="cdlv-catalog-grid__sub-price">from <strong>GHS ${sanitizeHTML(subPrice)}</strong></p>
                `;
            }

            const isOOS = product.isOutOfStock;
            const btnText = isOOS ? 'Out of Stock' : 'Add to Cart';
            const btnClass = isOOS ? 'cdlv-btn--disabled' : 'cdlv-btn--primary';
            const ariaDisabled = isOOS ? 'aria-disabled="true" tabindex="-1"' : '';

            actionBtnHTML = `
                <button class="cdlv-btn ${btnClass}" ${ariaDisabled}>
                    ${sanitizeHTML(btnText)}
                </button>
            `;
        }

        // Assemble individual card fragment
        return `
            <article class="cdlv-catalog-grid__card">
                <a href="${sanitizeHTML(safeLink)}" class="cdlv-catalog-grid__link">
                    <figure class="cdlv-catalog-grid__img-wrapper u-img-loader">
                        <img src="${sanitizeHTML(safeImage)}" 
                             alt="${title}" 
                             class="u-img-reveal"
                             ${loadingStrategy}>
                    </figure>
                </a>
                <div class="cdlv-catalog-grid__content">
                    <h3 class="cdlv-catalog-grid__item-title">${title}</h3>
                    <p class="cdlv-catalog-grid__price">from <strong>GHS ${sanitizeHTML(basePrice.toFixed(2))}</strong></p>
                    ${subInfoHTML}
                    ${actionBtnHTML}
                </div>
            </article>
        `;
    }).join('');

    // Ensure data-image-sync is applied for the global image render engine
    node.setAttribute('data-image-sync', 'true');

    // Build the grid structure natively within the target node
    node.innerHTML = `
        <section class="cdlv-catalog-grid animate-enter" aria-label="${headingText}">
            <header class="cdlv-catalog-grid__header">
                <h2 class="cdlv-catalog-grid__title">${headingText}</h2>
            </header>
            <div class="cdlv-catalog-grid__items">
                ${productsHTML}
            </div>
        </section>
    `;
};