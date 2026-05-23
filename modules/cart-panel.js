/* ==========================================================================
   MODULE: CART PANEL (modules/cart-panel.js)
   Architecture: Exportable ES Module. Renders a reactive split-view cart.
   Security: Implements DOMPurify-style text sanitization for injected strings.
   Dependencies: Relies on `utils/path.js` for asset routing.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Basic text sanitizer to prevent HTML injection from external data strings.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string' && typeof str !== 'number') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str.toString();
    return tempDiv.innerHTML;
};

// --------------------------------------------------------------------------
// MOCK STATE (To be replaced with utils/cart.js integration in the future)
// --------------------------------------------------------------------------
let cartState = {
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
            maxStock: 3, // Triggers the low stock warning
            image: 'assets/images/products/item_1.webp'
        }
    ],
    shippingRate: 35.00
};

// --------------------------------------------------------------------------
// COMPONENT RENDERERS
// --------------------------------------------------------------------------

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
                    <button type="button" class="cdlv-cart-item__qty-btn" data-action="decrease" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="cdlv-cart-item__qty-value">${sanitizeText(item.quantity)}</span>
                    <button type="button" class="cdlv-cart-item__qty-btn" data-action="increase" aria-label="Increase quantity" ${item.quantity >= item.maxStock ? 'disabled' : ''}>+</button>
                </div>
                ${item.quantity >= item.maxStock ? `<span class="cdlv-cart-item__stock-warning">Only ${sanitizeText(item.maxStock)} left in stock.</span>` : ''}
            </div>

            <div class="cdlv-cart-item__price">
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

            <div class="cdlv-cart-summary__notes">
                <label for="cart-notes">Special delivery instructions</label>
                <textarea id="cart-notes" rows="3" placeholder="e.g., Please leave at the gate..."></textarea>
            </div>

            <div class="cdlv-cart-summary__cta-wrapper">
                <button type="button" class="cdlv-cart-summary__checkout-btn">Secure Checkout</button>
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

/**
 * Re-renders the internal HTML based on updated state without destroying the wrapper.
 * @param {HTMLElement} node - The root module node.
 */
const updateDOM = (node) => {
    if (cartState.items.length === 0) {
        node.innerHTML = renderEmptyState();
        return;
    }

    node.innerHTML = `
        <div class="cdlv-cart-panel__layout">
            <div class="cdlv-cart-panel__list">
                <div class="cdlv-cart-panel__list-header">
                    <h2>Review Your Items</h2>
                    <span>${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}</span>
                </div>
                ${renderCartItems()}
            </div>
            <div class="cdlv-cart-panel__sidebar">
                ${renderSummary()}
            </div>
        </div>
    `;
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 */
export const init = (node) => {
    // 1. Initial Render
    updateDOM(node);

    // 2. Performant Event Delegation
    node.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const itemNode = actionBtn.closest('.cdlv-cart-item');
        const itemId = itemNode ? itemNode.getAttribute('data-id') : null;
        const action = actionBtn.getAttribute('data-action');
        
        const itemIndex = cartState.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        if (action === 'increase') {
            if (cartState.items[itemIndex].quantity < cartState.items[itemIndex].maxStock) {
                cartState.items[itemIndex].quantity += 1;
                updateDOM(node);
            }
        } 
        else if (action === 'decrease') {
            if (cartState.items[itemIndex].quantity > 1) {
                cartState.items[itemIndex].quantity -= 1;
                updateDOM(node);
            }
        } 
        else if (action === 'remove') {
            cartState.items.splice(itemIndex, 1);
            updateDOM(node);
        }
    });
};