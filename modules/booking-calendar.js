/* ==========================================================================
   MODULE: BOOKING CALENDAR (modules/booking-calendar.js)
   Architecture: Exportable ES Module. Generates a typography header and a 
   secure, embedded iframe for Google Calendar Appointment Scheduling.
   Security: Implements DOMPurify-style text sanitization. Strict sandbox 
   attributes on the iframe prevent top-level navigation hijacks.
   Performance: Injects a visual loading state that gracefully fades out 
   once the iframe's 'load' event fires, preventing UI jumping.
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Default configuration with intro text and secure embed URL
const defaultConfig = {
    title: "Reserve Your Session",
    subtitle: "Select a time below that works best for you. Our holistic wellness experts are ready to guide your journey.",
    embedUrl: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2iPmREpefA6sAGRzD4I22TnWh-yBb0yYdIG6atBuPYAvAIUuulAgj4szAhIH2MwqMltEtuKLXI",
    loadingText: "Loading calendar..."
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // Generate a unique ID for this instance
    const instanceId = Math.random().toString(36).substring(2, 9);
    const iframeId = `cdlv-calendar-iframe-${instanceId}`;

    // 1. Build HTML string (Strictly semantic, fluid container)
    // Sandbox settings: allow-scripts, allow-popups, allow-forms, and allow-same-origin 
    // are strictly required for Google Calendar auth and scheduling flows.
    const moduleHTML = `
        <div class="cdlv-booking-module">
            <div class="cdlv-booking-module__header">
                <h2 class="cdlv-booking-module__title">${sanitizeText(config.title)}</h2>
                <p class="cdlv-booking-module__subtitle">${sanitizeText(config.subtitle)}</p>
            </div>
            <div class="cdlv-booking-calendar">
                <div class="cdlv-booking-calendar__loader-wrapper" aria-hidden="true">
                    <div class="cdlv-booking-calendar__loader"></div>
                    <span class="cdlv-booking-calendar__loader-text">${sanitizeText(config.loadingText)}</span>
                </div>
                <iframe 
                    id="${iframeId}"
                    class="cdlv-booking-calendar__iframe" 
                    src="${sanitizeText(config.embedUrl)}" 
                    title="Google Calendar Appointment Scheduling"
                    sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                    loading="lazy">
                </iframe>
            </div>
        </div>
    `;

    // 2. Inject HTML into the target node
    node.innerHTML = moduleHTML;

    // 3. Event Handling (Remove loader smoothly on iframe load)
    const iframeElement = node.querySelector(`#${iframeId}`);
    
    if (iframeElement) {
        iframeElement.addEventListener('load', () => {
            // Adding this class triggers the CSS transition to fade in the iframe 
            // and fade out the loader via the :has() pseudo-class in the CSS.
            requestAnimationFrame(() => {
                iframeElement.classList.add('is-loaded');
            });
        }, { once: true });

        // Fallback: If the iframe fails to load or takes longer than 15 seconds, 
        // reveal it anyway to expose native browser error states to the user.
        setTimeout(() => {
            if (!iframeElement.classList.contains('is-loaded')) {
                iframeElement.classList.add('is-loaded');
            }
        }, 15000);
    }
};