/* ==========================================================================
   MODULE: CATEGORY 3-GRID (category-3-grid.js)
   Purpose: Injects a responsive 3-column category grid.
   Architecture: ES Module, Plug-and-Play.
   Security: Strict HTML sanitization applied to prevent XSS vulnerabilities.
   Integration: Uses data-image-sync for the global image render engine.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const defaultConfig = {
    heading: "Our Signature Collections",
    cards: [
        {
            title: "Tea Infusions",
            desc: "Limited-run blends featuring unique stems, handpicked and sure to sell out.",
            btnText: "Shop Now",
            btnLink: "shop/wellness-boxes.html",
            image: "assets/images/products/item_2.2.1.jpg",
            imageAlt: "Premium Tea Infusions"
        },
        {
            title: "Wellness Boxes",
            desc: "The ever-popular, always-sold-out variety that we just can't get enough of.",
            btnText: "Shop Boxes",
            btnLink: "shop/wellness-boxes.html",
            image: "assets/images/products/box_1.png",
            imageAlt: "Curated Wellness Boxes"
        },
        {
            title: "Candles & Oils",
            desc: "Event florals, oversized arrangements and more for your next celebration.",
            btnText: "Shop Accessories",
            btnLink: "shop/all-accessories.html",
            image: "assets/images/products/item_5.jpg",
            imageAlt: "Aromatherapy Candles and Oils"
        }
    ]
};

/**
 * Basic text node sanitization to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} - Sanitized string safe for DOM injection
 */
function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

export function init(node, customConfig = {}) {
    const config = { ...defaultConfig, ...customConfig };
    
    // Validate heading to ensure it's a safe string
    const safeHeading = sanitizeHTML(config.heading);

    // Map over the cards array to generate the HTML fragment securely
    const cardsHTML = config.cards.map(card => {
        const safeImage = buildPath(card.image);
        const safeLink = buildPath(card.btnLink);
        
        return `
            <article class="cdlv-category-3-grid__card">
                <div class="cdlv-category-3-grid__image-wrapper">
                    <img src="${sanitizeHTML(safeImage)}" 
                         alt="${sanitizeHTML(card.imageAlt)}" 
                         class="cdlv-category-3-grid__image" 
                         loading="lazy" 
                         decoding="async">
                </div>
                <div class="cdlv-category-3-grid__content">
                    <h3 class="cdlv-category-3-grid__title">${sanitizeHTML(card.title)}</h3>
                    <p class="cdlv-category-3-grid__desc">${sanitizeHTML(card.desc)}</p>
                    <a href="${sanitizeHTML(safeLink)}" class="cdlv-category-3-grid__btn">
                        ${sanitizeHTML(card.btnText)}
                    </a>
                </div>
            </article>
        `;
    }).join('');

    // Inject the fully constructed HTML into the target node.
    // Notice the inclusion of data-image-sync on the wrapper to interface with image-render.js
    node.innerHTML = `
        <section class="cdlv-category-3-grid animate-enter" aria-label="${safeHeading}" data-image-sync>
            <h2 class="cdlv-category-3-grid__heading">${safeHeading}</h2>
            <div class="cdlv-category-3-grid__layout">
                ${cardsHTML}
            </div>
        </section>
    `;
}