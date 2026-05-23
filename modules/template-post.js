/* ==========================================================================
   MODULE: TEMPLATE POST (modules/template-post.js)
   Architecture: Exportable ES Module.
   Performance: Implements RAF-batched DOM updates and lazy-loading.
   SEO & A11y: Fully semantic HTML5 with Schema.org Microdata integration 
   (itemscope/itemprop) for Rich Snippet generation.
   ========================================================================== */

import { buildPath } from '../utils/path.js';
import { initializeComponents } from '../utils/components.js';

const parseAndRouteContent = (rawHTML) => {
    if (typeof rawHTML !== 'string') return '';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');
    
    doc.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
            link.setAttribute('href', buildPath(href));
        }
    });
    
    doc.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.setAttribute('src', buildPath(src));
        }
        
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });

    return doc.body.innerHTML;
};

const defaultConfig = {
    showMetadata: false,
    title: "",
    author: "Casa De La Vida",
    authorAvatar: "assets/images/logo.png", 
    datePublished: "",
    lastUpdated: "",
    shareIcons: [
        { platform: "Twitter", icon: "assets/icons/x.svg" },
        { platform: "Facebook", icon: "assets/icons/facebook.svg" },
        { platform: "LinkedIn", icon: "assets/icons/linkedin.svg" }
    ],
    sections: []
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    const html = `
        <article class="cdlv-template-post" itemscope itemtype="https://schema.org/Article">
            
            ${config.showMetadata ? `
            <header class="cdlv-template-post__header">
                ${config.title ? `<h1 class="cdlv-template-post__main-title" itemprop="headline">${parseAndRouteContent(config.title)}</h1>` : ''}
                
                <div class="cdlv-template-post__meta-bar">
                    <div class="cdlv-template-post__author-lockup">
                        <img src="${buildPath(config.authorAvatar)}" alt="${config.author}" class="cdlv-template-post__author-img" fetchpriority="high" decoding="sync">
                        <div class="cdlv-template-post__author-text">
                            <span class="cdlv-template-post__author-name" itemprop="author">${parseAndRouteContent(config.author)}</span>
                            ${config.datePublished ? `<time class="cdlv-template-post__date" itemprop="datePublished">${parseAndRouteContent(config.datePublished)}</time>` : ''}
                        </div>
                    </div>
                    
                    <div class="cdlv-template-post__share-group">
                        <span class="cdlv-template-post__share-label">Share:</span>
                        ${config.shareIcons.map(social => `
                            <button type="button" class="cdlv-template-post__share-btn" aria-label="Share on ${social.platform}">
                                <img src="${buildPath(social.icon)}" alt="" aria-hidden="true">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </header>
            ` : ''}

            <div class="cdlv-template-post__body">
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

                <div class="cdlv-template-post__content" itemprop="articleBody">
                    ${config.sections && config.sections.length > 0 ? config.sections.map(section => `
                        <section id="${parseAndRouteContent(section.id)}" class="cdlv-template-post__section" tabindex="-1">
                            <h2 class="cdlv-template-post__heading">${parseAndRouteContent(section.title)}</h2>
                            ${section.content ? section.content.map(paragraph => `
                                <div class="cdlv-template-post__text">${parseAndRouteContent(paragraph)}</div>
                            `).join('') : ''}
                        </section>
                    `).join('') : '<p class="cdlv-template-post__text">No content provided.</p>'}
                </div>
            </div>
        </article>
    `;

    node.innerHTML = html;

    initializeComponents(node.querySelector('.cdlv-template-post__content'));

    const sections = node.querySelectorAll('.cdlv-template-post__section');
    const navLinks = node.querySelectorAll('.cdlv-template-post__nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.focus();
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        window.requestAnimationFrame(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('is-active');
                        link.removeAttribute('aria-current');
                    });
                    
                    const activeId = entry.target.getAttribute('id');
                    const activeLink = node.querySelector(`.cdlv-template-post__nav-link[href="#${activeId}"]`);
                    
                    if (activeLink) {
                        activeLink.classList.add('is-active');
                        activeLink.setAttribute('aria-current', 'location');
                        
                        if (window.innerWidth < 1024) {
                            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }
                }
            });
        });
    }, observerOptions);

    sections.forEach(section => scrollObserver.observe(section));

    const sidebar = node.querySelector('.cdlv-template-post__sidebar');
    const globalHeader = document.getElementById('global-header');

    if (globalHeader && sidebar) {
        if (globalHeader.classList.contains('cdlv-header--hidden')) {
            sidebar.classList.add('is-header-hidden');
        }

        const headerObserver = new MutationObserver(() => {
            window.requestAnimationFrame(() => {
                if (globalHeader.classList.contains('cdlv-header--hidden')) {
                    sidebar.classList.add('is-header-hidden');
                } else {
                    sidebar.classList.remove('is-header-hidden');
                }
            });
        });

        headerObserver.observe(globalHeader, { attributes: true, attributeFilter: ['class'] });
    }
};