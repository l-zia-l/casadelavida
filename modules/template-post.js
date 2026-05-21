/* ==========================================================================
   MODULE: TEMPLATE LEGAL / BLOG LAYOUT (modules/cdlv-template-post.js)
   Architecture: DOM Transclusion Engine. Wraps raw HTML content in a 
                 navigable grid layout. Supports nested modules and dynamic 
                 pathing.
   Security: Sanitizes config inputs. Uses Document Fragments to safely 
             move existing DOM nodes without stringifying/re-parsing them, 
             preventing XSS from the content area.
   Dependencies: 
   - `utils/path.js` (for dynamic image routing)
   - `utils/components.js` (to wake up nested modules)
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { initializeComponents } from '../utils/components.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const defaultConfig = {
    showMeta: false,
    author: "",
    date: "",
    shareUrl: "", // Overrides current URL if provided
    shareTitle: "Casa De La Vida Wellness"
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // 1. SAFELY EXTRACT EXISTING DOM
    // We move the children into a fragment. This empties the node safely 
    // without destroying event listeners or re-parsing HTML strings.
    const fragment = document.createDocumentFragment();
    const sections = [];
    
    while (node.firstChild) {
        const child = node.firstChild;
        // Track valid sections for the sidebar
        if (child.nodeType === 1 && child.classList.contains('cdlv-template-post__section')) {
            sections.push(child);
            // Ensure section has an ID for the anchor links
            if (!child.id) child.id = `section-${Math.random().toString(36).substring(2, 9)}`;
        }
        fragment.appendChild(child);
    }

    // 2. BUILD SIDEBAR NAVIGATION
    const navItemsHTML = sections.map((section, index) => {
        const isActive = index === 0 ? 'is-active' : '';
        const title = section.getAttribute('data-nav-title') || 'Section';
        return `
            <li>
                <a href="#${section.id}" class="cdlv-template-post__nav-link ${isActive}" data-target="${section.id}">
                    ${sanitizeText(title)}
                </a>
            </li>
        `;
    }).join('');

    // 3. BUILD META & SHARE HEADER
    let metaHTML = '';
    if (config.showMeta) {
        const currentUrl = config.shareUrl ? buildPath(config.shareUrl) : window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const encodedTitle = encodeURIComponent(config.shareTitle);
        
        metaHTML = `
            <div class="cdlv-template-post__meta-block">
                <div class="cdlv-template-post__meta-info">
                    ${config.author ? `<span class="cdlv-template-post__author">Words by <strong>${sanitizeText(config.author)}</strong></span>` : ''}
                    ${config.date ? `<span class="cdlv-template-post__date">${sanitizeText(config.date)}</span>` : ''}
                </div>
                <div class="cdlv-template-post__share">
                    <span class="cdlv-template-post__share-label">Share</span>
                    <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)" class="cdlv-template-post__share-link">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" class="cdlv-template-post__share-link">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                </div>
            </div>
        `;
    }

    // 4. ASSEMBLE THE NEW LAYOUT
    node.innerHTML = `
        <div class="cdlv-template-post">
            <aside class="cdlv-template-post__sidebar" aria-label="Document Navigation">
                <nav><ul class="cdlv-template-post__nav-list">${navItemsHTML}</ul></nav>
            </aside>
            <article class="cdlv-template-post__content">
                ${metaHTML}
                <div class="cdlv-template-post__sections-wrapper"></div>
            </article>
        </div>
    `;

    // 5. INJECT CONTENT & RESOLVE PATHS
    const sectionsWrapper = node.querySelector('.cdlv-template-post__sections-wrapper');
    sectionsWrapper.appendChild(fragment); // Re-attach the living DOM nodes

    // Dynamically resolve all images using data-src-relative
    const dynamicImages = sectionsWrapper.querySelectorAll('img[data-src-relative]');
    dynamicImages.forEach(img => {
        const relativePath = img.getAttribute('data-src-relative');
        if (relativePath) {
            img.src = buildPath(relativePath);
            img.removeAttribute('data-src-relative'); // Clean up DOM
        }
    });

    // 6. WAKE UP NESTED MODULES
    // We call the global initialization script specifically on the wrapper 
    // we just built. This ensures nested components (like accordions) initialize.
    initializeComponents(sectionsWrapper);

    // 7. INITIALIZE SCROLL SPY
    setupScrollSpy(node);
};

const setupScrollSpy = (node) => {
    const sections = node.querySelectorAll('.cdlv-template-post__section');
    const navLinks = node.querySelectorAll('.cdlv-template-post__nav-link');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', 
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('is-active'));
                
                const activeId = entry.target.getAttribute('id');
                const activeLink = node.querySelector(`.cdlv-template-post__nav-link[data-target="${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.add('is-active');
                    
                    if (window.innerWidth < 992) {
                        const navContainer = activeLink.closest('.cdlv-template-post__nav-list');
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