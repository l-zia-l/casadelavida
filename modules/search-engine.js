/* ==========================================================================
   MODULE: SEARCH ENGINE (modules/search-engine.js)
   Architecture: Standalone input module. Pushes search parameters to the URL
   to be consumed by other modules.
   Security: Strict HTML sanitization on query inputs to prevent XSS.
   Dependencies: Uses path.js for dynamic asset routing (cancel.svg, search.svg).
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
    placeholder: "Search FAQs...",
    dataset: [] 
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // Dynamically resolve both icon paths
    const cancelIconPath = buildPath('assets/icons/cancel.svg');
    const searchIconPath = buildPath('assets/icons/search.svg');
    
    const html = `
        <form class="cdlv-search" action="" role="search">
            <div class="cdlv-search__wrapper">
                <div class="cdlv-search__input-group">
                    <input 
                        type="text" 
                        class="cdlv-search__input" 
                        placeholder="${sanitizeText(config.placeholder)}" 
                        aria-label="Search"
                        autocomplete="off"
                    >
                    <button type="button" class="cdlv-search__btn-clear" aria-label="Clear search" hidden>
                        <img src="${sanitizeText(cancelIconPath)}" alt="" class="cdlv-search__icon" aria-hidden="true">
                    </button>
                </div>
                <button type="submit" class="cdlv-search__btn-submit" aria-label="Submit search">
                    <img src="${sanitizeText(searchIconPath)}" alt="" class="cdlv-search__icon" aria-hidden="true">
                </button>
            </div>
            <div class="cdlv-search__dropdown" hidden aria-live="polite">
                <ul class="cdlv-search__suggestions"></ul>
            </div>
        </form>
    `;
    
    node.innerHTML = html;
    
    const form = node.querySelector('form');
    const input = node.querySelector('.cdlv-search__input');
    const clearBtn = node.querySelector('.cdlv-search__btn-clear');
    const dropdown = node.querySelector('.cdlv-search__dropdown');
    const suggestionsList = node.querySelector('.cdlv-search__suggestions');
    
    // Handle Input & Real-time suggestions
    input.addEventListener('input', (e) => {
        const value = e.target.value;
        const trimmedValue = value.trim();
        const words = trimmedValue.split(/\s+/);
        
        if (value.length > 0) {
            clearBtn.removeAttribute('hidden');
        } else {
            clearBtn.setAttribute('hidden', '');
        }
        
        if (words.length >= 2 || trimmedValue.length >= 3) {
            const matches = config.dataset.filter(item => 
                item.title.toLowerCase().includes(trimmedValue.toLowerCase())
            );
            
            if (matches.length > 0) {
                suggestionsList.innerHTML = matches.map(match => `
                    <li class="cdlv-search__item">
                        <a href="?a=${match.id}" class="cdlv-search__link">
                            ${highlightKeywords(match.title, trimmedValue)}
                        </a>
                    </li>
                `).join('');
                dropdown.removeAttribute('hidden');
            } else {
                dropdown.setAttribute('hidden', '');
            }
        } else {
            dropdown.setAttribute('hidden', '');
        }
    });
    
    // Clear Button Logic
    clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.setAttribute('hidden', '');
        dropdown.setAttribute('hidden', '');
        input.focus();
        
        const params = new URLSearchParams(window.location.search);
        if (params.has('s')) {
            const newUrl = window.location.pathname;
            window.history.pushState({ path: newUrl }, '', newUrl);
            window.dispatchEvent(new Event('popstate'));
        }
    });
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!node.contains(e.target)) {
            dropdown.setAttribute('hidden', '');
        }
    });
    
    // Handle form submit (triggers either via "Enter" key or clicking the new Search button)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
            dropdown.setAttribute('hidden', '');
            const newUrl = `${window.location.pathname}?s=${encodeURIComponent(value)}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            window.dispatchEvent(new Event('popstate'));
        }
    });
};