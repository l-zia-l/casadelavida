/* ==========================================================================
   MODULE: ACCORDION (modules/accordion.js)
   Architecture: Exportable ES Module. Generates a semantic, accessible 
   accordion using button triggers and ARIA attributes.
   Security: Implements DOMPurify-style text sanitization for all injected 
   strings to mitigate XSS vulnerabilities. No local storage usage.
   Dependencies: Relies on `utils/components.js` for initialization and 
   `components.css` for styling.
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection from config strings.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Default conversational configuration for Modern Heritage branding
const defaultConfig = {
    items: [
        {
            title: "Why 'Casa De La Vida'?",
            content: "Our name translates to 'House of Life'. We chose this because we view wellness not as a quick fix, but as a foundational home you build for your mind and body. Every product is curated to be a structural pillar in that daily routine."
        },
        {
            title: "Where do you source your products?",
            content: "We partner directly with organic farms and ethical apiaries across Ghana. For instance, our honey is harvested seasonally by local beekeepers, ensuring raw, unpasteurized quality that supports both the ecosystem and local economy."
        },
        {
            title: "How does delivery work?",
            content: "We offer seamless local delivery in Accra and Tamale. Orders placed before 1 PM are eligible for same-day dispatch. We package everything in strictly minimalist, zero-waste materials because respecting the earth is part of the wellness cycle."
        }
    ]
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    // Merge defaults with any overrides
    const config = { ...defaultConfig, ...customConfig };

    // Chevron SVG using strict square caps to match 0px radius design
    const chevronIcon = `
        <svg class="cdlv-accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;

    // 1. Build the HTML string safely
    const accordionHTML = `
        <div class="cdlv-accordion" role="presentation">
            ${config.items.map((item, index) => {
                const id = `cdlv-accordion-panel-${index}`;
                return `
                    <div class="cdlv-accordion__item">
                        <button class="cdlv-accordion__trigger" aria-expanded="false" aria-controls="${id}">
                            <span class="cdlv-accordion__title">${sanitizeText(item.title)}</span>
                            ${chevronIcon}
                        </button>
                        <div id="${id}" class="cdlv-accordion__panel" role="region" hidden>
                            <div class="cdlv-accordion__panel-inner">
                                <div class="cdlv-accordion__content">
                                    <p>${sanitizeText(item.content)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // 2. Inject into the DOM
    node.innerHTML = accordionHTML;

    // 3. Attach accessible toggle logic
    const triggers = node.querySelectorAll('.cdlv-accordion__trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const panelId = trigger.getAttribute('aria-controls');
            const panel = node.querySelector(`#${panelId}`);
            
            // Toggle current
            trigger.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                panel.removeAttribute('hidden');
                // Small delay to ensure CSS transitions trigger after hidden is removed
                requestAnimationFrame(() => {
                    trigger.classList.add('is-open');
                });
            } else {
                trigger.classList.remove('is-open');
                // Wait for transition to finish before hiding from screen readers
                setTimeout(() => {
                    if(trigger.getAttribute('aria-expanded') === 'false') {
                        panel.setAttribute('hidden', 'true');
                    }
                }, 300); // Matches var(--transition-base)
            }
        });
    });
};