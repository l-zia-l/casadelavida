/* ==========================================================================
   MODULE: PRODUCT PAGE (modules/product-page.js)
   Architecture: Exportable ES Module generating a fluid, 2-column e-commerce 
                 interface. Uses event delegation for performance.
   SEO: Semantic heading structures (h1, h2, h3).
   A11y: WCAG Compliant. Screen-reader safe dynamic pricing.
   Security: Strict CSP Compliance (No inline style tags).
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const defaultConfig = {
    title: "The Serenity Wellness Box",
    subtitle: "Organic Matcha, Raw Honey, and Artisan Accessories.",
    images: [],
    composition: "Organic Ceremonial Grade Matcha, Wildflower Raw Honey, White Peony Tea Leaves.",
    bestFor: "Morning rituals, mindfulness practices, or deep focus work sessions.",
    funFact: "Matcha contains L-theanine, an amino acid that promotes relaxed alertness without the caffeine crash.",
    proTip: "Allow your water to cool slightly (to about 175°F) before pouring over matcha to prevent burning the leaves.",
    deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
    sizes: [
        { id: "s1", name: "Grand", desc: "60 Servings", price: 800, subPrice: 560 },
        { id: "s2", name: "Deluxe", desc: "40 Servings", price: 700, subPrice: 490, popular: true, default: true },
        { id: "s3", name: "Original", desc: "20 Servings", price: 600, subPrice: 420 }
    ],
    colors: [],
    subscription: {
        priceText: "GH₵ 1000 + free shipping",
        desc: "Best Value: Up to 30% off. Skip or cancel anytime."
    }
};

const generateOptionsForQuantity = (quantity, config) => {
    let html = '';
    
    for (let i = 1; i <= quantity; i++) {
        html += `<div class="cdlv-product-page__item-config" data-item-index="${i}">`;
        
        if (quantity > 1) {
            html += `<h3 class="cdlv-product-page__item-title">Item ${i} Configuration</h3>`;
        }

        // Generate Sizes
        if (config.sizes && config.sizes.length > 0) {
            html += `<div class="cdlv-product-page__options-grid" role="group" aria-label="Select Size for Item ${i}">`;
            config.sizes.forEach(size => {
                const isSelected = size.default ? 'is-selected' : '';
                const isChecked = size.default ? 'checked' : '';
                const popularBadge = size.popular ? `<span class="cdlv-product-page__popular-badge" aria-hidden="true">Most Popular Size</span>` : '';
                
                html += `
                    <label class="cdlv-product-page__option-box ${isSelected}" data-type="size">
                        ${popularBadge}
                        <input type="radio" name="item_${i}_size" value="${sanitizeText(size.id)}" class="cdlv-product-page__sr-only" ${isChecked}>
                        <div class="cdlv-product-page__price-wrapper">
                            <span class="cdlv-product-page__option-price cdlv-product-page__price-original">
                                <span class="cdlv-product-page__sr-only">Original Price: </span>GH₵ ${sanitizeText(size.price.toString())}
                            </span>
                            ${size.subPrice ? `
                            <span class="cdlv-product-page__option-price cdlv-product-page__price-discount">
                                <span class="cdlv-product-page__sr-only">Subscription Price: </span>GH₵ ${sanitizeText(size.subPrice.toString())}
                            </span>` : ''}
                        </div>
                        <span class="cdlv-product-page__option-name">${sanitizeText(size.name)}</span>
                        <span class="cdlv-product-page__option-desc">${sanitizeText(size.desc)}</span>
                    </label>
                `;
            });
            html += `</div>`;
        }

        // Generate Colors
        if (config.colors && config.colors.length > 0) {
            html += `<div class="cdlv-product-page__options-grid cdlv-product-page__options-grid--colors" role="group" aria-label="Select Color for Item ${i}">`;
            config.colors.forEach(color => {
                const isSelected = color.default ? 'is-selected' : '';
                const isChecked = color.default ? 'checked' : '';
                const resolvedImgPath = buildPath(sanitizeText(color.img));
                html += `
                    <label class="cdlv-product-page__option-box cdlv-product-page__option-box--color ${isSelected}" data-type="color">
                        <input type="radio" name="item_${i}_color" value="${sanitizeText(color.id)}" class="cdlv-product-page__sr-only" ${isChecked}>
                        <img src="${resolvedImgPath}" alt="${sanitizeText(config.title)} in ${sanitizeText(color.name)}" class="cdlv-product-page__option-img u-img-loader u-img-reveal" loading="lazy" decoding="async">
                        <div class="cdlv-product-page__color-text">
                            <span class="cdlv-product-page__option-name">${sanitizeText(color.name)}</span>
                        </div>
                    </label>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
    }
    return html;
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    const mainImgPath = config.images.length > 0 ? buildPath(sanitizeText(config.images[0])) : '';
    
    const moduleHTML = `
        <article class="cdlv-product-page" data-image-sync>
            <h1 class="cdlv-product-page__title-mobile">${sanitizeText(config.title)}</h1>

            <section class="cdlv-product-page__overview" aria-label="Product Gallery and Description">
                <div class="cdlv-product-page__main-img-wrapper u-img-loader">
                    <img id="main-product-image" src="${mainImgPath}" alt="${sanitizeText(config.title)} - Main Product View" class="u-img-reveal" fetchpriority="high" loading="eager" decoding="sync">
                </div>
                
                <div class="cdlv-product-page__slider" role="group" aria-label="Product Image Gallery">
                    ${config.images.map((img, idx) => {
                        const resolvedThumbPath = buildPath(sanitizeText(img));
                        const isCurrent = idx === 0 ? 'aria-current="true"' : 'aria-current="false"';
                        const activeClass = idx === 0 ? 'is-active' : '';
                        
                        return `
                            <button type="button" class="cdlv-product-page__thumb-btn ${activeClass}" 
                                    data-target-src="${resolvedThumbPath}" 
                                    aria-label="View product image ${idx + 1}" 
                                    ${isCurrent}>
                                <img src="${resolvedThumbPath}" alt="" aria-hidden="true" class="u-img-loader u-img-reveal" loading="lazy" decoding="async">
                            </button>
                        `;
                    }).join('')}
                </div>

                <div class="cdlv-product-page__desc">
                    <h2 class="cdlv-product-page__subtitle">${sanitizeText(config.subtitle)}</h2>
                    <ul class="cdlv-product-page__bullet-list" id="desc-list">
                        <li><strong>Ingredients:</strong> ${sanitizeText(config.composition)}</li>
                        <li><strong>Best For:</strong> ${sanitizeText(config.bestFor)}</li>
                        <li><strong>Fun Fact:</strong> ${sanitizeText(config.funFact)}</li>
                        <li><strong>Pro Tip:</strong> ${sanitizeText(config.proTip)}</li>
                    </ul>
                    <button type="button" class="cdlv-product-page__read-more-btn" id="read-more-btn" aria-expanded="false" aria-controls="desc-list">Read More</button>
                    
                    ${config.deliveryCountryMsg ? `
                        <div class="cdlv-product-page__delivery-msg" role="status">
                            ${sanitizeText(config.deliveryCountryMsg)}
                        </div>
                    ` : ''}
                </div>
            </section>

            <section class="cdlv-product-page__details" aria-label="Product Configuration and Checkout">
                <div class="cdlv-product-page__title-desktop" aria-hidden="true">${sanitizeText(config.title)}</div>

                <div class="cdlv-product-page__form-group">
                    <label class="cdlv-product-page__label" for="qty">Quantity</label>
                    <input type="number" id="qty" class="cdlv-product-page__input" value="1" min="1" max="10">
                </div>

                <div id="dynamic-options-container">
                    ${generateOptionsForQuantity(1, config)}
                </div>

                <fieldset class="cdlv-product-page__purchase-fieldset">
                    <legend class="cdlv-product-page__label cdlv-product-page__purchase-legend">Purchasing Options</legend>
                    <div class="cdlv-product-page__purchase-options">
                        <label class="cdlv-product-page__radio-row">
                            <input type="radio" name="purchase_type" value="subscription" id="radio-sub" class="cdlv-product-page__radio-input">
                            <div class="cdlv-product-page__radio-content">
                                <span class="cdlv-product-page__radio-title">Start a Subscription: ${sanitizeText(config.subscription.priceText)}</span>
                                <span class="cdlv-product-page__radio-desc">${sanitizeText(config.subscription.desc)}</span>
                            </div>
                        </label>
                        
                        <label class="cdlv-product-page__radio-row">
                            <input type="radio" name="purchase_type" value="one_time" id="radio-onetime" class="cdlv-product-page__radio-input" checked>
                            <div class="cdlv-product-page__radio-content">
                                <span class="cdlv-product-page__radio-title">One Time Purchase</span>
                            </div>
                        </label>
                    </div>
                </fieldset>

                <div class="cdlv-product-page__submit-wrapper">
                    <button type="button" class="cdlv-product-page__btn" id="add-to-cart-btn">Add to Cart</button>
                </div>
            </section>
        </article>
    `;

    node.innerHTML = moduleHTML;

    // DOM Elements
    const mainWrapper = node.querySelector('.cdlv-product-page');
    const mainImg = node.querySelector('#main-product-image');
    const thumbnails = node.querySelectorAll('.cdlv-product-page__thumb-btn');
    const readMoreBtn = node.querySelector('#read-more-btn');
    const descList = node.querySelector('#desc-list');
    const qtyInput = node.querySelector('#qty');
    const dynamicContainer = node.querySelector('#dynamic-options-container');
    const purchaseRadios = node.querySelectorAll('input[name="purchase_type"]');

    // Dynamic Pricing Subscription Logic
    purchaseRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'subscription') {
                mainWrapper.classList.add('cdlv-product-page--subscription-active');
            } else {
                mainWrapper.classList.remove('cdlv-product-page--subscription-active');
            }
        });
    });

    if (node.querySelector('#radio-sub').checked) {
        mainWrapper.classList.add('cdlv-product-page--subscription-active');
    }

    // Read More Logic with Debounced ResizeObserver
    if (readMoreBtn && descList) {
        const evaluateReadMore = () => {
            const isExpanded = descList.classList.contains('is-expanded');
            const currentMax = descList.style.maxHeight;
            
            descList.style.maxHeight = 'none';
            const trueHeight = descList.scrollHeight;

            if (isExpanded) {
                descList.style.maxHeight = trueHeight + 'px';
                readMoreBtn.style.display = 'inline-block';
                return;
            }

            descList.style.maxHeight = '';
            const constrainedHeight = descList.clientHeight;

            if (trueHeight > constrainedHeight) {
                readMoreBtn.style.display = 'inline-block';
            } else {
                readMoreBtn.style.display = 'none';
            }
        };

        let resizeTimer;
        const resizeObserver = new ResizeObserver(() => {
            if (resizeTimer) cancelAnimationFrame(resizeTimer);
            resizeTimer = requestAnimationFrame(evaluateReadMore);
        });
        resizeObserver.observe(descList);

        readMoreBtn.addEventListener('click', () => {
            const isExpanded = descList.classList.contains('is-expanded');
            
            if (!isExpanded) {
                descList.classList.add('is-expanded');
                descList.style.maxHeight = descList.scrollHeight + 'px';
                readMoreBtn.textContent = 'Read Less';
                readMoreBtn.setAttribute('aria-expanded', 'true');
            } else {
                descList.style.maxHeight = descList.scrollHeight + 'px'; 
                void descList.offsetHeight; 
                descList.classList.remove('is-expanded');
                descList.style.maxHeight = ''; 
                readMoreBtn.textContent = 'Read More';
                readMoreBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Thumbnail logic
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            const targetSrc = e.currentTarget.getAttribute('data-target-src');
            if (!targetSrc || !mainImg) return;

            thumbnails.forEach(t => {
                t.classList.remove('is-active');
                t.setAttribute('aria-current', 'false');
            });
            
            e.currentTarget.classList.add('is-active');
            e.currentTarget.setAttribute('aria-current', 'true');
            
            mainImg.style.opacity = '0.5';
            setTimeout(() => {
                mainImg.src = targetSrc;
                mainImg.style.opacity = '1';
            }, 150);
        });
    });

    if (qtyInput && dynamicContainer) {
        qtyInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) {
                val = 1;
                e.target.value = 1;
            }
            dynamicContainer.innerHTML = generateOptionsForQuantity(val, config);
        });
    }

    if (dynamicContainer) {
        dynamicContainer.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const labelBox = e.target.closest('.cdlv-product-page__option-box');
                const gridContainer = labelBox.closest('.cdlv-product-page__options-grid');
                
                if (gridContainer) {
                    const allLabels = gridContainer.querySelectorAll('.cdlv-product-page__option-box');
                    allLabels.forEach(label => label.classList.remove('is-selected'));
                    labelBox.classList.add('is-selected');
                }
            }
        });
    }
};