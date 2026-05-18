/* ==========================================================================
   MODULE: catalog-slider.js
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
            title: 'Premium Herbal Infusion',
            image: 'assets/images/products/item_2.2.1.jpg',
            alt: 'The Premium Tea Leaves',
            actionLink: 'shop/products/premium-herbal-infusion.html'
        },
        {
            title: 'Honey Infused Tumeric',
            image: 'assets/images/products/item_1.jpg',
            alt: 'Glass jar of creamy tumeric paste and black paper',
            actionLink: 'shop/products/honey-infused-tumeric.html'
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

    // 1. Generate Product Cards (SEO Optimized)
    const cardsHTML = products.map((product) => {
        const safeImage = buildPath(product.image);
        const safeProductLink = buildPath(product.actionLink || config.ctaLink);
        
        const imageLoadingStrategy = 'loading="eager" decoding="sync"';
        
        return `
            <article class="cdlv-catalog-slider__card">
                <a href="${sanitizeHTML(safeProductLink)}" class="cdlv-catalog-slider__image-box img-hover-scale" tabindex="-1" aria-hidden="true">
                    <img src="${sanitizeHTML(safeImage)}" 
                         alt="${sanitizeHTML(product.alt)}" 
                         ${imageLoadingStrategy}>
                </a>
                <div class="cdlv-catalog-slider__info">
                    <h3 class="cdlv-catalog-slider__product-title">
                        <a href="${sanitizeHTML(safeProductLink)}">${sanitizeHTML(product.title)}</a>
                    </h3>
                </div>
            </article>
        `;
    }).join('');

    // 2. Build the full module HTML (Semantic HTML5 & Synchronized Image Reveal)
    const html = `
        <section class="cdlv-catalog-slider animate-enter" aria-label="${sanitizeHTML(config.heading)}" data-image-sync>
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
        </section>
    `;

    node.innerHTML = html;

    // 3. Attach Interaction Logic
    const track = node.querySelector('.cdlv-catalog-slider__track');
    const prevBtn = node.querySelector('.cdlv-catalog-slider__arrow--prev');
    const nextBtn = node.querySelector('.cdlv-catalog-slider__arrow--next');

    if (!track || !prevBtn || !nextBtn) return;

    // Calculate dynamic scroll distance
    const getScrollAmount = () => {
        const card = track.querySelector('.cdlv-catalog-slider__card');
        if (!card) return 0;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return card.offsetWidth + gap;
    };

    // DOM Update Logic
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

    // Performance Optimization: Lock DOM updates to screen refresh rate
    let ticking = false;
    const onScrollOrResize = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateArrows();
                ticking = false;
            });
            ticking = true;
        }
    };

    // Event Listeners
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    // Use the rAF-optimized handler
    track.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    
    // Initial UI sync
    updateArrows();

}