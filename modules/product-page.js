/* ==========================================================================
   MODULE: PRODUCT PAGE (modules/product-page.js)
   Architecture: Exportable ES Module generating a fluid, 2-column e-commerce 
                 interface. Uses event delegation for performance.
   Security: Strict text sanitization (DOMPurify-style fallback) on all inputs 
             and data configurations. Prevents XSS via innerHTML. No sensitive 
             data stored locally.
   Dependencies: Expects CSS variables from `globals.css` and scoped styles 
                 from `components.css`. Integrates with global image-render.js 
                 via `data-image-sync`. Uses `utils/path.js` for dynamic routing.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Text Sanitizer to prevent XSS injection.
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Default Configuration (Can be overridden via data-config)
const defaultConfig = {
    title: "The Serenity Wellness Box",
    subtitle: "Organic Matcha, Raw Honey, and Artisan Accessories.",
    images: [],
    ingredients: "Organic Ceremonial Grade Matcha, Wildflower Raw Honey, White Peony Tea Leaves.",
    bestFor: "Morning rituals, mindfulness practices, or deep focus work sessions.",
    funFact: "Matcha contains L-theanine, an amino acid that promotes relaxed alertness without the caffeine crash.",
    proTip: "Allow your water to cool slightly (to about 175°F) before pouring over matcha to prevent burning the leaves.",
    deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
    sizes: [
        { id: "s1", name: "Grand", desc: "60 Servings", price: 125, default: true },
        { id: "s2", name: "Deluxe", desc: "40 Servings", price: 94 },
        { id: "s3", name: "Original", desc: "20 Servings", price: 69 }
    ],
    colors: [],
    subscription: {
        priceText: "GH₵ 66 + free shipping",
        desc: "Best Value: Up to 30% off. Skip or cancel anytime."
    }
};

/**
 * Generates the HTML for the dynamic size and color selections based on quantity.
 */
