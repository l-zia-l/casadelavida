/* ==========================================================================
   MODULE: HEADER LOGIC (modules/header.js)
   Architecture: ES Module, Dynamic DOM Injection
   Purpose: Renders the global navigation, manages scroll state, and handles
   mobile menu interactions (including sliding drawer logic).
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
 * Builds a navigation list from the config array for desktop display.
 * @param {Array} links - Array of link objects.
 * @param {string} alignment - 'left' or 'right'.
 * @returns {string} - HTML string for the <ul>.
 */
const buildNavList = (links, alignment) => {
    const listItems = links.map(link => {
        const desktopClass = link.desktopOnly ? 'cdlv-header__item--desktop-only' : '';
        const cartDataAttr = link.isCart ? 'data-cart-toggle="true"' : '';
        const linkClass = link.isCart ? 'cdlv-header__link cdlv-header__link--icon' : 'cdlv-header__link';
        
        const innerContent = link.isCart 
            ? `<i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><span class="sr-only">${sanitizeData(link.label)}</span>`
            : sanitizeData(link.label);

        return `
            <li class="cdlv-header__item ${desktopClass}">
                <a href="${sanitizeData(link.url)}" class="${linkClass}" ${cartDataAttr}>
                    ${innerContent}
                </a>
            </li>
        `;
    }).join('');

    return `<ul class="cdlv-header__list cdlv-header__list--${alignment}">${listItems}</ul>`;
};

/**
 * Builds the combined list of links specifically for the mobile dropdown drawer.
 * Excludes the cart, as the cart icon remains in the top grid on mobile.
 */
const buildMobileDrawerList = () => {
    // Combine left and right links, filter out the cart
    const allLinks = [...config.links.left, ...config.links.right].filter(link => !link.isCart);
    
    return allLinks.map(link => `
        <a href="${sanitizeData(link.url)}" class="cdlv-header__link">
            ${sanitizeData(link.label)}
        </a>
    `).join('');
};

/**
 * Generates the complete HTML structure for the header, including the mobile drawer.
 * @returns {string} - The DOM string to be injected.
 */
const generateHeaderHTML = () => {
    const safeLogoText = sanitizeData(config.logo.text);
    const safeLogoUrl = sanitizeData(config.logo.url);
    const safeLogoSrc = sanitizeData(config.logo.src);
    
    return `
        <nav class="cdlv-header__nav" aria-label="Primary Navigation">
            <!-- Mobile Menu Toggle -->
            <button class="cdlv-header__toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle Navigation Menu">
                <span class="cdlv-header__toggle-icon-open" aria-hidden="true"><i class="fa-solid fa-bars"></i></span>
                <span class="cdlv-header__toggle-icon-close" aria-hidden="true"><i class="fa-solid fa-x"></i></span>
                <span>Menu</span>
            </button>

            <!-- Left Navigation (Desktop) -->
            ${buildNavList(config.links.left, 'left')}

            <!-- Centered Image Logo -->
            <a href="${safeLogoUrl}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                <img src="${safeLogoSrc}" alt="${safeLogoText}" class="cdlv-header__logo-img">
            </a>

            <!-- Right Navigation (Account & Cart) -->
            ${buildNavList(config.links.right, 'right')}
        </nav>

        <!-- Mobile Menu Drawer -->
        <aside id="mobile-menu" class="cdlv-header__mobile-drawer" aria-hidden="true">
            ${buildMobileDrawerList()}
        </aside>
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
        // If the mobile menu is open, force the solid background for readability
        if (element.classList.contains('is-menu-open')) return;

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
    const mobileDrawer = element.querySelector('.cdlv-header__mobile-drawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle ARIA states
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            mobileDrawer.setAttribute('aria-hidden', String(isExpanded));
            
            // Toggle CSS interaction class on the root element
            element.classList.toggle('is-menu-open', !isExpanded);

            // Force header solid when opening the menu so the dropdown looks connected
            if (!isExpanded) {
                element.classList.add('cdlv-header--scrolled');
            } else {
                handleScroll(); // Re-evaluate scroll position when closing
            }
            
            // Dispatch a custom event for other modules to listen to if needed
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', {
                detail: { isOpen: !isExpanded }
            }));
        });
    }
}