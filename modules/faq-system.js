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
                    // Wrap assets in the config with buildPath
                    image: buildPath("assets/images/backgrounds/stock_1.webp") 
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
    const config = { ...defaultConfig, ...customConfig };
    
    node.setAttribute('data-image-sync', 'true');
    node.classList.add('cdlv-faq');

    const allQuestions = config.categories.flatMap(cat => cat.questions);

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
                html = `
                    <div class="cdlv-faq__answer-view">
                        <button class="cdlv-faq__btn-back" data-route="back" aria-label="Go back to FAQ dashboard">
                            <span aria-hidden="true">←</span> Go Back
                        </button>
                        <h2 class="cdlv-faq__answer-title" tabindex="-1" id="cdlv-focus-target">${sanitizeText(question.title)}</h2>
                        <p>${sanitizeText(question.answer)}</p>
                        ${question.image ? `<img src="${sanitizeText(question.image)}" alt="" class="cdlv-faq__answer-image">` : ''}
                    </div>
                `;
                // Note: Image alt is intentionally empty if the image is just decorative context to the text below it.
                // If the image contains vital instructions, it should mirror the text.
            }
        } 
        else if (searchQuery) {
            const matches = allQuestions.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));
            html = `
                <div class="cdlv-faq__list-view">
                    <button class="cdlv-faq__btn-back" data-route="back" aria-label="Go back to FAQ dashboard">
                        <span aria-hidden="true">←</span> Go Back
                    </button>
                    <h2 tabindex="-1" id="cdlv-focus-target">Search Results for "${sanitizeText(searchQuery)}"</h2>
                    <ul class="cdlv-faq__list">
                        ${matches.map(q => `
                            <li class="cdlv-faq__list-item">
                                <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${highlightKeywords(q.title, searchQuery)}</a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        else if (categoryId) {
            const category = config.categories.find(c => c.id === categoryId);
            if (category) {
                html = `
                    <div class="cdlv-faq__list-view">
                        <button class="cdlv-faq__btn-back" data-route="back" aria-label="Go back to FAQ dashboard">
                            <span aria-hidden="true">←</span> Go Back
                        </button>
                        <h2 tabindex="-1" id="cdlv-focus-target">${sanitizeText(category.title)}</h2>
                        <ul class="cdlv-faq__list">
                            ${category.questions.map(q => `
                                <li class="cdlv-faq__list-item">
                                    <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
        }
        else if (showIndex) {
            html = `
                <div class="cdlv-faq__list-view">
                    <button class="cdlv-faq__btn-back" data-route="back" aria-label="Go back to FAQ dashboard">
                        <span aria-hidden="true">←</span> Go Back
                    </button>
                    <h2 tabindex="-1" id="cdlv-focus-target">All Frequently Asked Questions</h2>
                    <ul class="cdlv-faq__list">
                        ${allQuestions.map(q => `
                            <li class="cdlv-faq__list-item">
                                <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        else {
            html = `
                <div class="cdlv-faq__grid">
                    ${config.categories.map(cat => {
                        const topQuestions = cat.questions.slice(0, 3);
                        const hasMore = cat.questions.length > 3;
                        return `
                            <div class="cdlv-faq__category">
                                <h3 class="cdlv-faq__category-title">${sanitizeText(cat.title)}</h3>
                                <ul class="cdlv-faq__list">
                                    ${topQuestions.map(q => `
                                        <li class="cdlv-faq__list-item">
                                            <a href="?a=${q.id}" class="cdlv-faq__link" data-route="?a=${q.id}">${sanitizeText(q.title)}</a>
                                        </li>
                                    `).join('')}
                                </ul>
                                ${hasMore ? `<a href="?g=${cat.id}" class="cdlv-faq__link cdlv-faq__link--more" data-route="?g=${cat.id}">See more</a>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="cdlv-faq__see-all-wrapper">
                    <a href="?index=true" class="cdlv-faq__link cdlv-faq__link--more" data-route="?index=true">See all FAQs</a>
                </div>
            `;
        }

        node.innerHTML = html;
        
        // --- ACCESSIBILITY FOCUS MANAGEMENT ---
        // Find the newly injected heading (if it exists) and shift focus to it
        // so screen readers announce the new context and keyboard users aren't lost.
        const focusTarget = node.querySelector('#cdlv-focus-target');
        if (focusTarget) {
            // We use setTimeout to ensure the DOM has painted before focusing
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