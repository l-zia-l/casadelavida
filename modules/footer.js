/**
 * ==============================================================================
 * MODULE: footer.js
 * Purpose: Generates, sanitizes, and injects the global site footer.
 * Architecture: ES Module exporting a standardized 'init' function for the 
 * dynamic component registry.
 * Security: Utilizes strict DOM textContent sanitization to prevent XSS.
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
    { network: 'Instagram', url: 'https://www.instagram.com/casa_de_la_vida_gh/', svg: '<svg viewBox="0 0 24 24" class="cdlv-footer-social-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>' },
    { network: 'TikTok', url: 'https://www.tiktok.com/@nurtureher06', svg: '<svg viewBox="0 0 24 24" class="cdlv-footer-social-icon"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z"/></svg>' }
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
      <li>
        <a href="${sanitizeHTML(link.url)}" class="cdlv-footer-link">${sanitizeHTML(link.label)}</a>
      </li>
    `).join('');

    return `
      <div class="cdlv-footer-column" id="${safeId}">
        <button class="cdlv-footer-toggle" aria-expanded="false" aria-controls="${safeId}-list">
          <span>${safeTitle}</span>
          <svg class="cdlv-footer-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <ul class="cdlv-footer-list" id="${safeId}-list">
          ${linksHTML}
        </ul>
      </div>
    `;
  }).join('');

  const socialsHTML = footerConfig.socials.map(social => `
    <a href="${sanitizeHTML(social.url)}" class="cdlv-footer-social-link" aria-label="${sanitizeHTML(social.network)}" target="_blank" rel="noopener noreferrer">
      ${social.svg}
    </a>
  `).join('');

  return `
    <div class="cdlv-footer">
      <div class="container-fluid cdlv-footer-inner">
        <div class="cdlv-footer-brand">
          <div class="cdlv-footer-logo-wrapper">
             <img src="${sanitizeHTML(footerConfig.logo.src)}" alt="${sanitizeHTML(footerConfig.logo.alt)}" loading="lazy">
          </div>
        </div>
        
        <nav class="cdlv-footer-nav" aria-label="Footer Navigation">
          ${columnsHTML}
        </nav>
        
        <div class="cdlv-footer-bottom">
          <div class="cdlv-footer-socials">
            ${socialsHTML}
          </div>
          <p class="cdlv-footer-legal-text">
            &copy; ${year} Casa De La Vida. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  `;
};

// 4. BEHAVIOR LOGIC
const attachAccordionEvents = (container) => {
  const toggles = container.querySelectorAll('.cdlv-footer-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth >= 992) return;
      
      const parentCol = e.currentTarget.closest('.cdlv-footer-column');
      const isExpanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
      
      toggles.forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        t.closest('.cdlv-footer-column').classList.remove('is-active');
      });

      if (!isExpanded) {
        e.currentTarget.setAttribute('aria-expanded', 'true');
        parentCol.classList.add('is-active');
      }
    });
  });
};

// 5. EXPORT INITIALIZER (Updated for Component Registry)
export const init = (node) => {
  if (!node) {
    console.error('[Footer Module] Initialization failed: No target node provided.');
    return;
  }

  // Inject HTML directly into the dynamically discovered node
  node.innerHTML = generateFooterHTML();
  
  // Attach Logic scoped only to this specific node instance
  attachAccordionEvents(node);
};