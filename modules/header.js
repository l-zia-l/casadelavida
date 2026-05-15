/* ==========================================================================
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
            { label: 'Rituals', url: 'shop/wellness-boxes.html' },
            // Add Account here, flagged for mobile menu only
            { label: 'Account', url: 'account/index.html', mobileOnly: true } 
        ],
        right: [
            // Keep Account here, flagged for desktop right side only
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
        // Apply visibility classes based on our new config flags
        let displayClass = '';
        if (link.desktopOnly) displayClass = 'cdlv-header__item--desktop-only';
        if (link.mobileOnly) displayClass = 'cdlv-header__item--mobile-only';
        
        const cartClass = link.isCart ? 'cdlv-header__link--cart' : '';
        const cartDataAttr = link.isCart ? 'data-cart-toggle="true"' : '';
        
        const content = link.isCart 
        ? `<img src="assets/icons/cart.svg" alt="Cart" class="cdlv-header__cart-icon"><span class="visually-hidden">${sanitizeData(link.label)}</span>` 
        : sanitizeData(link.label);
        
        return `
            <li class="cdlv-header__item ${displayClass}">
                <a href="${sanitizeData(link.url)}" class="cdlv-header__link ${cartClass}" ${cartDataAttr}>
                    ${content}
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
    const safeLogoSrc = sanitizeData(config.logo.src);
    
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
                <img src="${safeLogoSrc}" alt="${safeLogoText}" class="cdlv-header__logo-img">
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
    /**
     * Resets the mobile menu state to closed.
     */
    const closeMobileMenu = () => {
        element.classList.remove('cdlv-header--menu-open');
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', {
            detail: { isOpen: false }
        }));
    };

    // 3. Initialize Mobile Menu Interaction
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            element.classList.toggle('cdlv-header--menu-open', !isExpanded);
            
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', {
                detail: { isOpen: !isExpanded }
            }));
        });
    }

    // 4. Clean-up Logic for Screen Resizing/Zooming
    // This matches your CSS breakpoint (992px)
    const desktopBreakpoint = window.matchMedia('(min-width: 992px)');

    const handleBreakpointChange = (e) => {
        // If we just crossed over into desktop width, force the menu closed
        if (e.matches) {
            closeMobileMenu();
        }
    };

    // Use the modern addEventListener for MediaQueryList
    desktopBreakpoint.addEventListener('change', handleBreakpointChange);
}