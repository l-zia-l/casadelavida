/* ==========================================================================
   MODULE: BOOKING CALENDAR (modules/booking-calendar.js)
   Architecture: Exportable ES Module.
   SEO & Semantics: Utilizes HTML5 <section> and <header> tags. Employs 
   aria-labelledby for structural binding. Injects a visually hidden fallback 
   anchor link to ensure search engine crawlers can map the booking intent 
   even if they de-prioritize iframe contents.
   ========================================================================== */

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const defaultConfig = {
    headingLevel: "h2", // Strictly parameterized to maintain H1-H6 SEO flow
    title: "Reserve Your Session",
    subtitle: "Select a time below that works best for you. Our holistic wellness experts are ready to guide your journey.",
    iframeTitle: "Interactive Booking Calendar",
    embedUrl: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2iPmREpefA6sAGRzD4I22TnWh-yBb0yYdIG6atBuPYAvAIUuulAgj4szAhIH2MwqMltEtuKLXI",
    loadingText: "Loading calendar...",
    isPriority: false 
};

const establishPreconnect = (domain) => {
    if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous'; 
        document.head.appendChild(link);
    }
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    const calendarOrigin = new URL(config.embedUrl).origin;
    establishPreconnect(calendarOrigin);

    const instanceId = Math.random().toString(36).substring(2, 9);
    const iframeId = `cdlv-calendar-iframe-${instanceId}`;
    const headingId = `cdlv-calendar-heading-${instanceId}`;

    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const HeadingTag = validHeadings.includes(config.headingLevel) ? config.headingLevel : 'h2';

    const loadingAttribute = config.isPriority ? 'eager' : 'lazy';
    const fetchPriority = config.isPriority ? 'high' : 'auto';

    // 1. Semantic Upgrade: Use <section> and <header>.
    // 2. SEO Fix: Add a visually-hidden anchor tag so crawlers can map the destination URL.
    const moduleHTML = `
        <section class="cdlv-booking-module" aria-labelledby="${headingId}">
            <header class="cdlv-booking-module__header">
                <${HeadingTag} id="${headingId}" class="cdlv-booking-module__title">${sanitizeText(config.title)}</${HeadingTag}>
                <p class="cdlv-booking-module__subtitle">${sanitizeText(config.subtitle)}</p>
            </header>
            
            <div class="cdlv-booking-calendar">
                <a href="${sanitizeText(config.embedUrl)}" class="visually-hidden" target="_blank" rel="noopener noreferrer">
                    Open ${sanitizeText(config.title)} Booking Page
                </a>
                
                <div class="cdlv-booking-calendar__loader-wrapper" role="status" aria-live="polite">
                    <div class="cdlv-booking-calendar__loader"></div>
                    <span class="cdlv-booking-calendar__loader-text">${sanitizeText(config.loadingText)}</span>
                </div>
                
                <iframe 
                    id="${iframeId}"
                    class="cdlv-booking-calendar__iframe" 
                    src="${sanitizeText(config.embedUrl)}" 
                    title="${sanitizeText(config.iframeTitle)}"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                    loading="${loadingAttribute}"
                    fetchpriority="${fetchPriority}">
                </iframe>
            </div>
        </section>
    `;

    node.innerHTML = moduleHTML;

    const iframeElement = node.querySelector(`#${iframeId}`);
    
    if (iframeElement) {
        iframeElement.addEventListener('load', () => {
            requestAnimationFrame(() => {
                iframeElement.classList.add('is-loaded');
            });
        }, { once: true });

        setTimeout(() => {
            if (!iframeElement.classList.contains('is-loaded')) {
                requestAnimationFrame(() => {
                    iframeElement.classList.add('is-loaded');
                });
            }
        }, 15000);
    }
};