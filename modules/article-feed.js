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

const defaultConfig = {
    heading: "All Posts",
    articles: [
        {
            title: "The Art of the Morning Ritual",
            image: "assets/images/blog/morning-ritual.jpg",
            imageAlt: "A steaming cup of tea next to a journal",
            link: "blog/post_1.html",
            tags: ["Wellness", "Routines"]
        },
        {
            title: "Why Raw Honey is Liquid Gold",
            image: "assets/images/blog/raw-honey.jpg",
            imageAlt: "Golden raw honey dripping from a wooden dipper",
            link: "blog/post_2.html",
            tags: ["Nutrition", "Sourcing"]
        },
        {
            title: "Holistic Approaches to Feminine Health",
            image: "assets/images/blog/feminine-health.jpg",
            imageAlt: "Botanical herbs spread out on a white surface",
            link: "blog/post_3.html",
            tags: ["Health", "Herbalism"]
        }
    ]
};

/**
 * Initializes the article feed module, merging configs and injecting the DOM.
 * @param {HTMLElement} node - The target container.
 * @param {Object} customConfig - User-provided configuration.
 */
export const init = (node, customConfig = {}) => {
    // Data Validation
    if (customConfig.articles && !Array.isArray(customConfig.articles)) {
        console.error("Article Feed: 'articles' config must be an array.");
        customConfig.articles = defaultConfig.articles;
    }

    const config = { ...defaultConfig, ...customConfig };

    // Set data-image-sync so the global observer (image-render.js)
    // knows to reveal these images together.
    node.setAttribute('data-image-sync', 'true');

    // Build the structural HTML using template literals
    const moduleHTML = `
        <section class="cdlv-article-feed" aria-labelledby="article-feed-heading">
            ${config.heading ? `
                <h2 id="article-feed-heading" class="cdlv-article-feed__heading">
                    ${sanitizeText(config.heading)}
                </h2>
            ` : ''}
            
            <ul class="cdlv-article-feed__list">
                ${config.articles.map(article => `
                    <li class="cdlv-article-feed__item">
                        <article class="cdlv-article-feed__article">
                            
                            <div class="cdlv-article-feed__image-wrapper u-img-loader">
                                <img 
                                    src="${buildPath(sanitizeText(article.image))}" 
                                    alt="${sanitizeText(article.imageAlt)}" 
                                    class="cdlv-article-feed__image u-img-reveal"
                                    loading="lazy"
                                />
                            </div>

                            <div class="cdlv-article-feed__content">
                                <h3 class="cdlv-article-feed__title">
                                    <a href="${buildPath(sanitizeText(article.link))}" class="cdlv-article-feed__link">
                                        ${sanitizeText(article.title)}
                                    </a>
                                </h3>

                                ${article.tags && article.tags.length > 0 ? `
                                    <ul class="cdlv-article-feed__tags" aria-label="Article tags">
                                        ${article.tags.map(tag => `
                                            <li class="cdlv-article-feed__tag">${sanitizeText(tag)}</li>
                                        `).join('')}
                                    </ul>
                                ` : ''}
                            </div>

                        </article>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;

    // Inject fragment into the target node
    node.innerHTML = moduleHTML;
};