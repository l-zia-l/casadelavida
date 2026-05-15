/* ==========================================================================
   MODULE: HEADER LOGIC (modules/header.js)
   Architecture: ES Module, Dynamic DOM Injection
   Purpose: Renders the global navigation, manages scroll state, and handles
   mobile menu interactions.
   Security & A11y: 
   - Sanitized inputs, ARIA states, Escape key support.
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
            { label: 'Account', url: 'account/index.html', mobileOnly: true } 
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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', "/": '&#x2F;' };
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
    // Get current path to determine active page state
    const currentPath = window.location.pathname;

    const listItems = links.map(link => {
        let displayClass = '';
        if (link.desktopOnly) displayClass = 'cdlv-header__item--desktop-only';
        if (link.mobileOnly) displayClass = 'cdlv-header__item--mobile-only';
        
        const cartClass = link.isCart ? 'cdlv-header__link--cart' : '';
        const cartDataAttr = link.isCart ? 'data-cart-toggle="true"' : '';
        
        // A11y: Determine if this link is the currently active page
        const isCurrentPage = currentPath.includes(link.url) || (currentPath === '/' && link.url === 'index.html');
        const ariaCurrent = isCurrentPage ? 'aria-current="page"' : '';
        
        // A11y: Hide decorative icons from screen readers, rely on visually-hidden text instead
        const content = link.isCart 
        ? `<img src="assets/icons/cart.svg" alt="" aria-hidden="true" class="cdlv-header__cart-icon"><span class="visually-hidden">${sanitizeData(link.label)}</span>` 
        : sanitizeData(link.label);
        
        return `
            <li class="cdlv-header__item ${displayClass}">
                <a href="${sanitizeData(link.url)}" class="cdlv-header__link ${cartClass}" ${cartDataAttr} ${ariaCurrent}>
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
                <img src="assets/icons/bars.svg" alt="" aria-hidden="true" class="cdlv-header__menu-icon">
                <span>Menu</span>
            </button>

            <!-- Left Navigation (Desktop) -->
            ${buildNavList(config.links.left, 'left')}

            <!-- Centered Logo -->
            <a href="${safeLogoUrl}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                <img src="${safeLogoSrc}" alt="" aria-hidden="true" class="cdlv-header__logo-img" fetchpriority="high" loading="eager">
                <span class="cdlv-header__logo-text">${safeLogoText}</span>
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

    // 2. Initialize Scroll State Logic with rAF Throttling
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                element.classList.toggle('cdlv-header--scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    // Trigger once on load in case the user refreshes mid-page
    handleScroll();

    // 3. Initialize Mobile Menu Interaction
    const menuToggle = element.querySelector('.cdlv-header__toggle');
    /**
     * Resets the mobile menu state to closed.
     */
    const closeMobileMenu = () => {
        element.classList.remove('cdlv-header--menu-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: false } }));
    };

    // 3. Initialize Mobile Menu Interaction
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            element.classList.toggle('cdlv-header--menu-open', !isExpanded);
            
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: !isExpanded } }));
        });
    }

    // A11y: Close menu on Escape key and return focus to the toggle button
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && element.classList.contains('cdlv-header--menu-open')) {
            closeMobileMenu();
            if (menuToggle) menuToggle.focus();
        }
    });

    const desktopBreakpoint = window.matchMedia('(min-width: 992px)');
    const handleBreakpointChange = (e) => {
        if (e.matches) closeMobileMenu();
    };

    desktopBreakpoint.addEventListener('change', handleBreakpointChange);
}