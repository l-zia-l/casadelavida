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

import { buildPath } from '../utils/path.js';

const config = {
    logo: {
        text: 'Casa De La Vida', 
        src: buildPath('assets/images/logo.png'), 
        url: buildPath('index.html')
    },
    links: {
        left: [
            { label: 'Shop', url: buildPath('shop.html') },
            { label: 'Rituals', url: buildPath('shop/wellness-boxes.html') },
            { label: 'Account', url: buildPath('account/index.html'), mobileOnly: true } 
        ],
        right: [
            { label: 'Account', url: buildPath('account/index.html'), desktopOnly: true },
            { label: 'Cart', url: buildPath('shopping-cart.html'), isCart: true }
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
        // FIX: Added buildPath() to the cart.svg image source
        const content = link.isCart 
        ? `<img src="${buildPath('assets/icons/cart.svg')}" alt="" aria-hidden="true" class="cdlv-header__cart-icon"><span class="visually-hidden">${sanitizeData(link.label)}</span>` 
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
            <button class="cdlv-header__toggle" aria-expanded="false" aria-controls="mobile-menu">
                <img src="${buildPath('assets/icons/bars.svg')}" alt="" aria-hidden="true" class="cdlv-header__menu-icon">
                <span>Menu</span>
            </button>

            ${buildNavList(config.links.left, 'left')}

            <a href="${safeLogoUrl}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                <img src="${safeLogoSrc}" alt="" aria-hidden="true" class="cdlv-header__logo-img" fetchpriority="high" loading="eager">
                <span class="cdlv-header__logo-text">${safeLogoText}</span>
            </a>

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

    // 1. Inject HTML
    element.innerHTML = generateHeaderHTML();

    // 2. State Management for Dynamic Colors
    let currentTheme = 'light';
    const menuToggle = element.querySelector('.cdlv-header__toggle');

    const evaluateHeaderTheme = () => {
        const isScrolled = window.scrollY > 50;
        const isMenuOpen = element.classList.contains('cdlv-header--menu-open');

        // Text becomes white ONLY if:
        // - We haven't scrolled past 50px (header is transparent)
        // - The mobile menu is closed (menu background is white)
        // - The section underneath explicitly requests a 'dark' theme
        if (!isScrolled && !isMenuOpen && currentTheme === 'dark') {
            element.classList.add('cdlv-header--inverted');
        } else {
            element.classList.remove('cdlv-header--inverted');
        }
    };

    // 3. High-Performance Scroll Listener
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                element.classList.toggle('cdlv-header--scrolled', window.scrollY > 50);
                evaluateHeaderTheme(); // Re-evaluate color on scroll
                ticking = false;
            });
            ticking = true;
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 4. Mobile Menu Toggle Logic
    const closeMobileMenu = () => {
        element.classList.remove('cdlv-header--menu-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        evaluateHeaderTheme(); // Re-evaluate color when menu closes
        document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: false } }));
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            element.classList.toggle('cdlv-header--menu-open', !isExpanded);
            evaluateHeaderTheme(); // Re-evaluate color when menu opens
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: !isExpanded } }));
        });
    }

    // 5. UX Fixes (Click outside, Bfcache, Escape key)
    const navLinks = element.querySelectorAll('.cdlv-header__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (element.classList.contains('cdlv-header--menu-open')) closeMobileMenu();
        });
    });

    document.addEventListener('click', (e) => {
        const isMenuOpen = element.classList.contains('cdlv-header--menu-open');
        const isClickInsideHeader = element.contains(e.target);
        if (isMenuOpen && !isClickInsideHeader) closeMobileMenu();
    });

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) closeMobileMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && element.classList.contains('cdlv-header--menu-open')) {
            closeMobileMenu();
            if (menuToggle) menuToggle.focus();
        }
    });

    const desktopBreakpoint = window.matchMedia('(min-width: 992px)');
    desktopBreakpoint.addEventListener('change', (e) => {
        if (e.matches) closeMobileMenu();
    });

    // 6. The Intersection Observer (Watches the sections underneath)
    const themeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Update the theme based on the section hitting the top of the screen
                currentTheme = entry.target.getAttribute('data-theme') || 'light';
                evaluateHeaderTheme();
            }
        });
    }, { 
        // Creates a horizontal trigger line near the top of the viewport
        rootMargin: '-50px 0px -95% 0px' 
    });

    // INSTANT THEME CHECK: Eliminate the load delay (FOUC)
    // Scan the DOM the exact millisecond the header loads
    const initialSection = document.querySelector('[data-theme]');
    if (initialSection) {
        currentTheme = initialSection.getAttribute('data-theme') || 'light';
        evaluateHeaderTheme(); // Force the color instantly before the browser paints
    }

    // Begin observing all theme sections for when the user scrolls
    document.querySelectorAll('[data-theme]').forEach(section => {
        themeObserver.observe(section);
    });
}