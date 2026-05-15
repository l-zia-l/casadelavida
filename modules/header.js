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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', "/": '&#x2F;' };
    const reg = /[&<>"'/]/ig;
    return str.replace(reg, (match) => (map[match]));
};

/**
 * Builds a navigation list from the config array for desktop display.
 * @param {Array} links - Array of link objects.
 * @param {string} alignment - 'left' or 'right'.
 * @returns {string} - HTML string for the <ul>.
 */
const buildNavList = (links) => {
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

    return `<ul class="cdlv-header__list">${listItems}</ul>`;
};

/**
 * Builds the combined list of links specifically for the mobile dropdown drawer.
 */
const buildMobileDrawerList = () => {
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
            
            <!-- LEFT GROUP: Menu Toggle & Desktop Links -->
            <div class="cdlv-header__group cdlv-header__group--left">
                <button class="cdlv-header__toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Toggle Navigation Menu">
                    <span class="cdlv-header__toggle-icon-open" aria-hidden="true"><i class="fa-solid fa-bars"></i></span>
                    <span class="cdlv-header__toggle-icon-close" aria-hidden="true"><i class="fa-solid fa-x"></i></span>
                </button>
                ${buildNavList(config.links.left)}
            </div>

            <!-- CENTER GROUP: Logo -->
            <div class="cdlv-header__group cdlv-header__group--center">
                <a href="${safeLogoUrl}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                    <img src="${safeLogoSrc}" alt="${safeLogoText}" class="cdlv-header__logo-img">
                </a>
            </div>

            <!-- RIGHT GROUP: Account & Cart -->
            <div class="cdlv-header__group cdlv-header__group--right">
                ${buildNavList(config.links.right)}
            </div>

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

    element.innerHTML = generateHeaderHTML();

    // Scroll State Logic
    const handleScroll = () => {
        if (element.classList.contains('is-menu-open')) return;
        if (window.scrollY > 50) {
            element.classList.add('cdlv-header--scrolled');
        } else {
            element.classList.remove('cdlv-header--scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile Menu Interaction
    const menuToggle = element.querySelector('.cdlv-header__toggle');
    const mobileDrawer = element.querySelector('.cdlv-header__mobile-drawer');

    if (menuToggle && mobileDrawer) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            mobileDrawer.setAttribute('aria-hidden', String(isExpanded));
            element.classList.toggle('is-menu-open', !isExpanded);

            if (!isExpanded) {
                element.classList.add('cdlv-header--scrolled');
            } else {
                handleScroll();
            }
            
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', {
                detail: { isOpen: !isExpanded }
            }));
        });
    }
}