/* ==========================================================================
   MODULE: BOOKING CALENDAR (modules/booking-calendar.js)
   Architecture: Exportable ES Module. Generates a secure, embedded iframe 
   for Google Calendar Appointment Scheduling.
   Security: Implements strict sandbox attributes on the iframe to prevent 
   top-level navigation hijack, while allowing necessary scripts and forms.
   Maintains DOMPurify-style text sanitization for architectural consistency.
   Performance: Injects a visual loading state that gracefully fades out 
   once the iframe's 'load' event fires, preventing UI jumping.
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection.
 * Included for architectural consistency even with static configs.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Static configuration as requested. No editable properties exposed.
const staticConfig = {
    embedUrl: "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2iPmREpefA6sAGRzD4I22TnWh-yBb0yYdIG6atBuPYAvAIUuulAgj4szAhIH2MwqMltEtuKLXI",
    loadingText: "Loading calendar..."
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 */
export const init = (node) => {
    // Generate a unique ID for this instance
    const instanceId = Math.random().toString(36).substring(2, 9);
    const iframeId = `cdlv-calendar-iframe-${instanceId}`;

    // 1. Build HTML string (Strictly semantic, no inline styles)
    // Sandbox settings: allow-scripts and allow-forms are required for Google Calendar to function.
    // allow-same-origin is required for the scheduling application to process state.
    // allow-top-navigation is explicitly omitted for security.
    const moduleHTML = `
        <div class="cdlv-booking-calendar">
            <div class="cdlv-booking-calendar__loader-wrapper" aria-hidden="true">
                <div class="cdlv-booking-calendar__loader"></div>
                <span class="cdlv-booking-calendar__loader-text">${sanitizeText(staticConfig.loadingText)}</span>
            </div>
            <iframe 
                id="${iframeId}"
                class="cdlv-booking-calendar__iframe" 
                src="${sanitizeText(staticConfig.embedUrl)}" 
                title="Google Calendar Appointment Scheduling"
                sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
                loading="lazy">
            </iframe>
        </div>
    `;

    // 2. Inject HTML into the target node
    node.innerHTML = moduleHTML;

    // 3. Event Handling (Remove loader on iframe load)
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
        // reveal it anyway to show any potential native browser error states to the user.
        setTimeout(() => {
            if (!iframeElement.classList.contains('is-loaded')) {
                iframeElement.classList.add('is-loaded');
            }
        }, 15000);
    }
};