const generateOptionsForQuantity = (quantity, config) => {
    let html = '';
    
    for (let i = 1; i <= quantity; i++) {
        html += `<div class="cdlv-product-page__item-config" data-item-index="${i}">`;
        
        if (quantity > 1) {
            html += `<h4 class="cdlv-product-page__item-title">Item ${i} Configuration</h4>`;
        }

        // Generate Sizes
        if (config.sizes && config.sizes.length > 0) {
            html += `<div class="cdlv-product-page__options-grid">`;
            config.sizes.forEach(size => {
                const isSelected = size.default ? 'is-selected' : '';
                html += `
                    <div class="cdlv-product-page__option-box ${isSelected}" data-type="size" data-id="${sanitizeText(size.id)}">
                        <span class="cdlv-product-page__option-price">GH₵ ${sanitizeText(size.price.toString())}</span>
                        <span class="cdlv-product-page__option-name">${sanitizeText(size.name)}</span>
                        <span class="cdlv-product-page__option-desc">${sanitizeText(size.desc)}</span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Generate Colors/Accessories
        if (config.colors && config.colors.length > 0) {
            html += `<div class="cdlv-product-page__options-grid">`;
            config.colors.forEach(color => {
                const isSelected = color.default ? 'is-selected' : '';
                const resolvedImgPath = buildPath(sanitizeText(color.img));
                html += `
                    <div class="cdlv-product-page__option-box cdlv-product-page__option-box--color ${isSelected}" data-type="color" data-id="${sanitizeText(color.id)}">
                        <img src="${resolvedImgPath}" alt="${sanitizeText(color.name)}" class="cdlv-product-page__option-img u-img-loader u-img-reveal" loading="lazy">
                        <div class="cdlv-product-page__color-text">
                            <span class="cdlv-product-page__option-name">${sanitizeText(color.name)}</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
    }
    return html;
};

/**
 * Core initialization function.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    const mainImgPath = config.images.length > 0 ? buildPath(sanitizeText(config.images[0])) : '';
    
    const moduleHTML = `
        <div class="cdlv-product-page" data-image-sync>
            <h1 class="cdlv-product-page__title-mobile">${sanitizeText(config.title)}</h1>

            <section class="cdlv-product-page__overview">
                <div class="cdlv-product-page__main-img-wrapper u-img-loader">
                    <img id="main-product-image" src="${mainImgPath}" alt="${sanitizeText(config.title)}" class="u-img-reveal">
                </div>
                
                <div class="cdlv-product-page__slider">
                    ${config.images.map((img, idx) => {
                        const resolvedThumbPath = buildPath(sanitizeText(img));
                        return `
                            <img src="${resolvedThumbPath}" 
                                 alt="Thumbnail ${idx + 1}" 
                                 class="cdlv-product-page__thumb u-img-loader u-img-reveal ${idx === 0 ? 'is-active' : ''}" 
                                 data-target-src="${resolvedThumbPath}">
                        `;
                    }).join('')}
                </div>

                <div class="cdlv-product-page__desc">
                    <div class="cdlv-product-page__subtitle">${sanitizeText(config.subtitle)}</div>
                    <ul class="cdlv-product-page__bullet-list" id="desc-list">
                        <li><strong>Ingredients:</strong> ${sanitizeText(config.ingredients)}</li>
                        <li><strong>Best For:</strong> ${sanitizeText(config.bestFor)}</li>
                        <li><strong>Fun Fact:</strong> ${sanitizeText(config.funFact)}</li>
                        <li><strong>Pro Tip:</strong> ${sanitizeText(config.proTip)}</li>
                    </ul>
                    <button class="cdlv-product-page__read-more-btn" id="read-more-btn">Read More</button>
                    
                    ${config.deliveryCountryMsg ? `
                        <div class="cdlv-product-page__delivery-msg">
                            ${sanitizeText(config.deliveryCountryMsg)}
                        </div>
                    ` : ''}
                </div>
            </section>

            <section class="cdlv-product-page__details">
                <h1 class="cdlv-product-page__title-desktop">${sanitizeText(config.title)}</h1>

                <div class="cdlv-product-page__form-row">
                    <div class="cdlv-product-page__form-group">
                        <label class="cdlv-product-page__label" for="del-date">Delivery Date*</label>
                        <input type="date" id="del-date" class="cdlv-product-page__input">
                    </div>

                    <div class="cdlv-product-page__form-group">
                        <label class="cdlv-product-page__label" for="qty">Quantity</label>
                        <input type="number" id="qty" class="cdlv-product-page__input" value="1" min="1" max="10">
                    </div>
                </div>

                <div id="dynamic-options-container">
                    ${generateOptionsForQuantity(1, config)}
                </div>

                <div class="cdlv-product-page__label">Purchasing Options</div>
                <div class="cdlv-product-page__purchase-options">
                    <label class="cdlv-product-page__radio-row">
                        <input type="radio" name="purchase_type" value="subscription" class="cdlv-product-page__radio-input">
                        <div class="cdlv-product-page__radio-content">
                            <span class="cdlv-product-page__radio-title">Start a Subscription: ${sanitizeText(config.subscription.priceText)}</span>
                            <span class="cdlv-product-page__radio-desc">${sanitizeText(config.subscription.desc)}</span>
                        </div>
                    </label>
                    
                    <label class="cdlv-product-page__radio-row">
                        <input type="radio" name="purchase_type" value="one_time" class="cdlv-product-page__radio-input" checked>
                        <div class="cdlv-product-page__radio-content">
                            <span class="cdlv-product-page__radio-title">One Time Purchase</span>
                        </div>
                    </label>
                </div>

                <div class="cdlv-product-page__submit-wrapper">
                    <button class="cdlv-product-page__btn" id="add-to-cart-btn">Add to Cart</button>
                </div>
            </section>
        </div>
    `;

    node.innerHTML = moduleHTML;

    // 2. DOM Elements & Event Bindings
    const mainImg = node.querySelector('#main-product-image');
    const thumbnails = node.querySelectorAll('.cdlv-product-page__thumb');
    const readMoreBtn = node.querySelector('#read-more-btn');
    const descList = node.querySelector('#desc-list');
    const qtyInput = node.querySelector('#qty');
    const dynamicContainer = node.querySelector('#dynamic-options-container');

    // Bulletproof Read More Logic utilizing ResizeObserver for web font loads
    if (readMoreBtn && descList) {
        const evaluateReadMore = () => {
            const currentMax = descList.style.maxHeight;
            descList.style.maxHeight = 'none';
            const trueHeight = descList.scrollHeight;
            descList.style.maxHeight = currentMax;

            if (trueHeight > 250) {
                readMoreBtn.style.display = 'inline-block';
            } else {
                readMoreBtn.style.display = 'none';
            }
        };

        // ResizeObserver guarantees measurement *after* layout shifts and font loads
        const resizeObserver = new ResizeObserver(() => requestAnimationFrame(evaluateReadMore));
        resizeObserver.observe(descList);

        readMoreBtn.addEventListener('click', () => {
            const isExpanded = descList.classList.toggle('is-expanded');
            readMoreBtn.textContent = isExpanded ? 'Read Less' : 'Read More';
        });
    }

    // Thumbnail click logic
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            const targetSrc = e.currentTarget.getAttribute('data-target-src');
            if (!targetSrc || !mainImg) return;

            thumbnails.forEach(t => t.classList.remove('is-active'));
            e.currentTarget.classList.add('is-active');
            
            mainImg.style.opacity = '0.5';
            setTimeout(() => {
                mainImg.src = targetSrc;
                mainImg.style.opacity = '1';
            }, 150);
        });
    });

    // Dynamic Quantity Re-rendering
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

    // Options Grid Event Delegation 
    if (dynamicContainer) {
        dynamicContainer.addEventListener('click', (e) => {
            const optionBox = e.target.closest('.cdlv-product-page__option-box');
            if (!optionBox) return;

            const gridContainer = optionBox.closest('.cdlv-product-page__options-grid');
            if (gridContainer) {
                const siblings = gridContainer.querySelectorAll('.cdlv-product-page__option-box');
                siblings.forEach(sib => sib.classList.remove('is-selected'));
                optionBox.classList.add('is-selected');
            }
        });
    }
};