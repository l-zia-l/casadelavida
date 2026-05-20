/* ==========================================================================
   JS BLOCK: ARTICLE FEED (modules/article-feed.js)
   Architecture: Exportable ES Module handling dynamic fragment injection.
   Security: Utilizes a sanitization helper to strip potentially malicious
             HTML strings from config data, preventing XSS.
   Performance: Implements data-image-sync on the root container to interface
                with the global image engine for grouped lazy-loading/reveals.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Strips HTML tags from strings to prevent XSS injection via configs.
 * @param {string} str - The raw string to sanitize.
 * @returns {string} - Clean text content.
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const sanitizeHeadingLevel = (level) => {
    const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    return validHeadings.includes(level) ? level : 'h2';
};

const defaultConfig = {
    heading: "All Posts",
    headingLevel: "h2", 
    articleHeadingLevel: "h3", 
    isPriority: false,
    articles: [
        {
            title: "The Art of the Morning Ritual",
            date: "2026-05-15", // ISO 8601 format for search engines
            displayDate: "May 15, 2026", // Human-readable format
            image: "assets/images/blog/morning-ritual.jpg",
            imageAlt: "A steaming cup of tea next to a wellness journal",
            link: "blog/post_1.html",
            tags: ["Wellness", "Routines"]
        }
    ]
};

/**
 * Initializes the article feed module, merging configs and injecting the DOM.
 * @param {HTMLElement} node - The target container.
 * @param {Object} customConfig - User-provided configuration.
 */
export const init = (node, customConfig = {}) => {
    if (customConfig.articles && !Array.isArray(customConfig.articles)) {
        console.error("Article Feed: 'articles' config must be an array.");
        customConfig.articles = defaultConfig.articles;
    }

    const config = { ...defaultConfig, ...customConfig };
    const MainHeadingTag = sanitizeHeadingLevel(config.headingLevel);
    const ArticleHeadingTag = sanitizeHeadingLevel(config.articleHeadingLevel);

    node.setAttribute('data-image-sync', 'true');

    const moduleHTML = `
        <section class="cdlv-article-feed" aria-labelledby="article-feed-heading">
            ${config.heading ? `
                <${MainHeadingTag} id="article-feed-heading" class="cdlv-article-feed__heading">
                    ${sanitizeText(config.heading)}
                </${MainHeadingTag}>
            ` : ''}
            
            <ul class="cdlv-article-feed__list">
                ${config.articles.map((article, index) => {
                    const isLcpElement = config.isPriority && index === 0;
                    const loadingAttr = isLcpElement ? 'eager' : 'lazy';
                    const fetchPriority = isLcpElement ? 'fetchpriority="high"' : '';
                    
                    return `
                    <li class="cdlv-article-feed__item">
                        <article class="cdlv-article-feed__article">
                            
                            <div class="cdlv-article-feed__image-wrapper u-img-loader" aria-hidden="true">
                                <img 
                                    src="${buildPath(sanitizeText(article.image))}" 
                                    alt="${sanitizeText(article.imageAlt || '')}" 
                                    class="cdlv-article-feed__image u-img-reveal"
                                    width="800" 
                                    height="450"
                                    loading="${loadingAttr}"
                                    ${fetchPriority}
                                />
                            </div>

                            <div class="cdlv-article-feed__content">
                                <!-- SEO: Time element with machine-readable datetime -->
                                ${article.date ? `
                                    <time datetime="${sanitizeText(article.date)}" class="cdlv-article-feed__date">
                                        ${sanitizeText(article.displayDate || article.date)}
                                    </time>
                                ` : ''}

                                <${ArticleHeadingTag} class="cdlv-article-feed__title">
                                    <!-- SEO: rel="bookmark" designates the permalink -->
                                    <a href="${buildPath(sanitizeText(article.link))}" class="cdlv-article-feed__link" rel="bookmark">
                                        ${sanitizeText(article.title)}
                                    </a>
                                </${ArticleHeadingTag}>

                                ${article.tags && article.tags.length > 0 ? `
                                    <ul class="cdlv-article-feed__tags" aria-label="Tags for ${sanitizeText(article.title)}">
                                        ${article.tags.map(tag => `
                                            <li class="cdlv-article-feed__tag">${sanitizeText(tag)}</li>
                                        `).join('')}
                                    </ul>
                                ` : ''}
                            </div>

                        </article>
                    </li>
                `}).join('')}
            </ul>
        </section>
    `;

    node.innerHTML = moduleHTML;
};