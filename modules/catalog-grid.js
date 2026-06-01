/* ==========================================================================
   MODULE: CATALOG GRID LOGIC (modules/catalog-grid.js)
   Purpose: Renders a dynamic product grid based on external configuration.
   Architecture: ES Module. Imports global path builder for asset resolution.
   Security: Uses DOM-based sanitization to prevent XSS from config payloads.
   A11y: WCAG compliant (ARIA landmarks, focus states, screen reader optimized).
   Performance: Granular LCP prioritization and layout-shift prevention.
   Local Delivery: Dynamically identifies city pages to show localized availability.
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
    const headingId = `catalog-heading-${Math.random().toString(36).substring(2, 9)}`;

    // Detect delivery context automatically based on the current page URL path
    const currentPath = window.location.pathname.toLowerCase();
    const isAccraPage = currentPath.includes('accra.html');
    const isTamalePage = currentPath.includes('tamale.html');

    const productsHTML = products.map((product, index) => {
        const title = sanitizeHTML(product.title);
        const safeImage = buildPath(product.image);
        const safeLink = buildPath(product.link || '#');
        const basePrice = parseFloat(product.price || 0);
        const discount = product.subscriptionDiscount ? parseFloat(product.subscriptionDiscount) : 0;
        
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

        // Local Delivery Logic: Evaluate product restrictions based on the page context
        let isAvailableLocally = true;
        if (isAccraPage && product.hasOwnProperty('inAccra') && !product.inAccra) {
            isAvailableLocally = false;
        } else if (isTamalePage && product.hasOwnProperty('inTamale') && !product.inTamale) {
            isAvailableLocally = false;
        }

        // Render localized alert if product is excluded from the current city
        if (!isAvailableLocally) {
            availabilityHTML = `
                <div class="cdlv-catalog-grid__status-banner" role="alert">
                    NOT AVAILABLE
                </div>
            `;
        }

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
            const disabledState = isOOS ? 'disabled aria-disabled="true" tabindex="-1"' : '';
            
            // We need a fallback ID if the config doesn't provide one
            const safeId = product.id || `cat_prod_${index}`;
            const safeFinalPrice = discount > 0 ? (basePrice - (basePrice * (discount / 100))) : basePrice;

            // --- INJECT DATA ATTRIBUTES FOR CART ---
            actionBtnHTML = `
                <button type="button" class="cdlv-btn ${btnClass}" ${disabledState}
                    data-action="catalog-add"
                    data-id="${sanitizeHTML(safeId)}"
                    data-title="${sanitizeHTML(product.title)}"
                    data-price="${safeFinalPrice}"
                    data-image="${sanitizeHTML(product.image)}"
                    data-url="${sanitizeHTML(product.link || '#')}">
                    ${sanitizeHTML(btnText)}
                </button>
            `;
        }

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

    // --- NEW: ADD TO CART LISTENER FOR GRID ---
    node.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="catalog-add"]');
        if (!btn) return;
        
        const item = {
            id: btn.getAttribute('data-id'),
            name: btn.getAttribute('data-title'),
            variant: 'Standard', 
            price: parseFloat(btn.getAttribute('data-price')),
            quantity: 1,
            maxStock: 10,
            image: btn.getAttribute('data-image'),
            url: btn.getAttribute('data-url')
        };
        
        addToCart(item);
        
        // Visual feedback
        const originalText = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('is-success');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('is-success');
        }, 1500);
    });
};