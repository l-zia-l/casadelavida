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
            { label: 'Wellness Routine', url: buildPath('shop/wellness-boxes.html') },
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
    return str.replace(/[&<>"'/]/ig, (match) => map[match]);
};

/**
 * Builds a navigation list from the config array.
 * @param {Array} links - Array of link objects.
 * @param {string} alignment - 'left' or 'right'.
 * @returns {string} - HTML string for the <ul>.
 */
const buildNavList = (links, alignment) => {
    const currentPath = window.location.pathname;

    const listItems = links.map(link => {
        let displayClass = link.desktopOnly ? 'cdlv-header__item--desktop-only' : 
                           link.mobileOnly ? 'cdlv-header__item--mobile-only' : '';
        
        const cartClass = link.isCart ? 'cdlv-header__link--cart' : '';
        const cartDataAttr = link.isCart ? 'data-cart-toggle="true"' : '';
        
        const isCurrentPage = currentPath.includes(link.url) || (currentPath === '/' && link.url === 'index.html');
        const ariaCurrent = isCurrentPage ? 'aria-current="page"' : '';
        
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
    
    return `
        <nav class="cdlv-header__nav" aria-label="Primary Navigation">
            <button class="cdlv-header__toggle" aria-expanded="false" aria-controls="mobile-menu">
                <img src="${buildPath('assets/icons/bars.svg')}" alt="" aria-hidden="true" class="cdlv-header__menu-icon">
                <span>Menu</span>
            </button>

            ${buildNavList(config.links.left, 'left')}

            <a href="${sanitizeData(config.logo.url)}" class="cdlv-header__logo-link" aria-label="${safeLogoText} Home">
                <img src="${sanitizeData(config.logo.src)}" alt="" aria-hidden="true" class="cdlv-header__logo-img" fetchpriority="high" loading="eager">
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

    element.innerHTML = generateHeaderHTML();

    let currentTheme = 'light';
    const menuToggle = element.querySelector('.cdlv-header__toggle');

    const evaluateHeaderTheme = () => {
        const isScrolled = window.scrollY > 50;
        const isMenuOpen = element.classList.contains('cdlv-header--menu-open');

        if (!isScrolled && !isMenuOpen && currentTheme === 'dark') {
            element.classList.add('cdlv-header--inverted');
        } else {
            element.classList.remove('cdlv-header--inverted');
        }
    };

    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const isMenuOpen = element.classList.contains('cdlv-header--menu-open');

                element.classList.toggle('cdlv-header--scrolled', currentScrollY > 50);
                evaluateHeaderTheme(); 

                const heroSection = document.querySelector('[data-module^="hero"]');
                const hideThreshold = heroSection ? heroSection.offsetHeight : 500;

                if (currentScrollY > hideThreshold && !isMenuOpen) {
                    if (currentScrollY > lastScrollY) {
                        element.classList.add('cdlv-header--hidden');
                    } else {
                        element.classList.remove('cdlv-header--hidden');
                    }
                } else {
                    element.classList.remove('cdlv-header--hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const closeMobileMenu = () => {
        element.classList.remove('cdlv-header--menu-open');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        evaluateHeaderTheme();
        document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: false } }));
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            element.classList.toggle('cdlv-header--menu-open', !isExpanded);
            evaluateHeaderTheme();
            document.dispatchEvent(new CustomEvent('cdlv:toggleMobileMenu', { detail: { isOpen: !isExpanded } }));
        });
    }

    const navLinks = element.querySelectorAll('.cdlv-header__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (element.classList.contains('cdlv-header--menu-open')) closeMobileMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (element.classList.contains('cdlv-header--menu-open') && !element.contains(e.target)) {
            closeMobileMenu();
        }
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

    const themeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                currentTheme = entry.target.getAttribute('data-theme') || 'light';
                evaluateHeaderTheme();
            }
        });
    }, { rootMargin: '-50px 0px -95% 0px' });

    const initialSection = document.querySelector('[data-theme]');
    if (initialSection) {
        currentTheme = initialSection.getAttribute('data-theme') || 'light';
        evaluateHeaderTheme();
    }

    document.querySelectorAll('[data-theme]').forEach(section => themeObserver.observe(section));
}