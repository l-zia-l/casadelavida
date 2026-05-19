/* ==========================================================================
   MODULE: CATALOG GRID LOGIC (modules/catalog-grid.js)
   Purpose: Renders a dynamic product grid based on external configuration.
   Architecture: ES Module. Imports global path builder for asset resolution.
   Security: Uses DOM-based sanitization to prevent XSS from config payloads.
   A11y: WCAG compliant (ARIA landmarks, focus states, screen reader optimized).
   Performance: Granular LCP prioritization and layout-shift prevention.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

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
    const config = { ...defaultConfig, ...customConfig };
    const products = customConfig.products || config.products;

    if (!products || !Array.isArray(products) || products.length === 0) {
        console.warn('Catalog Grid Initialization Error: No products array found in config.', node);
        return;
    }

    const headingText = sanitizeHTML(config.heading);
    // Generate a unique ID to link the section to its heading for screen readers
    const headingId = `catalog-heading-${Math.random().toString(36).substring(2, 9)}`;

    const productsHTML = products.map((product, index) => {
        const title = sanitizeHTML(product.title);
        const safeImage = buildPath(product.image);
        const safeLink = buildPath(product.link || '#');
        const basePrice = parseFloat(product.price || 0);
        const discount = product.subscriptionDiscount ? parseFloat(product.subscriptionDiscount) : 0;
        
        // Granular Loading Strategy for Critical Rendering Path
        let loadingStrategy = '';
        if (index === 0) {
            // Most likely LCP candidate: force highest network priority
            loadingStrategy = 'loading="eager" fetchpriority="high" decoding="sync"';
        } else if (index < 4) {
            // Visible "above the fold" on desktop: load immediately, standard priority
            loadingStrategy = 'loading="eager" fetchpriority="auto" decoding="sync"';
        } else {
            // Off-screen elements: defer completely until scrolled near
            loadingStrategy = 'loading="lazy" fetchpriority="low" decoding="async"';
        }

        let subInfoHTML = '';
        let actionBtnHTML = '';

        if (!product.hideActions) {
            if (discount > 0) {
                const subPrice = (basePrice - (basePrice * (discount / 100))).toFixed(2);
                subInfoHTML = `
                    <hr class="cdlv-catalog-grid__divider" aria-hidden="true">
                    <p class="cdlv-catalog-grid__sub-text">Subscribe for ${sanitizeHTML(discount)}% off + free shipping</p>
                    <p class="cdlv-catalog-grid__sub-price">from <strong>GHS ${sanitizeHTML(subPrice)}</strong></p>
                `;
            }

            const isOOS = product.isOutOfStock;
            const btnText = isOOS ? 'Out of Stock' : 'Add to Cart';
            const btnClass = isOOS ? 'cdlv-btn--disabled' : 'cdlv-btn--primary';
            // Strictly apply both aria-disabled and the HTML disabled attribute
            const disabledState = isOOS ? 'disabled aria-disabled="true" tabindex="-1"' : '';

            actionBtnHTML = `
                <button type="button" class="cdlv-btn ${btnClass}" ${disabledState}>
                    ${sanitizeHTML(btnText)}
                </button>
            `;
        }

        // SEO: Fallback to the product title for alt text if a specific alt description isn't provided
        const altText = sanitizeHTML(product.altText || product.title);

        return `
            <article class="cdlv-catalog-grid__card">
                <a href="${sanitizeHTML(safeLink)}" class="cdlv-catalog-grid__link" tabindex="-1" aria-hidden="true">
                    <figure class="cdlv-catalog-grid__img-wrapper u-img-loader">
                        <img src="${sanitizeHTML(safeImage)}" 
                             alt="${altText}" 
                             class="u-img-reveal"
                             ${loadingStrategy}>
                    </figure>
                </a>
                <div class="cdlv-catalog-grid__content">
                    <h3 class="cdlv-catalog-grid__item-title">
                        <a href="${sanitizeHTML(safeLink)}">${title}</a>
                    </h3>
                    <p class="cdlv-catalog-grid__price">from <strong>GHS ${sanitizeHTML(basePrice.toFixed(2))}</strong></p>
                    ${subInfoHTML}
                    ${actionBtnHTML}
                </div>
            </article>
        `;
    }).join('');

    // Hook into the global image-render.js engine
    node.setAttribute('data-image-sync', 'true');

    // aria-labelledby connects the section to the h2 for semantic grouping
    node.innerHTML = `
        <section class="cdlv-catalog-grid animate-enter" aria-labelledby="${headingId}">
            <header class="cdlv-catalog-grid__header">
                <h2 id="${headingId}" class="cdlv-catalog-grid__title">${headingText}</h2>
            </header>
            <div class="cdlv-catalog-grid__items">
                ${productsHTML}
            </div>
        </section>
    `;
};