/* ==========================================================================
   MODULE: SEARCH ENGINE (modules/search-engine.js)
   Architecture: Standalone Spotlight Search. Navigates users directly to 
   product pages, blog posts, or specific FAQ views based on config URLs.
   Security: Strict HTML sanitization on query inputs to prevent XSS.
   Accessibility: WCAG Combobox pattern with live region announcers.
   Performance: Implements input debouncing to protect the main thread, 
   idempotent mounting to prevent memory leaks, and LCP asset prioritization.
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

// [OPTIMIZATION]: A utility to delay expensive operations until the user pauses typing,
// preventing the browser from recalculating layout on every single millisecond keystroke.
const debounce = (func, delay = 200) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
};

const defaultConfig = {
    placeholder: "Search...",
    dataset: [] 
};

export const init = (node, customConfig = {}) => {
    // [OPTIMIZATION]: Idempotent Initialization. Prevents silent memory leaks by 
    // ensuring event listeners are only attached once if the SPA remounts the node.
    if (node.dataset.initialized === 'true') return;
    node.dataset.initialized = 'true';

    const config = { ...defaultConfig, ...customConfig };
    
    const cancelIconPath = buildPath('assets/icons/cancel.svg');
    const searchIconPath = buildPath('assets/icons/search.svg');
    
    const listboxId = `cdlv-search-listbox-${Math.random().toString(36).substr(2, 9)}`;
    const announcerId = `cdlv-search-announcer-${Math.random().toString(36).substr(2, 9)}`;
    
    let currentMatches = [];
    
    const html = `
        <search class="cdlv-search-container">
            <form class="cdlv-search" action="/search" role="search">
                <div class="visually-hidden" aria-live="polite" id="${announcerId}"></div>
                
                <div class="cdlv-search__wrapper">
                    <div class="cdlv-search__input-group">
                        <input 
                            type="search" 
                            name="q"
                            class="cdlv-search__input" 
                            placeholder="${sanitizeText(config.placeholder)}" 
                            aria-label="Search"
                            autocomplete="off"
                            role="combobox"
                            aria-expanded="false"
                            aria-controls="${listboxId}"
                            aria-autocomplete="list"
                        >
                        <button type="button" class="cdlv-search__btn-clear" aria-label="Clear search" hidden>
                            <img src="${sanitizeText(cancelIconPath)}" alt="" class="cdlv-search__icon" aria-hidden="true" loading="lazy" decoding="async">
                        </button>
                    </div>
                    <button type="submit" class="cdlv-search__btn-submit" aria-label="Submit search">
                        <img src="${sanitizeText(searchIconPath)}" alt="" class="cdlv-search__icon" aria-hidden="true" loading="eager" fetchpriority="high" decoding="sync">
                    </button>
                </div>
                <div class="cdlv-search__dropdown" hidden>
                    <ul class="cdlv-search__suggestions" id="${listboxId}" role="listbox" aria-label="Search suggestions"></ul>
                </div>
            </form>
        </search>
    `;
    
    node.innerHTML = html;
    
    const form = node.querySelector('form');
    const input = node.querySelector('.cdlv-search__input');
    const clearBtn = node.querySelector('.cdlv-search__btn-clear');
    const dropdown = node.querySelector('.cdlv-search__dropdown');
    const suggestionsList = node.querySelector('.cdlv-search__suggestions');
    const announcer = node.querySelector(`#${announcerId}`);
    
    const closeDropdown = () => {
        dropdown.setAttribute('hidden', '');
        input.setAttribute('aria-expanded', 'false');
    };

    const openDropdown = () => {
        dropdown.removeAttribute('hidden');
        input.setAttribute('aria-expanded', 'true');
    };

    // [OPTIMIZATION]: Separate the cheap UI updates from the expensive DOM rewriting.
    // The filter and DOM rewrite is wrapped in a debounce so it only fires when the user pauses.
    const executeSearchFiltering = debounce((trimmedValue) => {
        const words = trimmedValue.split(/\s+/);

        if (words.length >= 2 || trimmedValue.length >= 3) {
            currentMatches = config.dataset.filter(item => 
                item.title.toLowerCase().includes(trimmedValue.toLowerCase())
            );
            
            if (currentMatches.length > 0) {
                // [OPTIMIZATION]: Using requestAnimationFrame ensures the DOM update 
                // happens right before the next repaint, preventing forced synchronous layout.
                requestAnimationFrame(() => {
                    suggestionsList.innerHTML = currentMatches.map((match, index) => {
                        const safeUrl = buildPath(sanitizeText(match.url));
                        return `
                            <li class="cdlv-search__item" role="presentation">
                                <a href="${safeUrl}" class="cdlv-search__link" role="option" id="${listboxId}-option-${index}">
                                    ${highlightKeywords(match.title, trimmedValue)}
                                </a>
                            </li>
                        `;
                    }).join('');
                    openDropdown();
                });
                announcer.textContent = `${currentMatches.length} suggestions found. Use up and down arrows to review.`;
            } else {
                closeDropdown();
                announcer.textContent = "No suggestions found.";
            }
        } else {
            currentMatches = [];
            closeDropdown();
            announcer.textContent = "";
        }
    }, 150); // 150ms delay is imperceptible to users but saves dozens of render cycles

    input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Fast UI Update (Synchronous)
        if (value.length > 0) {
            clearBtn.removeAttribute('hidden');
        } else {
            clearBtn.setAttribute('hidden', '');
        }
        
        // Expensive Update (Debounced)
        executeSearchFiltering(value.trim());
    });
    
    node.addEventListener('keydown', (e) => {
        const isOpen = !dropdown.hasAttribute('hidden');
        const links = Array.from(suggestionsList.querySelectorAll('.cdlv-search__link'));
        
        if (e.key === 'Escape' && isOpen) {
            closeDropdown();
            input.focus();
            announcer.textContent = "Search suggestions closed.";
            return;
        }

        if (!isOpen || links.length === 0) return;

        const activeElement = document.activeElement;
        const currentIndex = links.indexOf(activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault(); 
            const nextIndex = (currentIndex + 1) % links.length;
            links[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
            links[prevIndex].focus();
        }
    });

    clearBtn.addEventListener('click', () => {
        input.value = '';
        currentMatches = [];
        clearBtn.setAttribute('hidden', '');
        closeDropdown();
        announcer.textContent = "Search cleared.";
        input.focus();
    });
    
    document.addEventListener('click', (e) => {
        if (!node.contains(e.target)) {
            closeDropdown();
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (currentMatches.length > 0) {
            const firstMatchUrl = buildPath(sanitizeText(currentMatches[0].url));
            window.location.href = firstMatchUrl;
        } else {
            input.focus();
        }
    });
};