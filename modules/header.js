/* ==========================================================================
   MODULE: HEADER LOGIC (modules/header.js)
   Architecture: ES Module Component
   Purpose: Injects HTML markup, manages scroll state for background styling, 
   and handles mobile menu interactions.
   Security: Uses safe DOM methods (textContent, setAttribute) to prevent 
   XSS when rendering configurable data. No inline event handlers.
   ========================================================================== */

/**
 * Component Configuration
 * Centralized data for easy editing without touching DOM traversal logic.
 */
const config = {
    logoSrc: "/assets/images/logo_small.png",
    logoAlt: "Casa De La Vida Logo",
    leftLinks: [
        { label: "Shop", url: "/shop.html" },
        { label: "Rituals", url: "/blog.html" }
    ],
    rightLinks: [
        { label: "Account", url: "/auth/login.html" }
    ],
    cartLabel: "Cart"
};

/**
 * Security: Sanitizes text input to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} - Sanitized string
 */
const sanitizeText = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Generates the HTML string for the header based on config.
 * @returns {string} HTML markup
 */
const generateTemplate = () => {
    // Build Left Navigation
    const leftNavItems = config.leftLinks.map(link => `
        <li><a href="${sanitizeText(link.url)}" class="cdlv-header__nav-link">${sanitizeText(link.label)}</a></li>
    `).join('');

    // Build Right Navigation (Account usually hidden on mobile, but kept simple here)
    const rightNavItems = config.rightLinks.map(link => `
        <a href="${sanitizeText(link.url)}" class="cdlv-header__nav-link cdlv-hide-mobile">${sanitizeText(link.label)}</a>
    `).join('');

    return `
        <div class="cdlv-header__container container-fluid">
            <!-- Mobile Menu Toggle -->
            <button class="cdlv-header__menu-toggle" aria-label="Toggle Menu" aria-expanded="false">
                <span></span>
                <span></span>
            </button>

            <!-- Left Navigation (Wellness Links) -->
            <nav class="cdlv-header__nav">
                <ul class="cdlv-header__nav-list">
                    ${leftNavItems}
                </ul>
            </nav>

            <!-- Center Logo -->
            <a href="/index.html" class="cdlv-header__logo">
            <img src="${sanitizeText(config.logoSrc)}" alt="${sanitizeText(config.logoAlt)}" class="cdlv-header__logo-img" />
            </a>

            <!-- Right Utilities (Account & Cart) -->
            <div class="cdlv-header__utils">
                ${rightNavItems}
                <button class="cdlv-header__cart-btn" aria-label="Open Cart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
                        <path d="M6 2L3 6v14h18V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
};

/**
 * Initializes the header module.
 * @param {HTMLElement} mountNode - The DOM element to attach the module to.
 */
export function init(mountNode) {
    if (!mountNode) return;

    // Apply base class and structure
    mountNode.classList.add('cdlv-header');
    mountNode.innerHTML = generateTemplate();

    // Cache DOM elements
    const toggleBtn = mountNode.querySelector('.cdlv-header__menu-toggle');
    const headerEl = mountNode;

    // --- Interaction Logic: Scroll State ---
    const handleScroll = () => {
        if (window.scrollY > 50) {
            headerEl.classList.add('cdlv-header--scrolled');
        } else {
            headerEl.classList.remove('cdlv-header--scrolled');
        }
    };

    // Use requestAnimationFrame for performance optimization during scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- Interaction Logic: Mobile Menu ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            headerEl.classList.toggle('cdlv-header--menu-open');
            
            // Prevent body scroll when menu is open
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
}