/* ==========================================================================
   MODULE: TEMPLATE POST (modules/template-post.js)
   Architecture: Exportable ES Module. Generates a "Clean-Read" layout
   with a sticky document navigator (sidebar) and an optimal reading width
   (max 70 characters per line) for long-form legal and blog content.
   Security: Implements DOMPurify-style text sanitization for all injected
   strings to mitigate XSS vulnerabilities. Configuration accepts an array
   of text blocks to naturally segment paragraphs without requiring raw HTML.
   Dependencies: Relies on utils/components.js for initialization.
   A11y: Semantic <article>, <nav>, and <section> tags. ARIA landmarks
   and smooth scrolling anchor links for accessible keyboard navigation.
   Performance: Utilizes IntersectionObserver for performant scroll-spying
   to highlight active sections in the sidebar without layout thrashing.
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection from config strings.
 * Converts characters like < and > into harmless HTML entities.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Default Configuration: Intentionally blank to enforce data ingestion 
// from the HTML data-config attribute.
const defaultConfig = {
    lastUpdated: "",
    sections: []
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // 1. Build HTML Structure
    const html = `
        <article class="cdlv-template-post">
            <!-- Sidebar Navigation -->
            <aside class="cdlv-template-post__sidebar">
                <div class="cdlv-template-post__sidebar-inner">
                    ${config.lastUpdated ? `<p class="cdlv-template-post__meta">Last Updated: ${sanitizeText(config.lastUpdated)}</p>` : ''}
                    <nav class="cdlv-template-post__nav" aria-label="Document Sections">
                        <ul class="cdlv-template-post__nav-list">
                            ${config.sections && config.sections.length > 0 ? config.sections.map(section => `
                                <li>
                                    <a href="#${sanitizeText(section.id)}" class="cdlv-template-post__nav-link">
                                        ${sanitizeText(section.title)}
                                    </a>
                                </li>
                            `).join('') : ''}
                        </ul>
                    </nav>
                </div>
            </aside>

            <!-- Main Document Content -->
            <div class="cdlv-template-post__content">
                ${config.sections && config.sections.length > 0 ? config.sections.map(section => `
                    <section id="${sanitizeText(section.id)}" class="cdlv-template-post__section">
                        <h2 class="cdlv-template-post__heading">${sanitizeText(section.title)}</h2>
                        ${section.content ? section.content.map(paragraph => `
                            <p class="cdlv-template-post__text">${sanitizeText(paragraph)}</p>
                        `).join('') : ''}
                    </section>
                `).join('') : '<p class="cdlv-template-post__text">No content provided.</p>'}
            </div>
        </article>
    `;

    node.innerHTML = html;

    // 2. Performant Scroll Spying (IntersectionObserver)
    const sections = node.querySelectorAll('.cdlv-template-post__section');
    const navLinks = node.querySelectorAll('.cdlv-template-post__nav-link');

    // RootMargin offset accounts for the sticky header
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('is-active'));

                // Add active class to the currently intersecting section's link
                const activeId = entry.target.getAttribute('id');
                const activeLink = node.querySelector(`.cdlv-template-post__nav-link[href="#${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('is-active');

                    // On mobile, ensure the active link scrolls into view within the horizontal nav
                    if (window.innerWidth < 1024) {
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
};