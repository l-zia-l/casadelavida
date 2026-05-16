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

// 1. MODULE CONFIGURATION
const footerConfig = {
  logo: {
    src: 'assets/images/logo.png',
    alt: 'Casa De La Vida'
  },
  categories: [
    {
      title: 'Casa De La Vida',
      id: 'col-brand',
      links: [
        { label: 'About Us', url: 'about-us.html' },
        { label: 'Blog', url: 'blog.html' },
        { label: 'Shop All', url: 'shop.html' }
      ]
    },
    {
      title: 'Services',
      id: 'col-services',
      links: [
        { label: 'Wellness Boxes', url: 'shop/wellness-boxes.html' },
        { label: 'Teas & More', url: 'shop/individual-wellness-products.html' },
        { label: 'Accessories', url: 'shop/all-accessories.html' },
        { label: 'Book A Consultation', url: 'appointments.html' }
      ]
    },
    {
      title: 'Account',
      id: 'col-account',
      links: [
        { label: 'My Account', url: 'account/index.html' },
        { label: 'Orders', url: 'account/orders.html' },
        { label: 'Wishlist', url: 'account/wishlist.html' },
        { label: 'Subscriptions', url: 'account/subscriptions.html' }
      ]
    },
    {
      title: 'Local Delivery',
      id: 'col-delivery',
      links: [
        { label: 'Accra, GA', url: 'local-delivery/accra.html' },
        { label: 'Tamale, NR', url: 'local-delivery/tamale.html' }
      ]
    },
    {
      title: 'Help',
      id: 'col-help',
      links: [
        { label: 'Help Center', url: 'help-center.html' },
        { label: 'Shipping & Returns', url: 'legal/shipping-and-returns.html' }
      ]
    },
    {
      title: 'Legal',
      id: 'col-legal',
      links: [
        { label: 'Privacy Policy', url: 'legal/privacy-policy.html' },
        { label: 'Terms of Service', url: 'legal/terms-of-service.html' },
        { label: 'Medical Disclaimer', url: 'legal/medical-disclaimer.html' }
      ]
    }
  ],
  socials: [
    { network: 'Instagram', url: 'https://www.instagram.com/casa_de_la_vida_gh/', iconSrc: 'assets/icons/instagram.svg' },
    { network: 'TikTok', url: 'https://www.tiktok.com/@nurtureher06', iconSrc: 'assets/icons/tiktok.svg' }
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
        <button class="cdlv-footer-toggle" aria-expanded="false" aria-controls="${safeId}-list">
          <span class="cdlv-footer-toggle-title">${safeTitle}</span>
          <svg class="cdlv-footer-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <ul class="cdlv-footer-list" id="${safeId}-list" aria-label="${safeTitle}">
          ${linksHTML}
        </ul>
      </div>
    `;
  }).join('');

  const socialsHTML = footerConfig.socials.map(social => `
    <a href="${sanitizeHTML(social.url)}" class="cdlv-footer-social-link" aria-label="${sanitizeHTML(social.network)}" target="_blank" rel="noopener noreferrer">
      <img src="${sanitizeHTML(social.iconSrc)}" alt="" aria-hidden="true" class="cdlv-footer-social-icon">
    </a>
  `).join('');

  return `
    <div class="cdlv-footer">
      <div class="cdlv-footer-brand-banner">
        <a href="index.html" class="cdlv-footer-logo-wrapper" aria-label="Casa De La Vida Home">
            <img src="${sanitizeHTML(footerConfig.logo.src)}" alt="${sanitizeHTML(footerConfig.logo.alt)}" loading="lazy">
        </a>
      </div>
      
      <div class="cdlv-footer-inner">
        <nav class="cdlv-footer-nav" aria-label="Footer Universal Site Directory">
          ${columnsHTML}
        </nav>
        
        <div class="cdlv-footer-bottom">
          <nav class="cdlv-footer-social-nav" aria-label="Social Media Media Profiles">
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

// 4. BEHAVIOR & INTERACTIVE ACCESSIBILITY ENGINE
const handleAccessibilityLayoutStates = (container) => {
  const toggles = container.querySelectorAll('.cdlv-footer-toggle');
  const lists = container.querySelectorAll('.cdlv-footer-list');
  
  if (window.innerWidth >= 992) {
    // Desktop: Strip functional context profiles from screen reader processing loops
    toggles.forEach(toggle => {
      toggle.setAttribute('tabindex', '-1');
      toggle.setAttribute('aria-hidden', 'true');
      toggle.removeAttribute('aria-expanded');
    });
    lists.forEach(list => {
      list.removeAttribute('aria-hidden');
    });
  } else {
    // Mobile: Re-engage structural interface constraints
    toggles.forEach(toggle => {
      toggle.setAttribute('tabindex', '0');
      toggle.setAttribute('aria-hidden', 'false');
      
      const isParentActive = toggle.closest('.cdlv-footer-column').classList.contains('is-active');
      toggle.setAttribute('aria-expanded', isParentActive ? 'true' : 'false');
      
      const list = toggle.nextElementSibling;
      if (list) {
        list.setAttribute('aria-hidden', isParentActive ? 'false' : 'true');
      }
    });
  }
};

const attachAccordionEvents = (container) => {
  const toggles = container.querySelectorAll('.cdlv-footer-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth >= 992) return;
      
      const currentToggle = e.currentTarget;
      const parentCol = currentToggle.closest('.cdlv-footer-column');
      const currentList = currentToggle.nextElementSibling;
      const isExpanded = currentToggle.getAttribute('aria-expanded') === 'true';
      
      // Close open accordion panels to maintain focus structural symmetry
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

  // Attach execution hooks monitoring viewport updates
  window.addEventListener('resize', () => handleAccessibilityLayoutStates(container));
};

// 5. EXPORT INITIALIZER
export const init = (node) => {
  if (!node) {
    console.error('[Footer Module] Initialization failed: No target node provided.');
    return;
  }
  node.innerHTML = generateFooterHTML();
  attachAccordionEvents(node);
  handleAccessibilityLayoutStates(node);
};