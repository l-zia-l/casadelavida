/* ==========================================================================
   MODULE: TEMPLATE LEGAL (modules/template-legal.js)
   Architecture: Exportable ES Module. Generates a sidebar-navigated, 
                 highly readable document layout.
   Security: Utilizes a custom DOMParser HTML sanitizer. Strips out all 
             scripts, iframes, and inline event handlers to prevent XSS 
             from custom configs. No local storage usage.
   Performance: Utilizes IntersectionObserver for passive scroll tracking 
                instead of expensive scroll event listeners.
   ========================================================================== */

/**
 * Robust HTML Sanitizer to prevent XSS injection.
 * Parses input into a virtual DOM, removes dangerous tags and attributes, 
 * and returns safe HTML.
 * @param {string} rawHTML - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string safe for insertion
 */
const sanitizeHTML = (rawHTML) => {
    if (typeof rawHTML !== 'string') return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    
    // 1. Remove dangerous elements
    const dangerousTags = doc.querySelectorAll('script, style, iframe, object, embed, applet, form');
    dangerousTags.forEach(el => el.remove());
    
    // 2. Remove dangerous inline attributes (e.g., onclick, javascript: hrefs)
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
        for (let i = el.attributes.length - 1; i >= 0; i--) {
            const attr = el.attributes[i];
            if (attr.name.toLowerCase().startsWith('on') || 
                attr.value.trim().toLowerCase().startsWith('javascript:')) {
                el.removeAttribute(attr.name);
            }
        }
    });
    
    return doc.body.innerHTML;
};

// Default Configuration: Privacy Policy
// Structured this way so developers can easily duplicate this module 
// file for "template-terms.js" or pass overrides via data-config.
const defaultConfig = {
    documentTitle: "Privacy Policy",
    lastUpdated: "May 2026",
    introText: "<p>At Casa De La Vida, we believe that true wellness is rooted in trust. Protecting your personal information is as important to us as the quality of the teas, honey, and wellness rituals we curate for you. This Privacy Policy outlines how we collect, use, and protect your information when you visit our website or purchase from our shop.</p>",
    sections: [
        {
            id: "information-we-collect",
            title: "1. Information We Collect",
            content: `
                <p>To provide you with our curated wellness products and services, we collect information you provide directly to us:</p>
                <ul>
                    <li><strong>Personal Identification:</strong> Your name, shipping address, billing address, phone number, and email address.</li>
                    <li><strong>Transaction Information:</strong> Details about the products you purchase and the history of your orders. Note: We do not store raw credit card or MoMo account numbers; these are handled securely by our payment partners.</li>
                    <li><strong>Communication Data:</strong> Records of your correspondence with our team if you contact us for support or consultations.</li>
                    <li><strong>Usage Data:</strong> Information about how you interact with our website, such as your IP address, browser type, and pages visited, which helps us improve your shopping experience.</li>
                </ul>
            `
        },
        {
            id: "how-we-use-information",
            title: "2. How We Use Your Information",
            content: `
                <p>We use your data with care and purpose:</p>
                <ul>
                    <li><strong>Order Fulfillment:</strong> To process your payment, confirm your order, and deliver your wellness boxes to your doorstep.</li>
                    <li><strong>Customer Support:</strong> To answer your questions, assist with appointments, or handle return/shipping inquiries.</li>
                    <li><strong>Service Optimization:</strong> To analyze site usage, ensuring our shop is fast, functional, and tailored to your needs.</li>
                    <li><strong>Marketing (Optional):</strong> If you subscribe to our newsletter, we use your email to share wellness tips and new arrivals. You can opt out at any time.</li>
                </ul>
            `
        },
        {
            id: "data-protection",
            title: "3. Data Protection & Third Parties",
            content: `
                <p>We are committed to security. Your data is stored using industry-standard cloud database services (Supabase) that provide robust encryption.</p>
                <p>We only share your information when absolutely necessary to serve you:</p>
                <ul>
                    <li><strong>Delivery Partners:</strong> We share your address and phone number with our local courier services to ensure your package reaches you in Accra, Tamale, or elsewhere.</li>
                    <li><strong>Payment Processors:</strong> We share transaction data with secure payment gateways to process your payments.</li>
                    <li><strong>Legal Requirements:</strong> If required by law or to protect our rights and the safety of our community.</li>
                </ul>
                <p>We do not sell your personal information to third parties.</p>
            `
        },
        {
            id: "your-rights",
            title: "4. Your Rights",
            content: `
                <p>Your wellness journey is yours, and so is your data. You have the right to:</p>
                <ul>
                    <li>Access the personal information we hold about you.</li>
                    <li>Request that we correct or update any inaccurate information.</li>
                    <li>Request that we delete your account and personal data (unless we are legally required to keep records of a transaction).</li>
                </ul>
            `
        },
        {
            id: "cookies",
            title: "5. Cookies",
            content: `<p>Our website uses cookies to enhance your browsing experience, remember your cart contents, and ensure our site functions efficiently. You can set your browser to refuse cookies, though this may limit some site features.</p>`
        },
        {
            id: "policy-updates",
            title: "6. Policy Updates",
            content: `<p>As our wellness community grows, we may update this policy. We will post the "Last Updated" date at the top of this page so you are always aware of how we protect your information.</p>`
        },
        {
            id: "contact-us",
            title: "7. Contact Us",
            content: `
                <p>If you have questions, concerns, or requests regarding your personal data, please reach out to us at:</p>
                <p><strong>Email:</strong> support@casadelavida.com<br>
                <strong>Subject:</strong> Data Privacy Inquiry</p>
                <p>By using our website, you agree to the collection and use of information in accordance with this policy.</p>
            `
        }
    ]
};

