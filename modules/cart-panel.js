/* ==========================================================================
   MODULE: CART PANEL ENGINE & CHECKOUT FLOW (modules/cart-panel.js)
   Architecture: Exportable Reactive View Engine with Native State Scrapes.
   Security: Cross-verifies database identifiers cleanly against central registry.
   Data Design: Processes dynamic granular properties (size, color, flags).
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { getCart, updateItemQuantity, removeFromCart, clearCart } from '../utils/cart.js';
import { getProductFromRegistry } from '../utils/inventory.js';
import { dispatchOrderToDatabase } from '../utils/database.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str.toString();
    return tempDiv.innerHTML;
}; 

// Application Runtime State Machine
let cartState = {
    currentStep: 'Cart',
    paymentMethod: 'test_momo',
    shippingDetails: { 
        firstName: '', lastName: '', email: '', phone: '', 
        address: '', city: '', region: '', landmark: '', notes: '' 
    },
    paymentDetails: {
        testNumber: '' 
    },
    items: getCart(),
    shippingRate: 35.00
};

// --- BACKEND SIMULATOR ---
const simulateBackendCall = () => new Promise(resolve => setTimeout(resolve, 800));

// --- DATA PRESERVATION ENGINE ---
const saveFormState = (node) => {
    if (cartState.currentStep === 'Shipping & Details') {
        cartState.shippingDetails = {
            firstName: node.querySelector('#first-name')?.value || '',
            lastName: node.querySelector('#last-name')?.value || '',
            email: node.querySelector('#email')?.value || '',
            phone: node.querySelector('#phone')?.value || '',
            address: node.querySelector('#address')?.value || '',
            city: node.querySelector('#city')?.value || '',
            region: node.querySelector('#region')?.value || '',
            landmark: node.querySelector('#landmark')?.value || '',
            notes: node.querySelector('#delivery-notes')?.value || ''
        };
    } else if (cartState.currentStep === 'Payment Info') {
        cartState.paymentDetails.testNumber = node.querySelector('#test-payment-number')?.value || '';
    }
};

const renderTabbedProgress = (activeStep) => {
    const steps = ['Cart', 'Shipping & Details', 'Payment Info', 'Review'];
    return `
        <nav class="cdlv-checkout-nav" aria-label="Checkout Progress">
            <ul class="cdlv-checkout-nav__list">
                ${steps.map((step) => {
                    const isActive = step === activeStep;
                    return `
                        <li class="cdlv-checkout-nav__item ${isActive ? 'is-active' : ''}">
                            <button type="button" class="cdlv-checkout-nav__btn" aria-current="${isActive ? 'step' : 'false'}" ${!isActive ? 'disabled' : ''}>
                                ${sanitizeText(step)}
                            </button>
                        </li>
                    `;
                }).join('')}
            </ul>
        </nav>
    `;
};

const renderEmptyState = () => `
    <div class="cdlv-cart-panel__empty">
        <h2 class="cdlv-cart-panel__empty-title">Your Cart is Empty</h2>
        <p class="cdlv-cart-panel__empty-desc">Nurture yourself by filling it with items from our collection.</p>
        <a href="${buildPath('shop.html')}" class="cdlv-cart-panel__empty-btn">Explore Shop</a>
    </div>
`;

const renderCartItems = () => {
    return cartState.items.map(item => {
        const productRegistryRef = getProductFromRegistry(item.product_id);
        const matchedSize = productRegistryRef.sizes?.find(s => s.id === item.size);
        const matchedColor = productRegistryRef.colors?.find(c => c.id === item.color);

        const displayName = productRegistryRef.title || item.name;
        const sizeLabel = matchedSize ? matchedSize.name : 'Standard';
        const colorLabel = matchedColor ? ` - ${matchedColor.name}` : '';
        const subscriptionLabel = item.isSubscription ? ' (Subscription Cycle)' : '';
        const completeVariantString = `${sizeLabel}${colorLabel}${subscriptionLabel}`;
        
        const displayImage = matchedColor ? matchedColor.img : (productRegistryRef.image || item.image);

        return `
            <article class="cdlv-cart-item" data-id="${sanitizeText(item.id)}">
                <a href="${buildPath(productRegistryRef.link || 'shop.html')}" class="cdlv-cart-item__image-wrap u-img-loader" aria-label="View ${sanitizeText(displayName)}">
                    <img src="${buildPath(displayImage)}" alt="${sanitizeText(displayName)}" class="cdlv-cart-item__image" loading="lazy" decoding="async">
                </a>
                
                <div class="cdlv-cart-item__details">
                    <a href="${buildPath(productRegistryRef.link || 'shop.html')}" class="cdlv-cart-item__title-link">
                        <h3 class="cdlv-cart-item__title">${sanitizeText(displayName)}</h3>
                    </a>
                    <p class="cdlv-cart-item__variant">${sanitizeText(completeVariantString)}</p>
                    
                    <div class="cdlv-cart-item__text-actions">
                        <a href="${buildPath(productRegistryRef.link || 'shop.html')}" class="cdlv-cart-item__action-link">Edit Item</a>
                        <button type="button" class="cdlv-cart-item__remove" data-action="remove">Remove</button>
                    </div>
                </div>

                <div class="cdlv-cart-item__actions">
                    <div class="cdlv-cart-item__qty-control">
                        <button type="button" class="cdlv-cart-item__qty-btn" data-action="decrease" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span class="cdlv-cart-item__qty-value" data-target="qty">${sanitizeText(item.quantity)}</span>
                        <button type="button" class="cdlv-cart-item__qty-btn" data-action="increase" aria-label="Increase quantity" ${item.quantity >= item.maxStock ? 'disabled' : ''}>
                            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                    <span class="cdlv-cart-item__stock-warning" data-target="warning" ${item.quantity >= item.maxStock ? '' : 'hidden'}>Only ${sanitizeText(item.maxStock)} left in stock.</span>
                </div>

                <div class="cdlv-cart-item__price" data-target="item-price">
                    ₵${sanitizeText((item.price * item.quantity).toFixed(2))}
                </div>
            </article>
        `;
    }).join('');
};

const renderSummary = () => {
    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartState.shippingRate;

    return `
        <aside class="cdlv-cart-summary" aria-live="polite" aria-atomic="true">
            <h3 class="cdlv-cart-summary__title">Order Summary</h3>
            <div class="cdlv-cart-summary__row">
                <span>Subtotal</span>
                <span data-target="subtotal">₵${sanitizeText(subtotal.toFixed(2))}</span>
            </div>
            <div class="cdlv-cart-summary__row">
                <span>Estimated Shipping</span>
                <span>₵${sanitizeText(cartState.shippingRate.toFixed(2))}</span>
            </div>
            <hr class="cdlv-cart-summary__divider">
            <div class="cdlv-cart-summary__row cdlv-cart-summary__row--total">
                <span>Total</span>
                <span data-target="total">₵${sanitizeText(total.toFixed(2))}</span>
            </div>
        </aside>
    `;
};

const renderDetailedSummary = () => {
    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartState.shippingRate;
    const itemsList = cartState.items.map(item => {
        const referenceDef = getProductFromRegistry(item.product_id);
        const matchedSize = referenceDef.sizes?.find(s => s.id === item.size);
        const matchedColor = referenceDef.colors?.find(c => c.id === item.color);
        const variantText = [matchedSize?.name, matchedColor?.name].filter(Boolean).join(' - ');
        const variantHtml = variantText ? `<div class="cdlv-cart-summary__item-variant">${sanitizeText(variantText)}</div>` : '';

        return `
            <div class="cdlv-cart-summary__item-row cdlv-cart-summary__item-row--wrap">
                <div class="cdlv-cart-summary__item-info">
                    <span class="cdlv-cart-summary__item-name">${sanitizeText(item.quantity)}x ${sanitizeText(referenceDef.title || item.name)}</span>
                    ${variantHtml}
                </div>
                <span class="cdlv-cart-summary__item-price">₵${sanitizeText((item.price * item.quantity).toFixed(2))}</span>
            </div>
        `;
    }).join('');

    return `
        <aside class="cdlv-cart-summary">
            <h3 class="cdlv-cart-summary__title">Order Summary</h3>
            <div class="cdlv-cart-summary__items">${itemsList}</div>
            <hr class="cdlv-cart-summary__divider">
            <div class="cdlv-cart-summary__row">
                <span>Subtotal</span><span>₵${sanitizeText(subtotal.toFixed(2))}</span>
            </div>
            <div class="cdlv-cart-summary__row">
                <span>Estimated Shipping</span><span>₵${sanitizeText(cartState.shippingRate.toFixed(2))}</span>
            </div>
            <hr class="cdlv-cart-summary__divider">
            <div class="cdlv-cart-summary__row cdlv-cart-summary__row--total">
                <span>Total</span><span>₵${sanitizeText(total.toFixed(2))}</span>
            </div>
        </aside>
    `;
};

const showNotification = (type, message) => {
    const existing = document.querySelector('.cdlv-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `cdlv-notification cdlv-notification--${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="cdlv-notification__content">
            <p>${sanitizeText(message)}</p>
            <button type="button" class="cdlv-notification__close" aria-label="Close alert">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.classList.add('is-visible'));

    notification.querySelector('.cdlv-notification__close').addEventListener('click', () => {
        notification.classList.remove('is-visible');
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('is-visible');
            setTimeout(() => notification.remove(), 300);
        }
    }, 6000);
};

// --- SUCCESS VIEW ---
const renderSuccessView = () => `
    <div class="cdlv-cart-panel__empty">
        <svg aria-hidden="true" focusable="false" class="cdlv-cart-panel__empty-icon cdlv-cart-panel__success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 class="cdlv-cart-panel__empty-title">Order Placed Successfully.</h2>
        <p class="cdlv-cart-panel__success-desc">
            Take a deep breath. You've taken a wonderful step toward nurturing your body, mind, and daily moments of calm.
        </p>
        <p class="cdlv-cart-panel__success-note">
            Your receipt will be emailed to you shortly with your order details. Thank you.
        </p>
        <a href="${buildPath('index.html')}" class="cdlv-cart-panel__empty-btn">Return to Homepage</a>
    </div>
`;

const renderCartView = () => `
    <div class="cdlv-cart-panel__layout cdlv-cart-panel__layout--wrap">
        <div class="cdlv-cart-panel__list cdlv-cart-panel__main-area">
            <div class="cdlv-cart-panel__list-header">
                <h2>Review Your Items</h2>
                <span data-target="item-count">${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}</span>
            </div>
            <div class="cdlv-cart-panel__items-container">
                ${renderCartItems()}
            </div>
        </div>
        <div class="cdlv-cart-panel__sidebar cdlv-cart-panel__side-area">
            ${renderSummary()}
        </div>
        <div class="cdlv-cart-summary__cta-wrapper cdlv-cart-panel__action-area">
            <button type="button" class="cdlv-cart-summary__checkout-btn" data-action="checkout">Secure Checkout</button>
            <div class="cdlv-cart-summary__trust-signals cdlv-review-back-wrapper--margin">
                <span class="cdlv-cart-summary__trust-item">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Secure Payment
                </span>
                <span class="cdlv-cart-summary__trust-item">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Fast Local Delivery
                </span>
            </div>
        </div>
    </div>
`;

const renderShippingForm = () => {
    const s = cartState.shippingDetails;
    return `
    <div class="cdlv-cart-panel__layout cdlv-cart-panel__layout--wrap">
        <section class="cdlv-shipping-form cdlv-cart-panel__main-area">
            <h2 class="cdlv-shipping-form__title" tabindex="-1">Shipping & Personal Details</h2>
            <form id="shipping-details-form" class="cdlv-shipping-form__grid">
                <div class="cdlv-form-group">
                    <label for="first-name">First Name *</label>
                    <input type="text" id="first-name" value="${sanitizeText(s.firstName)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="last-name">Last Name *</label>
                    <input type="text" id="last-name" value="${sanitizeText(s.lastName)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" value="${sanitizeText(s.email)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="phone">Phone Number *</label>
                    <input type="tel" id="phone" value="${sanitizeText(s.phone)}" placeholder="024 123 4567" required aria-required="true">
                </div>
                
                <hr class="cdlv-shipping-form__divider">

                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="address">Delivery Address *</label>
                    <input type="text" id="address" value="${sanitizeText(s.address)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="city">City *</label>
                    <select id="city" required aria-required="true">
                        <option value="">Select City</option>
                        <option value="accra" ${s.city === 'accra' ? 'selected' : ''}>Accra</option>
                        <option value="tamale" ${s.city === 'tamale' ? 'selected' : ''}>Tamale</option>
                    </select>
                </div>
                <div class="cdlv-form-group">
                    <label for="region">Region *</label>
                    <input type="text" id="region" value="${sanitizeText(s.region)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="landmark">Landmark (e.g., Near the blue gate) *</label>
                    <input type="text" id="landmark" value="${sanitizeText(s.landmark)}" required aria-required="true">
                </div>
                
                <div class="cdlv-form-group cdlv-form-group--full">
                    <div class="cdlv-form-group__header">
                        <label for="delivery-notes">Special Delivery Instructions</label>
                        <small class="cdlv-form-word-count" data-target="word-count">0 / 100 words</small>
                    </div>
                    <textarea id="delivery-notes" data-target="notes" rows="3" placeholder="e.g., Please leave at the gate...">${sanitizeText(s.notes)}</textarea>
                </div>
            </form>
        </section>
        
        <div class="cdlv-cart-panel__sidebar cdlv-cart-panel__side-area">
            ${renderDetailedSummary()}
        </div>

        <div class="cdlv-shipping-form__actions cdlv-form-group--full cdlv-cart-panel__action-area">
            <button type="button" class="cdlv-shipping-form__back" data-action="back-to-cart">Back to Cart</button>
            <button type="submit" form="shipping-details-form" class="cdlv-shipping-form__submit">Continue to Payment</button>
        </div>
    </div>
    `;
};

const renderPaymentForm = () => {
    const p = cartState.paymentDetails;
    return `
        <div class="cdlv-cart-panel__layout cdlv-cart-panel__layout--wrap">
            <section class="cdlv-shipping-form cdlv-cart-panel__main-area">
                <h2 class="cdlv-shipping-form__title" tabindex="-1">Payment Information</h2>
                <p class="cdlv-shipping-form__desc">
                    In the future, the secure payment API will trigger here. For testing, please supply a reference number.
                </p>
                
                <form id="payment-details-form" class="cdlv-shipping-form__grid">
                    <div class="cdlv-payment-fields cdlv-payment-fields--full">
                        <div class="cdlv-form-group cdlv-form-group--full">
                            <label for="test-payment-number">Test Payment Number *</label>
                            <input type="text" id="test-payment-number" value="${sanitizeText(p.testNumber)}" placeholder="Enter test number..." required aria-required="true">
                        </div>
                    </div>
                </form>
            </section>
            
            <div class="cdlv-cart-panel__sidebar cdlv-cart-panel__side-area">
                ${renderDetailedSummary()} 
            </div>

            <div class="cdlv-shipping-form__actions cdlv-form-group--full cdlv-cart-panel__action-area">
                <button type="button" class="cdlv-shipping-form__back" data-action="back-to-shipping">Back to Shipping</button>
                <button type="submit" form="payment-details-form" class="cdlv-shipping-form__submit">Review Order</button>
            </div>
        </div>
    `;
};

const renderReviewView = () => {
    const s = cartState.shippingDetails;
    const fullName = `${s.firstName} ${s.lastName}`.trim() || 'No name provided';
    
    return `
        <div class="cdlv-cart-panel__layout cdlv-cart-panel__layout--wrap">
            <section class="cdlv-shipping-form cdlv-cart-panel__main-area">
                <h2 class="cdlv-shipping-form__title" tabindex="-1">Review & Confirm</h2>
                
                <div class="cdlv-review-grid">
                    <article class="cdlv-review-card">
                        <div class="cdlv-review-card__header">
                            <h3>Shipping To</h3>
                            <button type="button" class="cdlv-review-edit" data-action="edit-shipping">Edit</button>
                        </div>
                        <p><strong>${sanitizeText(fullName)}</strong></p>
                        <p>${sanitizeText(s.address || 'No address provided')}</p>
                        <p>${sanitizeText(s.city || '')}, ${sanitizeText(s.region || '')}</p>
                        <p>${sanitizeText(s.phone || '')}</p>
                    </article>
                    
                    <article class="cdlv-review-card">
                        <div class="cdlv-review-card__header">
                            <h3>Payment Method</h3>
                            <button type="button" class="cdlv-review-edit" data-action="edit-payment">Edit</button>
                        </div>
                        <p><strong>Test API Checkout</strong></p>
                        <p class="cdlv-review-card__note">Reference: ${sanitizeText(cartState.paymentDetails.testNumber)}</p>
                    </article>
                </div>

                <form id="place-order-form">
                    <div class="cdlv-review-terms cdlv-review-terms--margin">
                        <input type="checkbox" id="terms-agree" required aria-required="true">
                        <label for="terms-agree">I agree to the <a href="${buildPath('legal/terms-of-service.html')}" target="_blank">Terms of Service</a> and <a href="${buildPath('legal/privacy-policy.html')}" target="_blank">Privacy Policy</a>.</label>
                    </div>
                </form>
            </section>
            
            <div class="cdlv-cart-panel__sidebar cdlv-cart-panel__side-area">
                ${renderDetailedSummary()}
            </div>

            <div class="cdlv-review-actions cdlv-cart-panel__action-area">
                <button type="submit" form="place-order-form" class="cdlv-review-submit">Place Order</button>
                <div class="cdlv-review-back-wrapper cdlv-review-back-wrapper--margin">
                    <button type="button" class="cdlv-shipping-form__back" data-action="back-to-payment">Back to Payment</button>
                </div>
            </div>
        </div>
    `;
};

const updateView = (node, pushHistory = true) => {
    if (cartState.items.length === 0 && cartState.currentStep !== 'Success') {
        node.innerHTML = renderEmptyState();
        return;
    }

    let viewContent = '';
    if (cartState.currentStep === 'Cart') {
        viewContent = renderCartView();
    } else if (cartState.currentStep === 'Shipping & Details') {
        viewContent = renderShippingForm(); 
    } else if (cartState.currentStep === 'Payment Info') {
        viewContent = renderPaymentForm();
    } else if (cartState.currentStep === 'Review') {
        viewContent = renderReviewView();
    } else if (cartState.currentStep === 'Success') {
        viewContent = renderSuccessView();
    }

    const progressHTML = cartState.currentStep === 'Success' ? '' : renderTabbedProgress(cartState.currentStep);

    node.innerHTML = `
        ${progressHTML}
        ${viewContent}
    `;

    if (pushHistory) {
        const url = new URL(window.location);
        url.searchParams.set('step', cartState.currentStep.replace(/\s+/g, '-').toLowerCase());
        window.history.pushState({ checkoutStep: cartState.currentStep }, '', url);
    }

    if (cartState.currentStep !== 'Cart') {
        const titleNode = node.querySelector('h2');
        if (titleNode) {
            if (!titleNode.hasAttribute('tabindex')) {
                titleNode.setAttribute('tabindex', '-1');
            }
            titleNode.focus();
        }
    }
};

const updateFinancials = (node) => {
    const subtotalNode = node.querySelector('[data-target="subtotal"]');
    const totalNode = node.querySelector('[data-target="total"]');
    if (!subtotalNode || !totalNode) return;

    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartState.shippingRate;

    subtotalNode.textContent = `₵${subtotal.toFixed(2)}`;
    totalNode.textContent = `₵${total.toFixed(2)}`;
};

export const init = (node) => {
    const url = new URL(window.location);
    url.searchParams.set('step', 'cart');
    window.history.replaceState({ checkoutStep: 'Cart' }, '', url);

    updateView(node, false);

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.checkoutStep) {
            saveFormState(node);
            cartState.currentStep = e.state.checkoutStep;
            updateView(node, false);
        }
    });

    node.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action');

        if (action === 'checkout') {
            saveFormState(node);
            cartState.currentStep = 'Shipping & Details';
            updateView(node);
            return;
        }

        if (action === 'back-to-shipping' || action === 'edit-shipping') {
            saveFormState(node);
            cartState.currentStep = 'Shipping & Details';
            updateView(node);
            return;
        }

        if (action === 'back-to-payment' || action === 'edit-payment') {
            saveFormState(node);
            cartState.currentStep = 'Payment Info';
            updateView(node);
            return;
        }

        if (action === 'back-to-cart') {
            saveFormState(node);
            cartState.currentStep = 'Cart';
            updateView(node);
            return;
        }

        const itemNode = actionBtn.closest('.cdlv-cart-item');
        if (itemNode) {
            const itemId = itemNode.getAttribute('data-id');
            const itemIndex = cartState.items.findIndex(i => i.id === itemId);
            if (itemIndex === -1) return;

            const item = cartState.items[itemIndex];

            if (action === 'increase' || action === 'decrease') {
                if (action === 'increase' && item.quantity < item.maxStock) {
                    item.quantity += 1;
                    updateItemQuantity(item.id, item.quantity);
                } else if (action === 'decrease' && item.quantity > 1) {
                    item.quantity -= 1;
                    updateItemQuantity(item.id, item.quantity);
                }

                const qtyNode = itemNode.querySelector('[data-target="qty"]');
                const priceNode = itemNode.querySelector('[data-target="item-price"]');
                const decreaseBtn = itemNode.querySelector('[data-action="decrease"]');
                const increaseBtn = itemNode.querySelector('[data-action="increase"]');
                const warningNode = itemNode.querySelector('[data-target="warning"]');

                qtyNode.textContent = item.quantity;
                priceNode.textContent = `₵${(item.price * item.quantity).toFixed(2)}`;
                
                decreaseBtn.disabled = item.quantity <= 1;
                increaseBtn.disabled = item.quantity >= item.maxStock;
                
                if (item.quantity >= item.maxStock) {
                    warningNode.removeAttribute('hidden');
                } else {
                    warningNode.setAttribute('hidden', 'true');
                }
                updateFinancials(node);
            } 
            else if (action === 'remove') {
                removeFromCart(item.id);
                cartState.items = getCart(); 
                itemNode.style.opacity = '0';
                itemNode.style.transition = 'opacity var(--transition-fast)';
                
                setTimeout(() => {
                    itemNode.remove();
                    if (cartState.items.length === 0) {
                        updateView(node);
                    } else {
                        const countNode = node.querySelector('[data-target="item-count"]');
                        if(countNode) countNode.textContent = `${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}`;
                        updateFinancials(node);
                    }
                }, 150);
            }
        }
    });

    node.addEventListener('input', (e) => {
        if (e.target.getAttribute('data-target') === 'notes') {
            const wordCountDisplay = node.querySelector('[data-target="word-count"]');
            if(!wordCountDisplay) return;

            const text = e.target.value;
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            
            if (words.length > 100) {
                const truncatedText = words.slice(0, 100).join(' ');
                e.target.value = truncatedText;
                wordCountDisplay.textContent = `100 / 100 words (Max reached)`;
                wordCountDisplay.style.color = 'var(--color-accent)';
            } else {
                wordCountDisplay.textContent = `${words.length} / 100 words`;
                wordCountDisplay.style.color = 'rgba(0,0,0,0.6)';
            }
        }
    });

    node.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const formId = e.target.id;
        const submitBtn = document.querySelector(`button[form="${formId}"]`);
        const originalText = submitBtn.textContent;
        const spinnerHTML = `<svg class="cdlv-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>`;

        if (formId === 'shipping-details-form' || formId === 'payment-details-form') {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${spinnerHTML} Processing...`;

            await simulateBackendCall();

            saveFormState(node);
            cartState.currentStep = formId === 'shipping-details-form' ? 'Payment Info' : 'Review';
            updateView(node);

        } else if (formId === 'place-order-form') {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${spinnerHTML} Processing...`;

            const databaseTransactionResult = await dispatchOrderToDatabase(cartState);

            if (databaseTransactionResult && databaseTransactionResult.success) {
                clearCart();
                cartState.items = [];
                cartState.currentStep = 'Success';
                updateView(node, false);
            } else {
                showNotification('error', 'Something went wrong, please try again or check your network. If the issue persists, contact support.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
};