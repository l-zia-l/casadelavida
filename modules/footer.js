/**
 * ==============================================================================
 * MODULE: footer.js
 * Purpose: Generates, sanitizes, and injects the global site footer.
 * Architecture: ES Module exporting a standardized 'init' function for the 
 * dynamic component registry.
 * Security: Utilizes strict DOM textContent sanitization to prevent XSS.
 * Accessibility: WCAG 2.1 AA Compliant. Automated layout-state checking hooks 
 * toggling aria-expanded profiles and shifting button accessibility trees.
 * ==============================================================================
 */
import { buildPath } from '../utils/path.js';


// 1. MODULE CONFIGURATION
const footerConfig = {
  logo: {
    src: buildPath('assets/images/logo.png'),
    url: buildPath('index.html'),
    alt: 'Casa De La Vida | Premium Teas & Wellness Boxes | Tea Delivery | Fresh Honey'
  },
  categories: [
    {
      title: 'Casa De La Vida',
      id: 'col-brand',
      links: [
        { label: 'About Us', url: buildPath('about-us.html') },
        { label: 'Blog', url: buildPath('blog.html') },
        { label: 'Shop All', url: buildPath('shop.html') }
      ]
    },
    {
      title: 'Services',
      id: 'col-services',
      links: [
        { label: 'Wellness Boxes', url: buildPath('shop/wellness-boxes.html') },
        { label: 'Teas & More', url: buildPath('shop/individual-wellness-products.html') },
        { label: 'Accessories', url: buildPath('shop/all-accessories.html') },
        { label: 'Book A Consultation', url: buildPath('appointments.html') }
      ]
    },
    {
      title: 'Account',
      id: 'col-account',
      links: [
        { label: 'My Account', url: buildPath('account/index.html') },
        { label: 'Orders', url: buildPath('account/orders.html') },
        { label: 'Wishlist', url: buildPath('account/wishlist.html') },
        { label: 'Subscriptions', url: buildPath('account/subscriptions.html') }
      ]
    },
    {
      title: 'Local Delivery',
      id: 'col-delivery',
      links: [
        { label: 'Accra, GA', url: buildPath('local-delivery/accra.html') },
        { label: 'Tamale, NR', url: buildPath('local-delivery/tamale.html') }
      ]
    },
    {
      title: 'Help',
      id: 'col-help',
      links: [
        { label: 'Help Center', url: buildPath('help-center.html') },
        { label: 'Shipping & Returns', url: buildPath('legal/shipping-and-returns.html') }
      ]
    },
    {
      title: 'Legal',
      id: 'col-legal',
      links: [
        { label: 'Privacy Policy', url: buildPath('legal/privacy-policy.html') },
        { label: 'Terms of Service', url: buildPath('legal/terms-of-service.html') },
        { label: 'Medical Disclaimer', url: buildPath('legal/medical-disclaimer.html') }
      ]
    }
  ],
  socials: [
    { network: 'Instagram', url: 'https://www.instagram.com/casa_de_la_vida_gh/', iconSrc: buildPath('assets/icons/instagram.svg') },
    { network: 'TikTok', url: 'https://www.tiktok.com/@nurtureher06', iconSrc: buildPath('assets/icons/tiktok.svg') }
  ]
};

// 2. SECURITY UTILITY
const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

