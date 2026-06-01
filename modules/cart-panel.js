/* ==========================================================================
   MODULE: CART PANEL (modules/cart-panel.js)
   Architecture: Exportable ES Module. Renders a reactive, multi-step checkout.
   State Management: Preserves form data across internal navigation and 
   hooks into the browser's native History API for the Back button.
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { getCart, updateItemQuantity, removeFromCart, clearCart } from '../utils/cart.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str.toString();
    return tempDiv.innerHTML;
}; 

// Application State
let cartState = {
    currentStep: 'Cart',
    paymentMethod: 'momo',
    shippingDetails: { 
        firstName: '', lastName: '', email: '', phone: '', 
        address: '', city: '', region: '', landmark: '', notes: '' 
    },
    paymentDetails: {
        momoNetwork: 'mtn', momoPhone: '', 
        cardName: '', cardNumber: '', cardExp: '', cardCvc: ''
    },
    items: getCart(),
    shippingRate: 35.00
};

// --- BACKEND SIMULATOR ---
const simulateBackendCall = () => new Promise(resolve => setTimeout(resolve, 800));

// --- DATA PRESERVATION ENGINE ---
// Scrapes the current DOM values and saves them to state BEFORE a view changes
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
        if (cartState.paymentMethod === 'momo') {
            cartState.paymentDetails.momoNetwork = node.querySelector('#momo-network')?.value || 'mtn';
            cartState.paymentDetails.momoPhone = node.querySelector('#momo-phone')?.value || '';
        } else if (cartState.paymentMethod === 'card') {
            cartState.paymentDetails.cardName = node.querySelector('#card-name')?.value || '';
            cartState.paymentDetails.cardNumber = node.querySelector('#card-number')?.value || '';
            cartState.paymentDetails.cardExp = node.querySelector('#card-exp')?.value || '';
            cartState.paymentDetails.cardCvc = node.querySelector('#card-cvc')?.value || '';
        }
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

const renderEmptyState = () => `...`; // (Keep this exactly as you had it, omitted here for brevity)

const renderCartItems = () => {
    return cartState.items.map(item => `
        <article class="cdlv-cart-item" data-id="${sanitizeText(item.id)}">
            <a href="${buildPath(item.url || 'shop.html')}" class="cdlv-cart-item__image-wrap u-img-loader" aria-label="View ${sanitizeText(item.name)}">
                <img src="${buildPath(item.image)}" alt="${sanitizeText(item.name)}" class="cdlv-cart-item__image" loading="lazy" decoding="async">
            </a>
            
            <div class="cdlv-cart-item__details">
                <a href="${buildPath(item.url || 'shop.html')}" class="cdlv-cart-item__title-link">
                    <h3 class="cdlv-cart-item__title">${sanitizeText(item.name)}</h3>
                </a>
                <p class="cdlv-cart-item__variant">${sanitizeText(item.variant)}</p>
                
                <div class="cdlv-cart-item__text-actions">
                    <a href="${buildPath(item.url || 'shop.html')}" class="cdlv-cart-item__action-link">Edit Item</a>
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
    `).join('');
};

const renderSummary = () => {
    // Keep exact same as before (used on the Cart view)
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
            <div class="cdlv-cart-summary__cta-wrapper">
                <button type="button" class="cdlv-cart-summary__checkout-btn" data-action="checkout">Secure Checkout</button>
                <div class="cdlv-cart-summary__trust-signals">
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
        </aside>
    `;
};

const renderDetailedSummary = () => {
    // Keep exact same as before (used on Shipping/Payment/Review)
    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartState.shippingRate;
    const itemsList = cartState.items.map(item => `
        <div class="cdlv-cart-summary__item-row">
            <span class="cdlv-cart-summary__item-name">${sanitizeText(item.quantity)}x ${sanitizeText(item.name)}</span>
            <span class="cdlv-cart-summary__item-price">₵${sanitizeText((item.price * item.quantity).toFixed(2))}</span>
        </div>
    `).join('');

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
    // Remove existing notification if present
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

    // Trigger reflow for CSS animation
    requestAnimationFrame(() => {
        notification.classList.add('is-visible');
    });

    notification.querySelector('.cdlv-notification__close').addEventListener('click', () => {
        notification.classList.remove('is-visible');
        setTimeout(() => notification.remove(), 300); // Wait for transition
    });

    // Auto-dismiss after 6 seconds
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
        <svg aria-hidden="true" focusable="false" class="cdlv-cart-panel__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color: var(--color-accent); opacity: 1;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 class="cdlv-cart-panel__empty-title">Order Placed Successfully.</h2>
        <p style="margin-bottom: var(--spacing-sm); max-width: 600px; text-align: center; color: var(--color-text-dark);">
            Take a deep breath. You've taken a wonderful step toward nurturing your body, mind, and daily moments of calm.
        </p>
        <p style="margin-bottom: var(--spacing-md); max-width: 600px; text-align: center; color: rgba(0,0,0,0.6);">
            Your receipt will be emailed to you shortly with your order details. Thank you.
        </p>
        <a href="${buildPath('index.html')}" class="cdlv-cart-panel__empty-btn">Return to Homepage</a>
    </div>
`;

const renderCartView = () => `
    <div class="cdlv-cart-panel__layout">
        <div class="cdlv-cart-panel__list">
            <div class="cdlv-cart-panel__list-header">
                <h2>Review Your Items</h2>
                <span data-target="item-count">${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}</span>
            </div>
            <div class="cdlv-cart-panel__items-container">
                ${renderCartItems()}
            </div>
        </div>
        <div class="cdlv-cart-panel__sidebar">
            ${renderSummary()}
        </div>
    </div>
`;

const renderShippingForm = () => {
    const s = cartState.shippingDetails; // shorthand for value injection
    return `
    <div class="cdlv-cart-panel__layout">
        <section class="cdlv-shipping-form">
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

                <div class="cdlv-shipping-form__actions cdlv-form-group--full">
                    <button type="button" class="cdlv-shipping-form__back" data-action="back-to-cart">Back to Cart</button>
                    <button type="submit" class="cdlv-shipping-form__submit">Continue to Payment</button>
                </div>
            </form>
        </section>
        
        <div class="cdlv-cart-panel__sidebar">
            ${renderDetailedSummary()}
        </div>
    </div>
    `;
};

const renderPaymentForm = () => {
    const p = cartState.paymentDetails;
    let paymentFields = '';
    
    if (cartState.paymentMethod === 'momo') {
        paymentFields = `
            <div class="cdlv-payment-fields">
                <div class="cdlv-form-group">
                    <label for="momo-network">Select Network *</label>
                    <select id="momo-network" required aria-required="true">
                        <option value="mtn" ${p.momoNetwork === 'mtn' ? 'selected' : ''}>MTN Mobile Money</option>
                        <option value="telecel" ${p.momoNetwork === 'telecel' ? 'selected' : ''}>Telecel Cash</option>
                        <option value="at" ${p.momoNetwork === 'at' ? 'selected' : ''}>AT Money</option>
                    </select>
                </div>
                <div class="cdlv-form-group">
                    <label for="momo-phone">Mobile Money Number *</label>
                    <input type="tel" id="momo-phone" value="${sanitizeText(p.momoPhone)}" placeholder="e.g. 024 123 4567" required aria-required="true">
                </div>
            </div>
        `;
    } else if (cartState.paymentMethod === 'card') {
        paymentFields = `
            <div class="cdlv-payment-fields">
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="card-name">Name on Card *</label>
                    <input type="text" id="card-name" value="${sanitizeText(p.cardName)}" required aria-required="true">
                </div>
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="card-number">Card Number *</label>
                    <input type="text" id="card-number" value="${sanitizeText(p.cardNumber)}" placeholder="0000 0000 0000 0000" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="card-exp">Expiry Date *</label>
                    <input type="text" id="card-exp" value="${sanitizeText(p.cardExp)}" placeholder="MM/YY" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="card-cvc">CVC *</label>
                    <input type="text" id="card-cvc" value="${sanitizeText(p.cardCvc)}" placeholder="123" required aria-required="true">
                </div>
            </div>
        `;
    } else if (cartState.paymentMethod === 'paypal') {
        paymentFields = `<div class="cdlv-payment-fields cdlv-payment-fields--redirect"><p>After clicking "Review Order", you will be redirected to PayPal to complete your purchase securely.</p></div>`;
    }

    return `
        <div class="cdlv-cart-panel__layout">
            <section class="cdlv-shipping-form">
                <h2 class="cdlv-shipping-form__title" tabindex="-1">Payment Information</h2>
                <div class="cdlv-payment-options" aria-label="Payment Methods">
                    <button type="button" 
                            class="cdlv-payment-option ${cartState.paymentMethod === 'momo' ? 'is-selected' : ''}" 
                            data-action="select-payment" 
                            data-method="momo" 
                            aria-pressed="${cartState.paymentMethod === 'momo'}">
                        <span class="cdlv-payment-option__label">Mobile Money</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/mtn.svg')}" alt="MTN" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/telecel.svg')}" alt="Telecel Cash" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/at.svg')}" alt="AT Money" class="cdlv-payment-icon">
                        </div>
                    </button>

                    <button type="button" 
                            class="cdlv-payment-option ${cartState.paymentMethod === 'card' ? 'is-selected' : ''}" 
                            data-action="select-payment" 
                            data-method="card" 
                            aria-pressed="${cartState.paymentMethod === 'card'}">
                        <span class="cdlv-payment-option__label">Credit/Debit Card</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/visa.svg')}" alt="Visa" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/mastercard.svg')}" alt="Mastercard" class="cdlv-payment-icon">
                        </div>
                    </button>
                    <button type="button" 
                            class="cdlv-payment-option ${cartState.paymentMethod === 'paypal' ? 'is-selected' : ''}" 
                            data-action="select-payment" 
                            data-method="paypal" 
                            aria-pressed="${cartState.paymentMethod === 'paypal'}">
                        <span class="cdlv-payment-option__label">PayPal</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/paypal.svg')}" alt="PayPal" class="cdlv-payment-icon">
                        </div>
                    </button>
                </div>

                <form id="payment-details-form" class="cdlv-shipping-form__grid">
                    ${paymentFields}
                    <div class="cdlv-shipping-form__actions cdlv-form-group--full">
                        <button type="button" class="cdlv-shipping-form__back" data-action="back-to-shipping">Back to Shipping</button>
                        <button type="submit" class="cdlv-shipping-form__submit">Review Order</button>
                    </div>
                </form>
            </section>
            <div class="cdlv-cart-panel__sidebar">
                ${renderDetailedSummary()} 
            </div>
        </div>
    `;
};

const renderReviewView = () => {
    const s = cartState.shippingDetails;
    const fullName = `${s.firstName} ${s.lastName}`.trim() || 'No name provided';
    
    return `
        <div class="cdlv-cart-panel__layout">
            <section class="cdlv-shipping-form">
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
                        <p><strong>${cartState.paymentMethod === 'momo' ? 'Mobile Money' : cartState.paymentMethod === 'card' ? 'Credit/Debit Card' : 'PayPal'}</strong></p>
                        <p class="cdlv-review-card__note">You will not be charged until you click 'Place Order'.</p>
                    </article>
                </div>

                <form id="place-order-form" class="cdlv-review-actions">
                    <div class="cdlv-review-terms">
                        <input type="checkbox" id="terms-agree" required aria-required="true">
                        <label for="terms-agree">I agree to the <a href="${buildPath('legal/terms-of-service.html')}" target="_blank">Terms of Service</a> and <a href="${buildPath('legal/privacy-policy.html')}" target="_blank">Privacy Policy</a>.</label>
                    </div>
                    
                    <button type="submit" class="cdlv-review-submit">Place Order</button>
                    
                    <div class="cdlv-review-back-wrapper">
                        <button type="button" class="cdlv-shipping-form__back" data-action="back-to-payment">Back to Payment</button>
                    </div>
                </form>
            </section>
            
            <div class="cdlv-cart-panel__sidebar">
                ${renderDetailedSummary()}
            </div>
        </div>
    `;
};

// Added `pushHistory` flag to prevent duplicate state stacking when using browser Back button
const updateView = (node, pushHistory = true) => {
    if (cartState.items.length === 0) {
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

    // History API Integration
    if (pushHistory) {
        const url = new URL(window.location);
        url.searchParams.set('step', cartState.currentStep.replace(/\s+/g, '-').toLowerCase());
        window.history.pushState({ checkoutStep: cartState.currentStep }, '', url);
    }

    // A11y: Shift focus logically when views change
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
    // Initialize History API to lock in the first state
    const url = new URL(window.location);
    url.searchParams.set('step', 'cart');
    window.history.replaceState({ checkoutStep: 'Cart' }, '', url);

    updateView(node, false);

    // Hijack the Browser "Back" and "Forward" buttons
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.checkoutStep) {
            saveFormState(node); // Save current view before it's destroyed
            cartState.currentStep = e.state.checkoutStep;
            updateView(node, false); // Pass false so we don't push a new history state on top
        }
    });

    // Event Delegation: Clicks
    node.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action');

        // View Routing (Notice we save state BEFORE changing currentStep)
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

        if (action === 'select-payment') {
            saveFormState(node); // Save before swapping payment fields
            const method = actionBtn.getAttribute('data-method');
            if (cartState.paymentMethod !== method) {
                cartState.paymentMethod = method;
                updateView(node); 
            }
            return;
        }

        // Cart Actions (Quantity/Remove logic remains exactly the same)
        const itemNode = actionBtn.closest('.cdlv-cart-item');
        if (itemNode) {
            const itemId = itemNode.getAttribute('data-id');
            const itemIndex = cartState.items.findIndex(i => i.id === itemId);
            if (itemIndex === -1) return;

            const item = cartState.items[itemIndex];

            if (action === 'increase' || action === 'decrease') {
                if (action === 'increase' && item.quantity < item.maxStock) {
                    item.quantity += 1;
                    updateItemQuantity(item.id, item.quantity); // <-- UPDATE LOCALSTORAGE
                } else if (action === 'decrease' && item.quantity > 1) {
                    item.quantity -= 1;
                    updateItemQuantity(item.id, item.quantity); // <-- UPDATE LOCALSTORAGE
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
        }
        else if (action === 'remove') {
            removeFromCart(item.id); // <-- REMOVE FROM LOCALSTORAGE
            cartState.items = getCart(); // Sync local state
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
    });

    // Event Delegation: Textarea Word Count Limiter
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

    // Event Delegation: Form Submissions
    node.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const formId = e.target.id;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Spinner SVG template
        const spinnerHTML = `<svg class="cdlv-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>`;

        if (formId === 'shipping-details-form' || formId === 'payment-details-form') {
            // 1. Lock UI & Show Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${spinnerHTML} Processing...`;

            // 2. Await the mocked backend check (e.g., validating address or checking stock)
            await simulateBackendCall();

            // 3. Save state and route to next step
            saveFormState(node);
            cartState.currentStep = formId === 'shipping-details-form' ? 'Payment Info' : 'Review';
            updateView(node);

        } else if (formId === 'place-order-form') {
            // 1. Lock UI & Show Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${spinnerHTML} Processing...`;

            // 2. Await the mocked backend payment processing
            setTimeout(() => {
                const backendErrorOccurred = false; 

                if (backendErrorOccurred) {
                    showNotification('error', 'Something went wrong, please try again or check your internet connection. If the problem persists please contact support.');
                    
                    // Unlock UI on failure
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                } else {
                    // Success Routing
                    clearCart(); // <-- CLEAR BROWSER STORAGE ON SUCCESS
                    cartState.items = []; // Clear local UI state
                    cartState.currentStep = 'Success';
                    updateView(node, false);
                }
            }, 1500); 
        }
    });
};