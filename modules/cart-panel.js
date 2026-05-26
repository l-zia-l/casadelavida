/* ==========================================================================
   MODULE: CART PANEL (modules/cart-panel.js)
   Architecture: Exportable ES Module. Renders a reactive, multi-step checkout.
   Security: Implements text sanitization. Enforces strict 100-word limit.
   Performance: Event delegation handles dynamic DOM updates efficiently.
   A11y: Programmatic focus management when views change.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str.toString();
    return tempDiv.innerHTML;
}; 

// Application State
let cartState = {
    currentStep: 'Cart', // Tracks routing ('Cart', 'Shipping & Details', 'Payment Info', 'Review')
    paymentMethod: 'momo',
    shippingDetails: { // Mock data for the review screen
        name: 'Kwame Mensah',
        address: '123 Independence Ave, Osu',
        city: 'Accra',
        region: 'Greater Accra',
        phone: '024 123 4567'
    },
    items: [
        {
            id: 'prod_001',
            name: 'Calming Fertility Package',
            variant: 'Signature Collection',
            price: 600.00,
            quantity: 1,
            maxStock: 10,
            image: 'assets/images/products/box_3.webp'
        },
        {
            id: 'prod_002',
            name: 'Honey Infused Tumeric',
            variant: '250g Glass Jar',
            price: 100.00,
            quantity: 3,
            maxStock: 3, 
            image: 'assets/images/products/item_1.webp'
        }
    ],
    shippingRate: 35.00
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
                            <button type="button" 
                                    class="cdlv-checkout-nav__btn" 
                                    aria-current="${isActive ? 'step' : 'false'}"
                                    ${!isActive ? 'disabled' : ''}>
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
        <svg class="cdlv-cart-panel__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h2 class="cdlv-cart-panel__empty-title">Your cart is currently craving some wellness.</h2>
        <a href="shop.html" class="cdlv-cart-panel__empty-btn">Explore Collections</a>
    </div>
`;

const renderCartItems = () => {
    return cartState.items.map(item => `
        <article class="cdlv-cart-item" data-id="${sanitizeText(item.id)}">
            <div class="cdlv-cart-item__image-wrap u-img-loader">
                <img src="${buildPath(item.image)}" alt="${sanitizeText(item.name)}" class="cdlv-cart-item__image">
            </div>
            
            <div class="cdlv-cart-item__details">
                <h3 class="cdlv-cart-item__title">${sanitizeText(item.name)}</h3>
                <p class="cdlv-cart-item__variant">${sanitizeText(item.variant)}</p>
                <button type="button" class="cdlv-cart-item__remove" data-action="remove">Remove</button>
            </div>

            <div class="cdlv-cart-item__actions">
                <div class="cdlv-cart-item__qty-control">
                    <button type="button" class="cdlv-cart-item__qty-btn" data-action="decrease" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <span class="cdlv-cart-item__qty-value" data-target="qty">${sanitizeText(item.quantity)}</span>
                    <button type="button" class="cdlv-cart-item__qty-btn" data-action="increase" aria-label="Increase quantity" ${item.quantity >= item.maxStock ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
    const subtotal = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + cartState.shippingRate;

    return `
        <aside class="cdlv-cart-summary">
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Secure Payment
                    </span>
                    <span class="cdlv-cart-summary__trust-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Fast Local Delivery
                    </span>
                </div>
            </div>
        </aside>
    `;
};

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

const renderShippingForm = () => `
    <div class="cdlv-cart-panel__layout">
        <section class="cdlv-shipping-form">
            <h2 class="cdlv-shipping-form__title" tabindex="-1">Shipping & Personal Details</h2>
            <form id="shipping-details-form" class="cdlv-shipping-form__grid">
                
                <div class="cdlv-form-group">
                    <label for="first-name">First Name *</label>
                    <input type="text" id="first-name" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="last-name">Last Name *</label>
                    <input type="text" id="last-name" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="phone">Phone Number *</label>
                    <input type="tel" id="phone" placeholder="024 123 4567" required aria-required="true">
                </div>
                
                <hr class="cdlv-shipping-form__divider">

                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="address">Delivery Address *</label>
                    <input type="text" id="address" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="city">City *</label>
                    <select id="city" required aria-required="true">
                        <option value="">Select City</option>
                        <option value="accra">Accra</option>
                        <option value="tamale">Tamale</option>
                    </select>
                </div>
                <div class="cdlv-form-group">
                    <label for="region">Region *</label>
                    <input type="text" id="region" required aria-required="true">
                </div>
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="landmark">Landmark (e.g., Near the blue gate) *</label>
                    <input type="text" id="landmark" required aria-required="true">
                </div>
                
                <div class="cdlv-form-group cdlv-form-group--full">
                    <div class="cdlv-form-group__header">
                        <label for="delivery-notes">Special Delivery Instructions</label>
                        <small class="cdlv-form-word-count" data-target="word-count">0 / 100 words</small>
                    </div>
                    <textarea id="delivery-notes" data-target="notes" rows="3" placeholder="e.g., Please leave at the gate..."></textarea>
                </div>

                <div class="cdlv-shipping-form__actions cdlv-form-group--full">
                    <button type="button" class="cdlv-shipping-form__back" data-action="back-to-cart">Back to Cart</button>
                    <button type="submit" class="cdlv-shipping-form__submit">Continue to Payment</button>
                </div>
            </form>
        </section>
        
        <div class="cdlv-cart-panel__sidebar">
            <aside class="cdlv-cart-summary">
                <h3 class="cdlv-cart-summary__title">Order Summary</h3>
                <div class="cdlv-cart-summary__row">
                    <span>${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}</span>
                    <span>₵${sanitizeText(cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2))}</span>
                </div>
                <hr class="cdlv-cart-summary__divider">
                <div class="cdlv-cart-summary__row cdlv-cart-summary__row--total">
                    <span>Total</span>
                    <span>₵${sanitizeText((cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + cartState.shippingRate).toFixed(2))}</span>
                </div>
            </aside>
        </div>
    </div>
`;

const renderPaymentForm = () => {
    // Dynamic fields based on the selected method
    let paymentFields = '';
    if (cartState.paymentMethod === 'momo') {
        paymentFields = `
            <div class="cdlv-payment-fields">
                <div class="cdlv-form-group">
                    <label for="momo-network">Select Network *</label>
                    <select id="momo-network" required aria-required="true">
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="telecel">Telecel Cash</option>
                        <option value="at">AT Money</option>
                    </select>
                </div>
                <div class="cdlv-form-group">
                    <label for="momo-phone">Mobile Money Number *</label>
                    <input type="tel" id="momo-phone" placeholder="e.g. 024 123 4567" required aria-required="true">
                </div>
            </div>
        `;
    } else if (cartState.paymentMethod === 'card') {
        paymentFields = `
            <div class="cdlv-payment-fields">
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="card-name">Name on Card *</label>
                    <input type="text" id="card-name" required aria-required="true">
                </div>
                <div class="cdlv-form-group cdlv-form-group--full">
                    <label for="card-number">Card Number *</label>
                    <input type="text" id="card-number" placeholder="0000 0000 0000 0000" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="card-exp">Expiry Date *</label>
                    <input type="text" id="card-exp" placeholder="MM/YY" required aria-required="true">
                </div>
                <div class="cdlv-form-group">
                    <label for="card-cvc">CVC *</label>
                    <input type="text" id="card-cvc" placeholder="123" required aria-required="true">
                </div>
            </div>
        `;
    } else if (cartState.paymentMethod === 'paypal') {
        paymentFields = `
            <div class="cdlv-payment-fields cdlv-payment-fields--redirect">
                <p>After clicking "Review Order", you will be redirected to PayPal to complete your purchase securely.</p>
            </div>
        `;
    }

    return `
        <div class="cdlv-cart-panel__layout">
            <section class="cdlv-shipping-form"> <h2 class="cdlv-shipping-form__title" tabindex="-1">Payment Information</h2>
                
                <div class="cdlv-payment-options" role="radiogroup" aria-label="Payment Methods">
                    <button type="button" class="cdlv-payment-option ${cartState.paymentMethod === 'momo' ? 'is-selected' : ''}" data-action="select-payment" data-method="momo" role="radio" aria-checked="${cartState.paymentMethod === 'momo'}">
                        <span class="cdlv-payment-option__label">Mobile Money</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/mtn.svg')}" alt="MTN" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/telecel.svg')}" alt="Telecel" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/at.svg')}" alt="AT" class="cdlv-payment-icon">
                        </div>
                    </button>
                    <button type="button" class="cdlv-payment-option ${cartState.paymentMethod === 'card' ? 'is-selected' : ''}" data-action="select-payment" data-method="card" role="radio" aria-checked="${cartState.paymentMethod === 'card'}">
                        <span class="cdlv-payment-option__label">Credit/Debit Card</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/visa.svg')}" alt="Visa" class="cdlv-payment-icon">
                            <img src="${buildPath('assets/icons/mastercard.svg')}" alt="Mastercard" class="cdlv-payment-icon">
                        </div>
                    </button>
                    <button type="button" class="cdlv-payment-option ${cartState.paymentMethod === 'paypal' ? 'is-selected' : ''}" data-action="select-payment" data-method="paypal" role="radio" aria-checked="${cartState.paymentMethod === 'paypal'}">
                        <span class="cdlv-payment-option__label">PayPal</span>
                        <div class="cdlv-payment-option__icons">
                            <img src="${buildPath('assets/icons/paypal.svg')}" alt="PayPal" class="cdlv-payment-icon">
                        </div>
                    </button>
                </div>

                <form id="payment-details-form" class="cdlv-shipping-form__grid">
                    ${paymentFields}
                    
                    <div class="cdlv-shipping-form__actions cdlv-form-group--full">
                    <button type="button" class="cdlv-shipping-form__back" data-action="back-to-cart">Back to Cart</button>
                    <button type="submit" class="cdlv-shipping-form__submit">Continue to Payment</button>
                </div>
            </form>
        </section>
        
        <div class="cdlv-cart-panel__sidebar">
            ${renderDetailedSummary()} </div>
    </div>
    `;
};

const renderReviewView = () => {
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
                        <p><strong>${sanitizeText(cartState.shippingDetails.name)}</strong></p>
                        <p>${sanitizeText(cartState.shippingDetails.address)}</p>
                        <p>${sanitizeText(cartState.shippingDetails.city)}, ${sanitizeText(cartState.shippingDetails.region)}</p>
                        <p>${sanitizeText(cartState.shippingDetails.phone)}</p>
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

const renderDetailedSummary = () => {
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
            <div class="cdlv-cart-summary__items">
                ${itemsList}
            </div>
            <hr class="cdlv-cart-summary__divider">
            <div class="cdlv-cart-summary__row">
                <span>Subtotal</span>
                <span>₵${sanitizeText(subtotal.toFixed(2))}</span>
            </div>
            <div class="cdlv-cart-summary__row">
                <span>Estimated Shipping</span>
                <span>₵${sanitizeText(cartState.shippingRate.toFixed(2))}</span>
            </div>
            <hr class="cdlv-cart-summary__divider">
            <div class="cdlv-cart-summary__row cdlv-cart-summary__row--total">
                <span>Total</span>
                <span>₵${sanitizeText(total.toFixed(2))}</span>
            </div>
        </aside>
    `;
};

const updateView = (node) => {
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
    }

    node.innerHTML = `
        ${renderTabbedProgress(cartState.currentStep)}
        ${viewContent}
    `;

    // A11y: Shift focus logically when views change
    if (cartState.currentStep !== 'Cart') {
        const titleNode = node.querySelector('h2');
        if (titleNode) {
            // Ensure the element has tabindex="-1" so it can receive programmatic focus
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
    updateView(node);

    // Event Delegation: Clicks
    node.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.getAttribute('data-action');

        // View Routing
        if (action === 'checkout') {
            cartState.currentStep = 'Shipping & Details';
            updateView(node);
            return;
        }

        if (action === 'back-to-shipping') {
            cartState.currentStep = 'Shipping & Details';
            updateView(node);
            return;
        }

        if (action === 'back-to-payment' || action === 'edit-payment') {
            cartState.currentStep = 'Payment Info';
            updateView(node);
            return;
        }

        if (action === 'edit-shipping') {
            cartState.currentStep = 'Shipping & Details';
            updateView(node);
            return;
        }

        if (action === 'select-payment') {
            const method = actionBtn.getAttribute('data-method');
            if (cartState.paymentMethod !== method) {
                cartState.paymentMethod = method;
                updateView(node); // Re-render payment view to show new form fields
            }
            return;
        }

        if (action === 'back-to-cart') {
            cartState.currentStep = 'Cart';
            updateView(node);
            return;
        }

        // Cart Actions
        const itemNode = actionBtn.closest('.cdlv-cart-item');
        if (!itemNode) return;
        
        const itemId = itemNode.getAttribute('data-id');
        const itemIndex = cartState.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = cartState.items[itemIndex];

        if (action === 'increase' || action === 'decrease') {
            if (action === 'increase' && item.quantity < item.maxStock) {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
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
            cartState.items.splice(itemIndex, 1);
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

    // Event Delegation: Textarea Input (Word Count)
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
    node.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        if (e.target.id === 'shipping-details-form') {
            cartState.currentStep = 'Payment Info';
            updateView(node);
        } else if (e.target.id === 'payment-details-form') {
            cartState.currentStep = 'Review';
            updateView(node);
        } else if (e.target.id === 'place-order-form') {
            // The required attribute on the checkbox handles validation naturally.
            // When the form successfully submits, redirect to the success page.
            window.location.href = buildPath('status/success.html');
        }
    });
};