// 3. TEMPLATE GENERATOR
const generateFooterHTML = () => {
  const year = new Date().getFullYear();
  
  const columnsHTML = footerConfig.categories.map(category => {
    const safeTitle = sanitizeHTML(category.title);
    const safeId = sanitizeHTML(category.id);
    
    const linksHTML = category.links.map(link => `
      <li class="cdlv-footer-item">
        <a href="${sanitizeHTML(link.url)}" class="cdlv-footer-link">${sanitizeHTML(link.label)}</a>
      </li>
    `).join('');

    return `
      <div class="cdlv-footer-column" id="${safeId}">
        <h3 class="cdlv-footer-heading">
          <button class="cdlv-footer-toggle" aria-expanded="false" aria-controls="${safeId}-list">
            <span class="cdlv-footer-toggle-title">${safeTitle}</span>
            <svg class="cdlv-footer-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </h3>
        <ul class="cdlv-footer-list" id="${safeId}-list" aria-label="${safeTitle}">
          ${linksHTML}
        </ul>
      </div>
    `;
  }).join('');

  const socialsHTML = footerConfig.socials.map(social => `
    <a href="${sanitizeHTML(social.url)}" class="cdlv-footer-social-link" aria-label="${sanitizeHTML(social.network)}" target="_blank" rel="noopener noreferrer">
      <img src="${sanitizeHTML(social.iconSrc)}" alt="" aria-hidden="true" class="cdlv-footer-social-icon" loading="lazy" decoding="async">
    </a>
  `).join('');

  return `
    <div class="cdlv-footer">
      <div class="cdlv-footer-brand-banner">
        <a href="${sanitizeHTML(footerConfig.logo.url)}" class="cdlv-footer-logo-wrapper" aria-label="Casa De La Vida Home">
            <img src="${sanitizeHTML(footerConfig.logo.src)}" alt="${sanitizeHTML(footerConfig.logo.alt)}" loading="lazy" decoding="async">
        </a>
      </div>
      
      <div class="cdlv-footer-inner">
        <nav class="cdlv-footer-nav" aria-labelledby="footer-nav-heading">
          <h2 id="footer-nav-heading" class="visually-hidden">Site Directory</h2>
          ${columnsHTML}
        </nav>
        
        <div class="cdlv-footer-bottom">
          <nav class="cdlv-footer-social-nav" aria-label="Social Media Profiles">
            <div class="cdlv-footer-socials">
              ${socialsHTML}
            </div>
          </nav>
          <p class="cdlv-footer-legal-text">
            &copy; ${year} Casa De La Vida. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

// 4. BEHAVIOR & INTERACTIVE ENGINE
// OPTIMIZATION: Refactored to accept a boolean instead of querying window width directly
const updateAccessibilityState = (container, isDesktop) => {
  const toggles = container.querySelectorAll('.cdlv-footer-toggle');
  const lists = container.querySelectorAll('.cdlv-footer-list');
  
  if (isDesktop) {
    toggles.forEach(toggle => {
      toggle.setAttribute('tabindex', '-1');
      toggle.removeAttribute('aria-expanded');
      toggle.removeAttribute('aria-hidden'); 
    });
    lists.forEach(list => list.removeAttribute('aria-hidden'));
  } else {
    toggles.forEach(toggle => {
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-hidden', 'false');
      
      const isParentActive = toggle.closest('.cdlv-footer-column').classList.contains('is-active');
      toggle.setAttribute('aria-expanded', isParentActive ? 'true' : 'false');
      
      const list = toggle.nextElementSibling;
      if (list) list.setAttribute('aria-hidden', isParentActive ? 'false' : 'true');
    });
  }
};

const attachEvents = (container) => {
  const toggles = container.querySelectorAll('.cdlv-footer-toggle');
  
  // Accordion Logic
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      // Prevent execution if CSS Grid is active
      if (window.matchMedia('(min-width: 992px)').matches) return;
      
      const currentToggle = e.currentTarget;
      const parentCol = currentToggle.closest('.cdlv-footer-column');
      const currentList = currentToggle.nextElementSibling;
      const isExpanded = currentToggle.getAttribute('aria-expanded') === 'true';
      
      toggles.forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const siblingList = t.nextElementSibling;
        if (siblingList) siblingList.setAttribute('aria-hidden', 'true');
        t.closest('.cdlv-footer-column').classList.remove('is-active');
      });

      if (!isExpanded) {
        currentToggle.setAttribute('aria-expanded', 'true');
        if (currentList) currentList.setAttribute('aria-hidden', 'false');
        parentCol.classList.add('is-active');
      }
    });
  });

  // OPTIMIZATION: Replaced 'resize' event with 'matchMedia' listener
  const mediaQuery = window.matchMedia('(min-width: 992px)');
  
  const handleBreakpointChange = (e) => {
    updateAccessibilityState(container, e.matches);
  };

  // Modern syntax for media query listeners
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleBreakpointChange);
  } else {
    // Fallback for older Safari
    mediaQuery.addListener(handleBreakpointChange);
  }

  // Initialize correct state on load
  handleBreakpointChange(mediaQuery);
};

// 5. EXPORT INITIALIZER
export const init = (node) => {
  if (!node) {
    console.error('[Footer Module] Initialization failed: No target node provided.');
    return;
  }
  node.innerHTML = generateFooterHTML();
  attachEvents(node);
};