/**
 * Initializes the document layout and IntersectionObserver.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config to override defaults.
 */
export const init = (node, customConfig = {}) => {
    // Merge provided config with defaults. 
    const config = { ...defaultConfig, ...customConfig };
    
    // Generate navigation list
    const navItemsHTML = config.sections.map((section, index) => {
        const isActive = index === 0 ? 'is-active' : '';
        return `
            <li>
                <a href="#${section.id}" class="cdlv-template-legal__nav-link ${isActive}" data-target="${section.id}">
                    ${sanitizeHTML(section.title)}
                </a>
            </li>
        `;
    }).join('');

    // Generate main content sections
    const contentSectionsHTML = config.sections.map(section => `
        <section id="${section.id}" class="cdlv-template-legal__section">
            <h2 class="cdlv-template-legal__section-title">${sanitizeHTML(section.title)}</h2>
            <div class="cdlv-template-legal__section-body">
                ${sanitizeHTML(section.content)}
            </div>
        </section>
    `).join('');

    // Assemble the full layout
    node.innerHTML = `
        <div class="cdlv-template-legal">
            
            <aside class="cdlv-template-legal__sidebar" aria-label="Document Navigation">
                <nav>
                    <ul class="cdlv-template-legal__nav-list">
                        ${navItemsHTML}
                    </ul>
                </nav>
            </aside>

            <article class="cdlv-template-legal__content">
                <p class="cdlv-template-legal__meta">Last Updated: ${sanitizeHTML(config.lastUpdated)}</p>
                
                <div class="cdlv-template-legal__intro">
                    ${sanitizeHTML(config.introText)}
                </div>

                <div class="cdlv-template-legal__sections-wrapper">
                    ${contentSectionsHTML}
                </div>
            </article>

        </div>
    `;

    // Initialize Intersection Observer for the sticky sidebar navigation
    setupScrollSpy(node);
};

/**
 * Uses IntersectionObserver to highlight the current section in the sidebar.
 * @param {HTMLElement} node - The parent container.
 */
const setupScrollSpy = (node) => {
    const sections = node.querySelectorAll('.cdlv-template-legal__section');
    const navLinks = node.querySelectorAll('.cdlv-template-legal__nav-link');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        // Trigger when the section hits roughly 20% down from the top of the viewport
        rootMargin: '-20% 0px -70% 0px', 
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('is-active'));
                
                // Add active class to corresponding link
                const activeId = entry.target.getAttribute('id');
                const activeLink = node.querySelector(`.cdlv-template-legal__nav-link[data-target="${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('is-active');
                    
                    // On mobile, automatically scroll the horizontal nav list to keep the active item in view
                    if (window.innerWidth < 992) {
                        const navContainer = activeLink.closest('.cdlv-template-legal__nav-list');
                        if (navContainer) {
                            navContainer.scrollTo({
                                left: activeLink.parentElement.offsetLeft - 20,
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
};