/* ==========================================================================
   MODULE: TEMPLATE POST (modules/template-post.js)
   Architecture: Exportable ES Module. Generates a fluid layout with a 
   synchronized sticky document navigator.
   Security & Routing: Utilizes DOMParser to safely parse HTML from the JSON 
   config. Automatically detects internal links/images and routes them 
   through the global path.js utility.
   Dependencies: Relies on utils/components.js for init, utils/path.js for routing.
   Performance: IntersectionObserver for scroll-spying, MutationObserver for 
   header sync. No layout thrashing.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Parses raw HTML strings, safely applying buildPath to internal assets.
 * Allows authors to use <a>, <strong>, <img> etc., inside the JSON config.
 * @param {string} rawHTML - Raw input string
 * @returns {string} - Processed HTML string ready for injection
 */
const parseAndRouteContent = (rawHTML) => {
    if (typeof rawHTML !== 'string') return '';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    
    // Auto-route internal links
    doc.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Ignore external links, mailto, and anchor hashes
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
            link.setAttribute('href', buildPath(href));
        }
    });
    
    // Auto-route internal images
    doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.setAttribute('src', buildPath(src));
        }
    });

    return doc.body.innerHTML;
};

// Default Configuration: Intentionally blank to enforce data ingestion
const defaultConfig = {
    lastUpdated: "",
    sections: []
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // 1. Build HTML Structure
    const html = `
        <article class="cdlv-template-post">
            <aside class="cdlv-template-post__sidebar">
                <div class="cdlv-template-post__sidebar-inner">
                    ${config.lastUpdated ? `<p class="cdlv-template-post__meta">Last Updated: ${parseAndRouteContent(config.lastUpdated)}</p>` : ''}
                    <nav class="cdlv-template-post__nav" aria-label="Document Sections">
                        <ul class="cdlv-template-post__nav-list">
                            ${config.sections && config.sections.length > 0 ? config.sections.map(section => `
                                <li>
                                    <a href="#${parseAndRouteContent(section.id)}" class="cdlv-template-post__nav-link">
                                        ${parseAndRouteContent(section.title)}
                                    </a>
                                </li>
                            `).join('') : ''}
                        </ul>
                    </nav>
                </div>
            </aside>

            <div class="cdlv-template-post__content">
                ${config.sections && config.sections.length > 0 ? config.sections.map(section => `
                    <section id="${parseAndRouteContent(section.id)}" class="cdlv-template-post__section">
                        <h2 class="cdlv-template-post__heading">${parseAndRouteContent(section.title)}</h2>
                        ${section.content ? section.content.map(paragraph => `
                            <div class="cdlv-template-post__text">${parseAndRouteContent(paragraph)}</div>
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

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('is-active'));
                const activeId = entry.target.getAttribute('id');
                const activeLink = node.querySelector(`.cdlv-template-post__nav-link[href="#${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('is-active');
                    if (window.innerWidth < 1024) {
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => scrollObserver.observe(section));

    // 3. Header Sync (MutationObserver)
    // Synchronizes the mobile sticky nav with the global header's visibility
    const sidebar = node.querySelector('.cdlv-template-post__sidebar');
    const globalHeader = document.getElementById('global-header');

    if (globalHeader && sidebar) {
        const headerObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (globalHeader.classList.contains('cdlv-header--hidden')) {
                        sidebar.classList.add('is-header-hidden');
                    } else {
                        sidebar.classList.remove('is-header-hidden');
                    }
                }
            });
        });
        headerObserver.observe(globalHeader, { attributes: true });
    }
};