/* ==========================================================================
   MODULE: SHOP HEADER (modules/header-shop.js)
   Architecture: ES Module, Dynamic DOM Injection
   Purpose: Renders the opaque navigation tailored for the shop experience,
   focusing on brand identity (left) and e-commerce utilities (right).
   Security & A11y: 
   - Uses strict HTML entity escaping (`sanitizeData`) to prevent XSS.
   - Fully isolated scope.
   - Accessible ARIA labels for icon-only utility links.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const config = {
    logo: {
        text: 'Casa De La Vida', 
        src: buildPath('assets/images/logo.png'), 
        url: buildPath('index.html')
    },
    utilities: [
        { 
            id: 'search',
            label: 'Search Catalog', 
            url: buildPath('shop/search.html'), 
            icon: buildPath('assets/icons/search.svg'),
            isCart: false 
        },
        { 
            id: 'account',
            label: 'My Account', 
            url: buildPath('account/index.html'), 
            icon: buildPath('assets/icons/user.svg'),
            isCart: false 
        },
        { 
            id: 'cart',
            label: 'Shopping Cart', 
            url: buildPath('shopping-cart.html'), 
            icon: buildPath('assets/icons/cart.svg'),
            isCart: true 
        }
    ]
};

/**
 * Strict Data Sanitizer
 * Prevents XSS by escaping dangerous characters before DOM insertion.
 * @param {string} str - The untrusted string.
 * @returns {string} - The sanitized HTML-safe string.
 */
const sanitizeData = (str) => {
    if (typeof str !== 'string') return str;
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', "/": '&#x2F;' };
    return str.replace(/[&<>"'/]/ig, (match) => map[match]);
};

/**
 * Builds the utility navigation list from the config array.
 * @param {Array} utilities - Array of utility link objects.
 * @returns {string} - HTML string for the utility <ul>.
 */
const buildUtilitiesList = (utilities) => {
    const listItems = utilities.map(util => {
        const isCart = util.isCart;
        const cartDataAttr = isCart ? 'data-cart-toggle="true"' : '';
        const badgeHTML = isCart ? `<span class="cdlv-shop-header__cart-badge" id="shop-cart-badge" aria-hidden="true">0</span>` : '';
        
        return `
            <li class="cdlv-shop-header__utility-item">
                <a href="${sanitizeData(util.url)}" 
                   class="cdlv-shop-header__utility-link" 
                   aria-label="${sanitizeData(util.label)}" 
                   ${cartDataAttr}>
                    <img src="${sanitizeData(util.icon)}" alt="" aria-hidden="true" class="cdlv-shop-header__utility-icon">
                    ${badgeHTML}
                </a>
            </li>
        `;
    }).join('');

    return `<ul class="cdlv-shop-header__utilities">${listItems}</ul>`;
};

/**
 * Generates the complete HTML structure for the shop header.
 * @returns {string} - The DOM string to be injected.
 */
const generateHeaderHTML = () => {
    const safeLogoText = sanitizeData(config.logo.text);
    
    return `
        <nav class="cdlv-shop-header container-fluid" aria-label="Shop Navigation">
            <div class="cdlv-shop-header__inner">
                <!-- Brand Logo (Left) -->
                <a href="${sanitizeData(config.logo.url)}" class="cdlv-shop-header__logo-link" aria-label="${safeLogoText} Home">
                    <img src="${sanitizeData(config.logo.src)}" alt="" aria-hidden="true" class="cdlv-shop-header__logo-img" fetchpriority="high" loading="eager">
                    <span class="cdlv-shop-header__logo-text">${safeLogoText}</span>
                </a>

                <!-- E-commerce Utilities (Right) -->
                ${buildUtilitiesList(config.utilities)}
            </div>
        </nav>
    `;
};

/**
 * Initializes the shop header module.
 * @param {HTMLElement} element - The DOM node targeting this module.
 */
export function init(element) {
    if (!element) return;

    // 1. Inject the HTML fragment
    element.innerHTML = generateHeaderHTML();
    
    // 2. Select the newly injected nav element
    const navElement = element.querySelector('.cdlv-shop-header');

    // 3. Scroll Management (Hide/Show on scroll)
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Add shadow if scrolled past 50px
                navElement.classList.toggle('cdlv-shop-header--scrolled', currentScrollY > 50);

                // Hide header when scrolling down past 300px, reveal when scrolling up
                if (currentScrollY > 300) {
                    if (currentScrollY > lastScrollY) {
                        navElement.classList.add('cdlv-shop-header--hidden');
                    } else {
                        navElement.classList.remove('cdlv-shop-header--hidden');
                    }
                } else {
                    navElement.classList.remove('cdlv-shop-header--hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize state

    // 4. Cart Badge Management
    const cartBadge = element.querySelector('#shop-cart-badge');
    
    const updateCartBadge = (count) => {
        if (!cartBadge) return;
        
        // Ensure count is an integer
        const parsedCount = parseInt(count, 10) || 0;
        
        if (parsedCount > 0) {
            cartBadge.textContent = parsedCount > 99 ? '99+' : parsedCount;
            cartBadge.classList.add('cdlv-shop-header__cart-badge--active');
        } else {
            cartBadge.classList.remove('cdlv-shop-header__cart-badge--active');
            // Delay removing text to allow scale-down transition to finish
            setTimeout(() => { cartBadge.textContent = '0'; }, 300);
        }
    };

    // Listen for custom system-wide cart updates
    document.addEventListener('cdlv:cartUpdated', (e) => {
        if (e.detail && typeof e.detail.itemCount !== 'undefined') {
            updateCartBadge(e.detail.itemCount);
        }
    });

    // Fetch initial cart state from your cart.js utility or local storage
    try {
        const storedCart = JSON.parse(localStorage.getItem('cdlv_cart')) || [];
        const initialCount = storedCart.reduce((total, item) => total + (item.quantity || 1), 0);
        updateCartBadge(initialCount);
    } catch (err) {
        console.warn('Failed to parse initial cart state for header badge.');
    }
}