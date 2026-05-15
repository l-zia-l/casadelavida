s/* ==========================================================================
   MODULE: HEADER LOGIC (modules/header.js)
   Architecture: ES Module, Dynamic DOM Injection
   Purpose: Renders the global navigation, manages scroll state, and handles
   mobile menu interactions.
   Security: 
   - Uses strict HTML entity escaping (`sanitizeData`) to prevent XSS.
   - Fully isolated scope (no global variable leakage).
   - No hardcoded sensitive data.
   ========================================================================== */

/**
 * Configuration Object
 * Defines the navigation structure. Use absolute paths based on the sitemap.
 */
const config = {
    logo: {
        text: 'Casa De La Vida', 
        src: 'assets/images/logo_small.png', 
        url: 'index.html'
    },
    links: {
        left: [
            { label: 'Shop', url: 'shop.html' },
            { label: 'Rituals', url: 'shop/wellness-boxes.html' }
        ],
        right: [
            { label: 'Account', url: 'account/index.html', desktopOnly: true },
            { label: 'Cart', url: 'shopping-cart.html', isCart: true }
        ]
    }
};

/**
 * Strict Data Sanitizer
 * Prevents XSS by escaping dangerous characters before DOM insertion.
 * @param {string} str - The untrusted string.
 * @returns {string} - The sanitized HTML-safe string.
 */
const sanitizeData = (str) => {
    if (typeof str !== 'string') return str;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return str.replace(reg, (match) => (map[match]));
};

/**
 * Builds a navigation list from the config array.
 * @param {Array} links - Array of link objects.
 * @param {string} alignment - 'left' or 'right'.
 * @returns {string} - HTML string for the <ul>.
 */
const buildNavList = (links, alignment) => {
    const listItems = links.map(link => {
        const desktopClass = link.desktopOnly ? 'cdlv-header__item--desktop-only' : '';
        const cartDataAttr = link.isCart ? 'data-cart-toggle="true"' : '';
        
        return `
            <li class="cdlv-header__item ${desktopClass}">
                <a href="${sanitizeData(link.url)}" class="cdlv-header__link" ${cartDataAttr}>
                    ${sanitizeData(link.label)}
                </a>
            </li>
        `;
    }).join('');

    return `<ul class="cdlv-header__list cdlv-header__list--${alignment}">${listItems}</ul>`;
};

/**
 * Generates the complete HTML structure for the header.
 * @returns {string} - The DOM string to be injected.
 */
const generateHeaderHTML = () => {
    const safeLogoText = sanitizeData(config.logo.text);
    const safeLogoUrl = sanitizeData(config.logo.url);
    
    return `
        <nav class="cdlv-header__nav" aria-label="Primary Navigation">
            <!-- Mobile Menu Toggle -->
            <button class="cdlv-header__toggle" aria-expanded="false" aria-controls="mobile-menu">
                <span class="cdlv-header__toggle-icon">
                    <span class="cdlv-header__toggle-line"></span>
                    <span class="cdlv-header__toggle-line"></span>
                </span>
                <span>Menu</span>
            </button>

            <!-- Left Navigation (Desktop) -->
            ${buildNavList(config.links.left, 'left')}

            <!-- Centered Logo -->
            <a href="${safeLogoUrl}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                ${safeLogoText}
                <!-- Uncomment to use image logo -->
                <!-- <img src="${sanitizeData(config.logo.src)}" alt="${safeLogoText}" class="cdlv-header__logo-img"> -->
            </a>

            <!-- Right Navigation (Account & Cart) -->
            ${buildNavList(config.links.right, 'right')}
        </nav>
    `;
};

/**
 * Initializes the header module.
 * @param {HTMLElement} element - The DOM node targeting this module (e.g., #global-header).
 */
export function init(element) {
    if (!element) return;

    // 1. Inject the sanitized HTML structure
    element.innerHTML = generateHeaderHTML();

    // 2. Initialize Scroll State Logic (Transparent to Solid)
    const handleScroll = () => {
        // Use a 50px threshold before turning solid to account for minor scrolling bounces
        if (window.scrollY > 50) {
            element.classList.add('cdlv-header--scrolled');
        } else {
            element.classList.remove('cdlv-header--scrolled');
        }
    };

    // Attach scroll listener with passive flag for rendering performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Trigger once on load in case the user refreshes mid-page
    handleScroll();

    // 3. Initialize Mobile Menu Interaction
    const menuToggle = element.querySelector('.cdlv-header__toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Dispatch a custom event so a separate mobile-drawer module can listen and open
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', {
                detail: { isOpen: !isExpanded }
            }));
        });
    }
}