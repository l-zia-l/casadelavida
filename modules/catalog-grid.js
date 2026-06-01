/* ==========================================================================
   MODULE: CATALOG GRID LOGIC (modules/catalog-grid.js)
   Architecture: Exportable ES Module driving high-performance product loops.
   Security: Enforces strict data-integrity via centralized product reference registry.
   A11y: Fully semantic landmarks with dynamic target control optimization.
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { addToCart } from '../utils/cart.js'; // <-- ENFORCED EXPLICIT IMPORT
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
        // SECURITY GATEWAY: Force resolution of item properties directly out of the frozen database file layer
        if (!configItem.id) {
            console.warn(`Catalog layout structural exception: Index ${index} missing required validation id tracking token.`);
            return '';
        }

        const product = getProductFromRegistry(configItem.id);

        const title = sanitizeHTML(product.title);
        const safeImage = buildPath(product.image);
        const safeLink = buildPath(product.link || '#');
        
        // Resolve canonical pricing using the preconfigured default size option mapping
        const defaultSizeObj = product.sizes?.find(s => s.default) || product.sizes?.[0] || { price: 0.00, id: 's1' };
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

        // Local Delivery Logic: Evaluate parameters safely derived from inventory layer
        let isAvailableLocally = true;
        if (isAccraPage && !product.inAccra) {
            isAvailableLocally = false;
        } else if (isTamalePage && !product.inTamale) {
            isAvailableLocally = false;
        }

        // Render localized exception banners cleanly if context requires bounding rules
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

            // Evaluate item availability checks cleanly
            const isOOS = product.isOutOfStock || !isAvailableLocally;
            const btnText = isOOS ? 'Out of Stock' : 'Add to Cart';
            const btnClass = isOOS ? 'cdlv-btn--disabled' : 'cdlv-btn--primary';
            const disabledState = isOOS ? 'disabled aria-disabled="true" tabindex="-1"' : '';

            // --- ZERO-TRUST NORMALIZED MARKETING ATTRIBUTES ---
            actionBtnHTML = `
                <button type="button" class="cdlv-btn ${btnClass}" ${disabledState}
                    data-action="catalog-add"
                    data-id="${sanitizeHTML(product.id)}"
                    data-size-id="${sanitizeHTML(defaultSizeObj.id)}"
                    data-price="${sanitizeHTML(basePrice)}">
                    ${sanitizeHTML(btnText)}
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
};

// ==========================================================================
// CENTRALIZED COMPONENT INTERACTION TRACKING DELGATE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Intercept event target bubbling from global body container context
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="catalog-add"]');
        if (!btn) return;
        
        const productId = btn.getAttribute('data-id');
        const product = getProductFromRegistry(productId);
        const selectedSizeId = btn.getAttribute('data-size-id');
        const parsedPrice = parseFloat(btn.getAttribute('data-price'));

        // STRUCTURAL SCHEMA FORMATTING: Normalize data payload into decoupled state definitions
        const standardizedCartItem = {
            id: `${product.id}_${selectedSizeId}_none_one`,
            product_id: product.id,
            name: product.title,
            size: selectedSizeId,
            color: null,
            isSubscription: false,
            price: parsedPrice,
            quantity: 1,
            maxStock: product.maxStock || 10,
            image: product.image,
            url: product.link
        };
        
        addToCart(standardizedCartItem);
        
        // Retain original style loop updates
        const originalText = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('is-success');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('is-success');
        }, 1500);
    });
});