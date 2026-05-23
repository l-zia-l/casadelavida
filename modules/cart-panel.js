/* ==========================================================================
   MODULE: CART PANEL (modules/cart-panel.js)
   Architecture: Exportable ES Module. Renders a reactive cart.
   Security: Implements text sanitization. Enforces strict 100-word limit on notes.
   Performance: Uses fine-grained DOM updates to prevent layout thrashing and 
   unnecessary image reloads on state changes.
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

// Mock State
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

            <div class="cdlv-cart-summary__notes">
                <label for="cart-notes">Special delivery instructions (Max 100 words)</label>
                <textarea id="cart-notes" data-target="notes" rows="3" placeholder="e.g., Please leave at the gate..."></textarea>
                <small class="cdlv-cart-summary__word-count" data-target="word-count">0 / 100 words</small>
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

// Calculates and updates the bottom-line numbers without re-rendering the HTML
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
    // 1. Initial Full Render
    if (cartState.items.length === 0) {
        node.innerHTML = renderEmptyState();
        return;
    }

    node.innerHTML = `
        ${renderTabbedProgress('Cart')}
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

    // 2. Textarea Word Count Limiter
    const notesArea = node.querySelector('[data-target="notes"]');
    const wordCountDisplay = node.querySelector('[data-target="word-count"]');
    
    if (notesArea) {
        notesArea.addEventListener('input', (e) => {
            const text = e.target.value;
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            
            if (words.length > 100) {
                // Truncate to exactly 100 words
                const truncatedText = words.slice(0, 100).join(' ');
                e.target.value = truncatedText;
                wordCountDisplay.textContent = `100 / 100 words (Max reached)`;
                wordCountDisplay.style.color = 'var(--color-accent)';
            } else {
                wordCountDisplay.textContent = `${words.length} / 100 words`;
                wordCountDisplay.style.color = 'rgba(0,0,0,0.6)';
            }
        });
    }

    // 3. Performant Event Delegation for Cart Actions
    node.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const itemNode = actionBtn.closest('.cdlv-cart-item');
        const itemId = itemNode ? itemNode.getAttribute('data-id') : null;
        const action = actionBtn.getAttribute('data-action');
        
        const itemIndex = cartState.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = cartState.items[itemIndex];

        if (action === 'increase' || action === 'decrease') {
            if (action === 'increase' && item.quantity < item.maxStock) {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }

            // Target highly specific DOM nodes to prevent layout shifts/image reloads
            const qtyNode = itemNode.querySelector('[data-target="qty"]');
            const priceNode = itemNode.querySelector('[data-target="item-price"]');
            const decreaseBtn = itemNode.querySelector('[data-action="decrease"]');
            const increaseBtn = itemNode.querySelector('[data-action="increase"]');
            const warningNode = itemNode.querySelector('[data-target="warning"]');

            qtyNode.textContent = item.quantity;
            priceNode.textContent = `₵${(item.price * item.quantity).toFixed(2)}`;
            
            // Update button states
            decreaseBtn.disabled = item.quantity <= 1;
            increaseBtn.disabled = item.quantity >= item.maxStock;
            
            // Toggle warning
            if (item.quantity >= item.maxStock) {
                warningNode.removeAttribute('hidden');
            } else {
                warningNode.setAttribute('hidden', 'true');
            }

            updateFinancials(node);
        } 
        else if (action === 'remove') {
            cartState.items.splice(itemIndex, 1);
            
            // Fade out animation before removing node
            itemNode.style.opacity = '0';
            itemNode.style.transition = 'opacity var(--transition-fast)';
            
            setTimeout(() => {
                itemNode.remove();
                
                // Check if cart is now empty
                if (cartState.items.length === 0) {
                    node.innerHTML = renderEmptyState();
                } else {
                    const countNode = node.querySelector('[data-target="item-count"]');
                    countNode.textContent = `${cartState.items.length} ${cartState.items.length === 1 ? 'Item' : 'Items'}`;
                    updateFinancials(node);
                }
            }, 150);
        }
    });
};