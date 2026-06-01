/* ==========================================================================
   MODULE: PRODUCT PAGE ENGINE (modules/product-page.js)
   Architecture: Exportable ES Module driving an isolated 2-column interface.
   Security: Enforces Zero-Trust mapping via centralized product register.
   State Sync: Hydrates from LocalStorage and preserves form selections across updates.
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { addToCart, getCart, updateItemQuantity } from '../utils/cart.js';
import { getProductFromRegistry } from '../utils/inventory.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str.toString();
    return tempDiv.innerHTML;
};

const generateOptionsForQuantity = (quantity, product) => {
    let html = '';
    const hasMultipleSizes = product.sizes && product.sizes.length > 1;
    const hasMultipleColors = product.colors && product.colors.length > 1;
    const hasChoices = hasMultipleSizes || hasMultipleColors;
    
    const iterations = hasChoices ? quantity : 1;
    
    for (let i = 1; i <= iterations; i++) {
        html += `<div class="cdlv-product-page__item-config" data-item-index="${i}">`;
        
        if (iterations > 1) {
            html += `<h3 class="cdlv-product-page__item-title">Item ${i} Configuration</h3>`;
        }

        if (product.sizes && product.sizes.length > 0) {
            html += `<div class="cdlv-product-page__options-grid" role="group" aria-label="Select Size for Item ${i}">`;
            product.sizes.forEach(size => {
                const isSelected = size.default || product.sizes.length === 1 ? 'is-selected' : '';
                const isChecked = size.default || product.sizes.length === 1 ? 'checked' : '';
                const popularBadge = size.popular ? `<span class="cdlv-product-page__popular-badge" aria-hidden="true">Most Popular Size</span>` : '';
                
                const secureSubFactor = product.subscriptionDiscount ? (1 - (product.subscriptionDiscount / 100)) : 0.7;
                const calculatedSubPrice = Math.round(size.price * secureSubFactor);
                
                html += `
                    <label class="cdlv-product-page__option-box ${isSelected}" data-type="size">
                        ${popularBadge}
                        <input type="radio" name="item_${i}_size" value="${sanitizeText(size.id)}" class="cdlv-product-page__sr-only" ${isChecked}>
                        <div class="cdlv-product-page__price-wrapper">
                            <span class="cdlv-product-page__option-price cdlv-product-page__price-original">
                                <span class="cdlv-product-page__sr-only">Original Price: </span>GH₵ ${sanitizeText(size.price.toFixed(2))}
                            </span>
                            <span class="cdlv-product-page__option-price cdlv-product-page__price-discount">
                                <span class="cdlv-product-page__sr-only">Subscription Price: </span>GH₵ ${calculatedSubPrice.toFixed(2)}
                            </span>
                        </div>
                        <span class="cdlv-product-page__option-name">${sanitizeText(size.name)}</span>
                        <span class="cdlv-product-page__option-desc">${sanitizeText(size.desc)}</span>
                    </label>
                `;
            });
            html += `</div>`;
        }

        if (product.colors && product.colors.length > 0) {
            html += `<div class="cdlv-product-page__options-grid cdlv-product-page__options-grid--colors" role="group" aria-label="Select Color for Item ${i}">`;
            product.colors.forEach(color => {
                const isSelected = color.default || product.colors.length === 1 ? 'is-selected' : '';
                const isChecked = color.default || product.colors.length === 1 ? 'checked' : '';
                const resolvedImgPath = buildPath(sanitizeText(color.img));
                
                html += `
                    <label class="cdlv-product-page__option-box cdlv-product-page__option-box--color ${isSelected}" data-type="color">
                        <input type="radio" name="item_${i}_color" value="${sanitizeText(color.id)}" class="cdlv-product-page__sr-only" ${isChecked}>
                        <img src="${resolvedImgPath}" alt="${sanitizeText(product.title)} in ${sanitizeText(color.name)}" class="cdlv-product-page__option-img u-img-loader u-img-reveal" loading="lazy" decoding="async">
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
    if (!customConfig.id) {
        console.error("Architect Exception: Critical initialization block failure. Missing configuration ID declaration token context.", node);
        return;
    }
    
    const product = getProductFromRegistry(customConfig.id);
    const imageryList = product.images || (product.image ? [product.image] : []);
    const mainImgPath = imageryList.length > 0 ? buildPath(sanitizeText(imageryList[0])) : '';
    
    const moduleHTML = `
        <article class="cdlv-product-page" data-image-sync>
            <h1 class="cdlv-product-page__title-mobile">${sanitizeText(product.title)}</h1>

            <section class="cdlv-product-page__overview" aria-label="Product Gallery and Description">
                <div class="cdlv-product-page__main-img-wrapper u-img-loader">
                    <img id="main-product-image" src="${mainImgPath}" alt="${sanitizeText(product.title)} - Main Product View" class="u-img-reveal" fetchpriority="high" loading="eager" decoding="sync">
                </div>
                
                <div class="cdlv-product-page__slider" role="group" aria-label="Product Image Gallery">
                    ${imageryList.map((img, idx) => {
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
                    <h2 class="cdlv-product-page__subtitle">${sanitizeText(product.subtitle)}</h2>
                    <ul class="cdlv-product-page__bullet-list" id="desc-list">
                        <li><strong>Composition:</strong> ${sanitizeText(product.composition)}</li>
                        <li><strong>Best For:</strong> ${sanitizeText(product.bestFor)}</li>
                        <li><strong>Fun Fact:</strong> ${sanitizeText(product.funFact)}</li>
                        <li><strong>Pro Tip:</strong> ${sanitizeText(product.proTip)}</li>
                    </ul>
                    <button type="button" class="cdlv-product-page__read-more-btn" id="read-more-btn" aria-expanded="false" aria-controls="desc-list">Read More</button>
                    
                    ${product.deliveryCountryMsg ? `
                        <div class="cdlv-product-page__delivery-msg" role="status">
                            ${sanitizeText(product.deliveryCountryMsg)}
                        </div>
                    ` : ''}
                </div>
            </section>

            <section class="cdlv-product-page__details" aria-label="Product Configuration and Checkout">
                <div class="cdlv-product-page__title-desktop" aria-hidden="true">${sanitizeText(product.title)}</div>

                <div class="cdlv-product-page__form-group">
                    <label class="cdlv-product-page__label" for="qty">Quantity</label>
                    <div class="cdlv-product-page__qty-wrapper">
                        <button type="button" class="cdlv-product-page__qty-btn" id="qty-minus" aria-label="Decrease quantity">−</button>
                        <input type="number" id="qty" class="cdlv-product-page__qty-input" value="1" min="1" max="10" readonly>
                        <button type="button" class="cdlv-product-page__qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
                    </div>
                </div>

                <div id="dynamic-options-container">
                    ${generateOptionsForQuantity(1, product)}
                </div>

                <fieldset class="cdlv-product-page__purchase-fieldset" ${product.subscriptionDiscount ? '' : 'hidden'}>
                    <legend class="cdlv-product-page__label cdlv-product-page__purchase-legend">Purchasing Options</legend>
                    <div class="cdlv-product-page__purchase-options">
                        <label class="cdlv-product-page__radio-row">
                            <input type="radio" name="purchase_type" value="subscription" id="radio-sub" class="cdlv-product-page__radio-input">
                            <div class="cdlv-product-page__radio-content">
                                <span class="cdlv-product-page__radio-title">Start a Subscription: ${sanitizeText(product.subscription?.priceText || '')}</span>
                                <span class="cdlv-product-page__radio-desc">${sanitizeText(product.subscription?.desc || '')}</span>
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
                    <button type="button" class="cdlv-product-page__btn" id="add-to-cart-btn" ${product.isOutOfStock ? 'disabled aria-disabled="true"' : ''}>
                        ${product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </section>
        </article>
    `;

    node.innerHTML = moduleHTML;

    const mainWrapper = node.querySelector('.cdlv-product-page');
    const mainImg = node.querySelector('#main-product-image');
    const thumbnails = node.querySelectorAll('.cdlv-product-page__thumb-btn');
    const readMoreBtn = node.querySelector('#read-more-btn');
    const descList = node.querySelector('#desc-list');
    const qtyInput = node.querySelector('#qty');
    const btnMinus = node.querySelector('#qty-minus');
    const btnPlus = node.querySelector('#qty-plus');
    const dynamicContainer = node.querySelector('#dynamic-options-container');
    const purchaseRadios = node.querySelectorAll('input[name="purchase_type"]');
    const addToCartBtn = node.querySelector('#add-to-cart-btn');

    let cartState = 'initial'; 
    let sessionAddedItems = new Map();

    // --- ENGINE MODULE: DOM PARAMETER SCRAPER ---
    const scrapeCurrentPageSelections = () => {
        const currentQty = parseInt(qtyInput.value, 10);
        const selections = [];
        for (let i = 1; i <= currentQty; i++) {
            const sizeRadio = node.querySelector(`input[name="item_${i}_size"]:checked`);
            const colorRadio = node.querySelector(`input[name="item_${i}_color"]:checked`);
            selections.push({
                size: sizeRadio ? sizeRadio.value : null,
                color: colorRadio ? colorRadio.value : null
            });
        }
        return selections;
    };

    // --- ENGINE MODULE: INPUT CONFIG RE-APPLYER ---
    const applySelectionsToDOM = (selections) => {
        selections.forEach((selection, idx) => {
            const i = idx + 1;
            if (selection.size) {
                const targetRadio = node.querySelector(`input[name="item_${i}_size"][value="${selection.size}"]`);
                if (targetRadio) {
                    targetRadio.checked = true;
                    const container = targetRadio.closest('.cdlv-product-page__options-grid');
                    if (container) {
                        container.querySelectorAll('.cdlv-product-page__option-box').forEach(l => l.classList.remove('is-selected'));
                        targetRadio.closest('.cdlv-product-page__option-box')?.classList.add('is-selected');
                    }
                }
            }
            if (selection.color) {
                const targetRadio = node.querySelector(`input[name="item_${i}_color"][value="${selection.color}"]`);
                if (targetRadio) {
                    targetRadio.checked = true;
                    const container = targetRadio.closest('.cdlv-product-page__options-grid');
                    if (container) {
                        container.querySelectorAll('.cdlv-product-page__option-box').forEach(l => l.classList.remove('is-selected'));
                        targetRadio.closest('.cdlv-product-page__option-box')?.classList.add('is-selected');
                    }
                }
            }
        });
    };

    // --- ENGINE MODULE: LIVE HYDRATION SYSTEM ---
    const hydrateFromExistingCart = () => {
        const activeCart = getCart();
        const existingItems = activeCart.filter(item => item.product_id === product.id);
        
        if (existingItems.length > 0) {
            cartState = 'added';
            addToCartBtn.textContent = 'Save Changes';
            addToCartBtn.classList.add('is-success');
            
            qtyInput.value = existingItems.length;
            dynamicContainer.innerHTML = generateOptionsForQuantity(existingItems.length, product);
            
            const structuredSelections = existingItems.map(item => ({
                size: item.size,
                color: item.color
            }));
            applySelectionsToDOM(structuredSelections);
            
            // Seed our memory tracker with these IDs so editing them re-evaluates properly
            existingItems.forEach((item, index) => {
                sessionAddedItems.set(index + 1, item.id);
                if (item.isSubscription) {
                    const subRadio = node.querySelector('#radio-sub');
                    if (subRadio) subRadio.checked = true;
                    mainWrapper.classList.add('cdlv-product-page--subscription-active');
                }
            });
        }
    };

    const markAsModified = () => {
        if (cartState === 'added' || cartState === 'saved') {
            cartState = 'modified';
            addToCartBtn.textContent = 'Save Changes';
            addToCartBtn.classList.remove('is-success');
        }
    };

    if (addToCartBtn && !product.isOutOfStock) {
        addToCartBtn.addEventListener('click', () => {
            if (cartState === 'initial' || cartState === 'modified') {
                const isSubscription = node.querySelector('#radio-sub')?.checked || false;
                const quantity = parseInt(qtyInput.value, 10);
                
                // Remove older configuration slots from global browser state cleanly
                sessionAddedItems.forEach((oldId) => {
                    const currentCart = getCart();
                    const existingItem = currentCart.find(c => c.id === oldId);
                    if (existingItem) {
                        updateItemQuantity(oldId, existingItem.quantity - 1);
                    }
                });
                sessionAddedItems.clear();

                for (let i = 1; i <= quantity; i++) {
                    const sizeRadio = node.querySelector(`input[name="item_${i}_size"]:checked`);
                    const colorRadio = node.querySelector(`input[name="item_${i}_color"]:checked`);
                    
                    const selectedSizeId = sizeRadio ? sizeRadio.value : (product.sizes?.[0]?.id || 's1');
                    const selectedColorId = colorRadio ? colorRadio.value : null;
                    
                    const sizeObj = product.sizes?.find(s => s.id === selectedSizeId) || { price: 0, name: 'Standard' };
                    const colorObj = product.colors?.find(c => c.id === selectedColorId);
                    
                    let finalPrice = sizeObj.price;
                    if (isSubscription && product.subscriptionDiscount) {
                        const factor = 1 - (product.subscriptionDiscount / 100);
                        finalPrice = Math.round(finalPrice * factor);
                    }

                    const generatedId = `${product.id}_${selectedSizeId}_${selectedColorId || 'none'}_${isSubscription ? 'sub' : 'one'}`;

                    const cartItem = {
                        id: generatedId,
                        product_id: product.id,
                        name: product.title,
                        size: selectedSizeId,
                        color: selectedColorId,
                        isSubscription: isSubscription,
                        price: finalPrice, 
                        quantity: 1, 
                        maxStock: product.maxStock || 10,
                        image: colorObj ? colorObj.img : product.image,
                        url: window.location.pathname
                    };
                    
                    addToCart(cartItem);
                    sessionAddedItems.set(i, generatedId);
                }

                cartState = 'saved';
                addToCartBtn.textContent = 'Saved';
                addToCartBtn.classList.add('is-success');
            }
        });
    }

    if (qtyInput && btnMinus && btnPlus) {
        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10);
            if (val > 1) {
                const savedSelections = scrapeCurrentPageSelections(); // Save choices
                qtyInput.value = val - 1;
                
                dynamicContainer.innerHTML = generateOptionsForQuantity(val - 1, product);
                applySelectionsToDOM(savedSelections.slice(0, val - 1)); // Restore choices
                markAsModified();
            }
        });

        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value, 10);
            if (val < parseInt(qtyInput.max, 10)) {
                const savedSelections = scrapeCurrentPageSelections(); // Save choices
                qtyInput.value = val + 1;
                
                dynamicContainer.innerHTML = generateOptionsForQuantity(val + 1, product);
                applySelectionsToDOM(savedSelections); // Restore choices for older forms seamlessly
                markAsModified();
            }
        });
    }

    purchaseRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'subscription') {
                mainWrapper.classList.add('cdlv-product-page--subscription-active');
            } else {
                mainWrapper.classList.remove('cdlv-product-page--subscription-active');
            }
            markAsModified();
        });
    });

    if (readMoreBtn && descList) {
        const evaluateReadMore = () => {
            const isExpanded = descList.classList.contains('is-expanded');
            descList.style.maxHeight = 'none';
            const trueHeight = descList.scrollHeight;

            if (isExpanded) {
                descList.style.maxHeight = trueHeight + 'px';
                readMoreBtn.style.display = 'inline-block';
                return;
            }

            descList.style.maxHeight = '';
            if (trueHeight > descList.clientHeight) {
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

    if (dynamicContainer) {
        dynamicContainer.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const labelBox = e.target.closest('.cdlv-product-page__option-box');
                const gridContainer = labelBox.closest('.cdlv-product-page__options-grid');
                if (gridContainer) {
                    gridContainer.querySelectorAll('.cdlv-product-page__option-box').forEach(l => l.classList.remove('is-selected'));
                    labelBox.classList.add('is-selected');
                }
                markAsModified();
            }
        });
    }

    // Run active lookups immediately upon node initialization to synchronize configurations
    hydrateFromExistingCart();
};