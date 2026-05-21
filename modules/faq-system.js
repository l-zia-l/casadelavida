/* ==========================================================================
   MODULE: FAQ SYSTEM (modules/faq-system.js)
   Architecture: History-API driven SPA view router. Renders the main dashboard,
   category drill-downs, search results, and specific answer views dynamically based 
   on URL query parameters.
   Security: DOMPurify-style sanitization for text content.
   Dependencies: Uses path.js for dynamic asset routing (answer images).
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

const highlightKeywords = (text, query) => {
    const safeText = sanitizeText(text);
    const safeQuery = sanitizeText(query).trim();
    if (!safeQuery) return safeText;
    const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return safeText.replace(regex, '<strong class="cdlv-highlight">$1</strong>');
};

const defaultConfig = {
    categories: [
        {
            id: "my-account",
            title: "My Account",
            questions: [
                { 
                    id: "login-help", 
                    title: "How do I log into my account?", 
                    answer: "To log into your account, visit the homepage and click the silhouette icon.", 
                    image: buildPath("assets/images/backgrounds/stock_1.webp"),
                    alt: "Screenshot highlighting the user profile login silhouette icon on the Casa De La Vida homepage" 
                },
                { 
                    id: "update-password", 
                    title: "How do I update my password?", 
                    answer: "Go to your account settings to reset your password securely." 
                },
                { 
                    id: "unsubscribe", 
                    title: "How do I unsubscribe from emails?", 
                    answer: "Click the unsubscribe link at the bottom of any of our promotional emails." 
                },
                { 
                    id: "manage-contacts", 
                    title: "How do I manage my contacts?", 
                    answer: "Visit the address book section in your account dashboard." 
                }
            ]
        }
        // Additional categories map here
    ]
};

export const init = (node, customConfig = {}) => {
    if (node.dataset.initialized === 'true') return;
    node.dataset.initialized = 'true';

    const config = { ...defaultConfig, ...customConfig };
    
    node.setAttribute('data-image-sync', 'true');
    node.classList.add('cdlv-faq');

    const allQuestions = config.categories.flatMap(cat => cat.questions);
    
    // Base path for SEO-friendly "Go Back" routing
    const basePath = window.location.pathname;

    const render = () => {
        const params = new URLSearchParams(window.location.search);
        const answerId = params.get('a');
        const categoryId = params.get('g');
        const searchQuery = params.get('s');
        const showIndex = params.get('index');

        let html = '';

        if (answerId) {
            const question = allQuestions.find(q => q.id === answerId);
            if (question) {
                // [SEO OPTIMIZATION]: Changed <div> to <article> for standalone content.
                // [SEO OPTIMIZATION]: Converted `<button>` to `<a>` so crawlers can navigate back to the hub.
                html = `
                    <article class="cdlv-faq__answer-view">
                        <a href="${basePath}" class="cdlv-faq__btn-back" data-route="back" aria-label="Return to FAQ dashboard">
                            <span aria-hidden="true">←</span> Go Back
                        </a>
                        <h2 class="cdlv-faq__answer-title" tabindex="-1" id="cdlv-focus-target">${sanitizeText(question.title)}</h2>
                        <p>${sanitizeText(question.answer)}</p>
                        ${question.image ? `<img src="${sanitizeText(question.image)}" alt="${sanitizeText(question.alt || question.title)}" class="cdlv-faq__answer-image" loading="lazy" decoding="async">` : ''}
                    </article>
                `;
            }
        } 
        else if (searchQuery) {
            const matches = allQuestions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
            html = `
                <section class="cdlv-faq__list-view">
                    <a href="${basePath}" class="cdlv-faq__btn-back" data-route="back" aria-label="Return to FAQ dashboard">
                        <span aria-hidden="true">←</span> Go Back
                    </a>
                    <h2 tabindex="-1" id="cdlv-focus-target">Search Results for "${sanitizeText(searchQuery)}"</h2>
                    <ul class="cdlv-faq__list">
                        ${matches.map(q => `
                            <li class="cdlv-faq__list-item">
                                <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${highlightKeywords(q.title, searchQuery)}</a>
                            </li>
                        `).join('')}
                    </ul>
                </section>
            `;
        }
        else if (categoryId) {
            const category = config.categories.find(c => c.id === categoryId);
            if (category) {
                html = `
                    <section class="cdlv-faq__list-view">
                        <a href="${basePath}" class="cdlv-faq__btn-back" data-route="back" aria-label="Return to FAQ dashboard">
                            <span aria-hidden="true">←</span> Go Back
                        </a>
                        <h2 tabindex="-1" id="cdlv-focus-target">${sanitizeText(category.title)}</h2>
                        <ul class="cdlv-faq__list">
                            ${category.questions.map(q => `
                                <li class="cdlv-faq__list-item">
                                    <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </section>
                `;
            }
        }
        else if (showIndex) {
            html = `
                <section class="cdlv-faq__list-view">
                    <a href="${basePath}" class="cdlv-faq__btn-back" data-route="back" aria-label="Return to FAQ dashboard">
                        <span aria-hidden="true">←</span> Go Back
                    </a>
                    <h2 tabindex="-1" id="cdlv-focus-target">All Frequently Asked Questions</h2>
                    <ul class="cdlv-faq__list">
                        ${allQuestions.map(q => `
                            <li class="cdlv-faq__list-item">
                                <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                            </li>
                        `).join('')}
                    </ul>
                </section>
            `;
        }
        else {
            // [SEO OPTIMIZATION]: Wrapped the grid in a <nav> since it serves as a directory.
            // Upgraded category titles to <h2> to maintain a strict H1 -> H2 hierarchy 
            // (assuming the page injecting this has an H1).
            html = `
                <nav class="cdlv-faq__grid" aria-label="FAQ Categories">
                    ${config.categories.map(cat => {
                        const topQuestions = cat.questions.slice(0, 3);
                        const hasMore = cat.questions.length > 3;
                        return `
                            <section class="cdlv-faq__category">
                                <h2 class="cdlv-faq__category-title">${sanitizeText(cat.title)}</h2>
                                <ul class="cdlv-faq__list">
                                    ${topQuestions.map(q => `
                                        <li class="cdlv-faq__list-item">
                                            <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                                        </li>
                                    `).join('')}
                                </ul>
                                ${hasMore ? `<a href="?g=${cat.id}" class="cdlv-faq__link cdlv-faq__link--more" data-route="?g=${cat.id}">See more</a>` : ''}
                            </section>
                        `;
                    }).join('')}
                </nav>
                <div class="cdlv-faq__see-all-wrapper">
                    <a href="?index=true" class="cdlv-faq__link cdlv-faq__link--more" data-route="?index=true">See all FAQs</a>
                </div>
            `;
        }

        node.innerHTML = html;
        
        const focusTarget = node.querySelector('#cdlv-focus-target');
        if (focusTarget) {
            setTimeout(() => focusTarget.focus(), 50);
        }

        if (window.initImageRenderer) {
            window.initImageRenderer();
        }
    };

    node.addEventListener('click', (e) => {
        const routeTarget = e.target.closest('[data-route]');
        if (!routeTarget) return;

        e.preventDefault();
        const route = routeTarget.getAttribute('data-route');

        if (route === 'back') {
            const base = window.location.pathname;
            window.history.pushState({ path: base }, '', base);
        } else {
            const newUrl = `${window.location.pathname}${route}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
        
        render(); 
    });

    window.addEventListener('popstate', render);
    render();
};