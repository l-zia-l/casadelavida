/* ==========================================================================
   MODULE: ACCORDION (modules/accordion.js)
   Architecture: Exportable ES Module. 
   Features: Dynamic Main Heading, SEO FAQ Schema, Event Delegation.
   A11y: WCAG compliant with Arrow key navigation.
   Security: DOMPurify-style text sanitization for XSS prevention.
   ========================================================================== */

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const injectFAQSchema = (items) => {
    const existingSchema = document.querySelector('script[data-schema="accordion-faq"]');
    if (existingSchema) return; 

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": sanitizeText(item.title),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": sanitizeText(item.content)
            }
        }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'accordion-faq');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
};

const defaultConfig = {
    mainHeading: "", // Left blank by default so it's strictly opt-in
    mainHeadingLevel: "h2", // Semantic outline level for the main title
    headingLevel: "h3", // Semantic outline level for the accordion triggers
    items: [
        {
            title: "Why 'Casa De La Vida'?",
            content: "Our name translates to 'House of Life'. We chose this because we view wellness not as a quick fix, but as a foundational home you build for your mind and body."
        }
    ]
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    const instanceId = Math.random().toString(36).substring(2, 9);
    
    const H_MAIN = config.mainHeadingLevel;
    const H_TAG = config.headingLevel;

    if (config.items.length > 0) {
        injectFAQSchema(config.items);
    }

    const chevronIcon = `
        <svg class="cdlv-accordion__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    `;

    // 1. Build HTML with Conditional Main Heading
    const mainHeadingHTML = config.mainHeading 
        ? `<${H_MAIN} class="cdlv-accordion__main-heading">${sanitizeText(config.mainHeading)}</${H_MAIN}>` 
        : '';

    const accordionHTML = `
        ${mainHeadingHTML}
        <div class="cdlv-accordion">
            ${config.items.map((item, index) => {
                const btnId = `cdlv-accordion-btn-${instanceId}-${index}`;
                const panelId = `cdlv-accordion-panel-${instanceId}-${index}`;
                return `
                    <div class="cdlv-accordion__item">
                        <${H_TAG} class="cdlv-accordion__heading">
                            <button id="${btnId}" class="cdlv-accordion__trigger" aria-expanded="false" aria-controls="${panelId}">
                                <span class="cdlv-accordion__title">${sanitizeText(item.title)}</span>
                                ${chevronIcon}
                            </button>
                        </${H_TAG}>
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

    // 2. Performant Event Delegation (Click/Enter/Space)
    node.addEventListener('click', (event) => {
        const trigger = event.target.closest('.cdlv-accordion__trigger');
        if (!trigger) return; 

        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = node.querySelector(`#${panelId}`); 

        const activeTrigger = node.querySelector('.cdlv-accordion__trigger[aria-expanded="true"]');
        if (activeTrigger && activeTrigger !== trigger) {
            activeTrigger.setAttribute('aria-expanded', 'false');
            activeTrigger.classList.remove('is-open');
            
            const activePanelId = activeTrigger.getAttribute('aria-controls');
            const activePanel = node.querySelector(`#${activePanelId}`);
            
            setTimeout(() => {
                if(activeTrigger.getAttribute('aria-expanded') === 'false') {
                    activePanel.setAttribute('hidden', 'true');
                }
            }, 300); 
        }

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
            }, 300); 
        }
    });

    // 3. Performant Event Delegation (Arrow Key Navigation)
    node.addEventListener('keydown', (e) => {
        const trigger = e.target.closest('.cdlv-accordion__trigger');
        if (!trigger) return;
        
        const triggers = Array.from(node.querySelectorAll('.cdlv-accordion__trigger'));
        const index = triggers.indexOf(trigger);
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
            e.preventDefault(); 
            triggers[targetIndex].focus();
        }
    });
};