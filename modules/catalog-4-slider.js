/* ==========================================================================
   MODULE: catalog-4-slider.js
   Purpose: Injects a 4-column fluid product slider with distinct card elements.
   Architecture: ES Module, Dynamic DOM Injection based on data attributes.
   Security/A11y: Strict HTML Sanitization, safe paths, ARIA compliant, 
   dynamic focus management.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const defaultConfig = {
    heading: 'Core Offerings',
    ctaText: 'Shop All',
    ctaLink: 'shop.html',
    products: [
        {
            title: 'The Fertility Wellness Box',
            image: 'assets/images/products/box_1.png',
            alt: 'Fertility Wellness Box packaged in premium materials',
            actionLink: 'shop/packages/fertility-wellness-box.html'
        },
        {
            title: 'Premium Tea Leaves',
            image: 'assets/images/products/item_2.2.1.jpg',
            alt: 'The Premium Tea Leaves',
            actionLink: 'shop/products/premium-tea-leaves.html'
        },
        {
            title: 'Creamy Tumeric Paste',
            image: 'assets/images/products/item_1.jpg',
            alt: 'Glass jar of creamy tumeric paste and black paper',
            actionLink: 'shop/products/creamy-tumeric-paste.html'
        },
        {
            title: 'Organic Honey',
            image: 'assets/images/products/item_4.jpg',
            alt: 'Premium organic honey',
            actionLink: 'shop/products/organic-honey.html'
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
    const products = customConfig.products || config.products;
    const safeCtaLink = buildPath(config.ctaLink);

    // 1. Generate Product Cards
    const cardsHTML = products.map(product => {
        const safeImage = buildPath(product.image);
        const safeProductLink = buildPath(product.actionLink || config.ctaLink);
        
        return `
            <article class="cdlv-catalog-slider__card">
                <a href="${sanitizeHTML(safeProductLink)}" class="cdlv-catalog-slider__image-box img-hover-scale" aria-label="View ${sanitizeHTML(product.title)}">
                    <img src="${sanitizeHTML(safeImage)}" 
                         alt="${sanitizeHTML(product.alt)}" 
                         decoding="async">
                </a>
                <div class="cdlv-catalog-slider__info">
                    <h3 class="cdlv-catalog-slider__product-title">${sanitizeHTML(product.title)}</h3>
                </div>
            </article>
        `;
    }).join('');

    // 2. Build the full module HTML
    const html = `
        <div class="cdlv-catalog-slider animate-enter">
            <header class="cdlv-catalog-slider__header">
                <h2 class="cdlv-catalog-slider__title">${sanitizeHTML(config.heading)}</h2>
            </header>
            
            <div class="cdlv-catalog-slider__carousel-wrapper">
                <button class="cdlv-catalog-slider__arrow cdlv-catalog-slider__arrow--prev" aria-label="Slide to previous items" type="button" disabled>
                    <svg class="cdlv-catalog-slider__arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M15 18l-6-6 6-6" stroke-linecap="square" stroke-linejoin="miter"/>
                    </svg>
                </button>
                
                <div class="cdlv-catalog-slider__track" role="region" aria-label="Product Slider Track" tabindex="0">
                    ${cardsHTML}
                </div>
                
                <button class="cdlv-catalog-slider__arrow cdlv-catalog-slider__arrow--next" aria-label="Slide to next items" type="button">
                    <svg class="cdlv-catalog-slider__arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 18l6-6-6-6" stroke-linecap="square" stroke-linejoin="miter"/>
                    </svg>
                </button>
            </div>

            <footer class="cdlv-catalog-slider__footer">
                <a href="${sanitizeHTML(safeCtaLink)}" class="cdlv-catalog-slider__shop-all">
                    ${sanitizeHTML(config.ctaText)}
                </a>
            </footer>
        </div>
    `;

    node.innerHTML = html;

    // 3. Attach Interaction Logic
    const track = node.querySelector('.cdlv-catalog-slider__track');
    const prevBtn = node.querySelector('.cdlv-catalog-slider__arrow--prev');
    const nextBtn = node.querySelector('.cdlv-catalog-slider__arrow--next');

    if (!track || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
        const card = track.querySelector('.cdlv-catalog-slider__card');
        if (!card) return 0;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.offsetWidth + gap;
    };

    // Toggle arrow visibility and native HTML disabled state (handles focus & clicks)
    const updateArrows = () => {
        const scrollLeft = Math.ceil(track.scrollLeft);
        const maxScroll = Math.floor(track.scrollWidth - track.clientWidth);
        
        if (scrollLeft > 5) {
            prevBtn.style.opacity = '1';
            prevBtn.disabled = false;
        } else {
            prevBtn.style.opacity = '0';
            prevBtn.disabled = true;
        }

        if (scrollLeft < maxScroll - 5) {
            nextBtn.style.opacity = '1';
            nextBtn.disabled = false;
        } else {
            nextBtn.style.opacity = '0';
            nextBtn.disabled = true;
        }
    };

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateArrows, { passive: true });
    
    // Initial UI sync
    updateArrows();
    window.addEventListener('resize', updateArrows, { passive: true });
}