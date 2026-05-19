/* ==========================================================================
   MODULE: ACCORDION (modules/accordion.js)
   Architecture: Exportable ES Module. Generates a semantic, accessible 
   accordion using button triggers and ARIA attributes.
   Security: Implements DOMPurify-style text sanitization for all injected 
   strings to mitigate XSS vulnerabilities. No local storage usage. DOMPurify-style text sanitization for XSS prevention.
   Dependencies: Relies on `utils/components.js` for initialization and 
   `components.css` for styling.
   A11y: Full WCAG compliance. Arrow key navigation (Up/Down/Home/End), 
   dynamic aria-expanded toggling, and aria-labelledby region linking.
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

const defaultConfig = {
    items: [
        {
            title: "Why 'Casa De La Vida'?",
            content: "Our name translates to 'House of Life'. We chose this because we view wellness not as a quick fix, but as a foundational home you build for your mind and body."
        }
    ]
};
/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    const chevronIcon = `
        <svg class="cdlv-accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;

    // 1. Build HTML with strict A11y IDs and roles
    const accordionHTML = `
        <div class="cdlv-accordion">
            ${config.items.map((item, index) => {
                const btnId = `cdlv-accordion-btn-${index}`;
                const panelId = `cdlv-accordion-panel-${index}`;
                return `
                    <div class="cdlv-accordion__item">
                        <button id="${btnId}" class="cdlv-accordion__trigger" aria-expanded="false" aria-controls="${panelId}">
                            <span class="cdlv-accordion__title">${sanitizeText(item.title)}</span>
                            ${chevronIcon}
                        </button>
                        <div id="${panelId}" class="cdlv-accordion__panel" role="region" aria-labelledby="${btnId}" hidden>
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

    node.innerHTML = accordionHTML;

    // 2. Attach Logic & Keyboard Management
    const triggers = Array.from(node.querySelectorAll('.cdlv-accordion__trigger'));
    
    triggers.forEach((trigger, index) => {
        // Click / Space / Enter toggle
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const panelId = trigger.getAttribute('aria-controls');
            const panel = node.querySelector(`#${panelId}`);
            
            trigger.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                panel.removeAttribute('hidden');
                requestAnimationFrame(() => {
                    trigger.classList.add('is-open');
                });
            } else {
                trigger.classList.remove('is-open');
                setTimeout(() => {
                    if(trigger.getAttribute('aria-expanded') === 'false') {
                        panel.setAttribute('hidden', 'true');
                    }
                }, 300); // Matches var(--transition-base)
            }
        });

        // WAI-ARIA Arrow Key Navigation
        trigger.addEventListener('keydown', (e) => {
            let targetIndex = null;
            
            if (e.key === 'ArrowDown') {
                targetIndex = (index + 1) % triggers.length;
            } else if (e.key === 'ArrowUp') {
                targetIndex = (index - 1 + triggers.length) % triggers.length;
            } else if (e.key === 'Home') {
                targetIndex = 0;
            } else if (e.key === 'End') {
                targetIndex = triggers.length - 1;
            }

            if (targetIndex !== null) {
                e.preventDefault(); // Prevent page scroll
                triggers[targetIndex].focus();
            }
        });
    });
};