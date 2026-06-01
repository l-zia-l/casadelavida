/* ==========================================================================
   MODULE: CATALOG GRID LOGIC (modules/catalog-grid.js)
   Architecture: Exportable ES Module driving high-performance product loops.
   Security: Enforces strict data-integrity via centralized product reference registry.
   UX Update: Retains safe link traversal routing to enforce product page item validation.
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { getProductFromRegistry } from '../utils/inventory.js'; // <-- CENTRAL REGISTER INGESTION

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
    const configProducts = customConfig.products || config.products;

    if (!configProducts || !Array.isArray(configProducts) || configProducts.length === 0) {
        console.warn('Catalog Grid Initialization Error: No products registry target found in configuration markup.', node);
        return;
    }

    const headingText = sanitizeHTML(config.heading);
    const headingId = `catalog-heading-${Math.random().toString(36).substring(2, 9)}`;

    // Automatically resolve delivery geography targets matching current file paths
    const currentPath = window.location.pathname.toLowerCase();
    const isAccraPage = currentPath.includes('accra.html');
    const isTamalePage = currentPath.includes('tamale.html');

    const productsHTML = configProducts.map((configItem, index) => {
        if (!configItem.id) {
            console.warn(`Catalog layout structural exception: Index ${index} missing required validation id tracking token.`);
            return '';
        }

        const product = getProductFromRegistry(configItem.id);

        const title = sanitizeHTML(product.title);
        const safeImage = buildPath(product.image);
        const safeLink = buildPath(product.link || '#');
        
        // Resolve default pricing representation from registry mapping
        const defaultSizeObj = product.sizes?.find(s => s.default) || product.sizes?.[0] || { price: 0.00 };
        const basePrice = parseFloat(defaultSizeObj.price || 0);
        const discount = product.subscriptionDiscount ? parseFloat(product.subscriptionDiscount) : 0;
        
        // Performance: Enforce dynamic hardware LCP allocation guidelines
        let loadingStrategy = '';
        if (index === 0) {
            loadingStrategy = 'loading="eager" fetchpriority="high" decoding="sync"';
        } else if (index < 4) {
            loadingStrategy = 'loading="eager" fetchpriority="auto" decoding="sync"';
        } else {
            loadingStrategy = 'loading="lazy" fetchpriority="low" decoding="async"';
        }

        let subInfoHTML = '';
        let availabilityHTML = '';
        let actionBtnHTML = '';

        // Local Delivery Logic
        let isAvailableLocally = true;
        if (isAccraPage && !product.inAccra) {
            isAvailableLocally = false;
        } else if (isTamalePage && !product.inTamale) {
            isAvailableLocally = false;
        }

        if (!isAvailableLocally) {
            availabilityHTML = `
                <div class="cdlv-catalog-grid__status-banner" role="alert">
                    NOT AVAILABLE
                </div>
            `;
        }

        if (!product.hideActions) {
            if (discount > 0) {
                const factor = 1 - (discount / 100);
                const subPrice = (basePrice * factor).toFixed(2);
                subInfoHTML = `
                    <hr class="cdlv-catalog-grid__divider" aria-hidden="true">
                    <p class="cdlv-catalog-grid__sub-text">Subscribe for ${sanitizeHTML(discount)}% off + free shipping</p>
                    <p class="cdlv-catalog-grid__sub-price">from <strong>GHS ${sanitizeHTML(subPrice)}</strong></p>
                `;
            }

            // --- REDIRECT ARCHITECTURE: View Product Link Mapping ---
            // Button styles and parameters are retained perfectly intact
            actionBtnHTML = `
                <button type="button" class="cdlv-btn cdlv-btn--primary"
                    data-action="catalog-view"
                    data-url="${sanitizeHTML(safeLink)}">
                    View Product
                </button>
            `;
        }

        const altText = sanitizeHTML(product.title);

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
                    ${availabilityHTML}
                    ${actionBtnHTML}
                </div>
            </article>
        `;
    }).join('');

    node.setAttribute('data-image-sync', 'true');

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

    // --- SCOPED INTERACTION ROUTING TOGGLE ---
    node.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="catalog-view"]');
        if (!btn) return;
        
        const targetUrl = btn.getAttribute('data-url');
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    });
};