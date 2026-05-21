/* ==========================================================================
   MODULE: SEARCH ENGINE (modules/search-engine.js)
   Architecture: Standalone input module. Pushes search parameters to the URL
   to be consumed by other modules (like the FAQ System or Catalog).
   Security: Strict HTML sanitization on query inputs to prevent XSS.
   Scalability: Config-driven dataset array allows scanning any page context.
   ========================================================================== */

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Safe highlight injection logic
const highlightKeywords = (text, query) => {
    const safeText = sanitizeText(text);
    const safeQuery = sanitizeText(query).trim();
    if (!safeQuery) return safeText;
    
    // Escape regex chars
    const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Inject bold highlighting safely
    return safeText.replace(regex, '<strong class="cdlv-highlight">$1</strong>');
};

const defaultConfig = {
    placeholder: "Search FAQs...",
    dataset: [] // Array of { title: "", id: "", category: "" }
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    const html = `
        <form class="cdlv-search" action="" role="search">
            <input 
                type="search" 
                class="cdlv-search__input" 
                placeholder="${sanitizeText(config.placeholder)}" 
                aria-label="Search"
            >
            <div class="cdlv-search__dropdown" hidden aria-live="polite">
                <ul class="cdlv-search__suggestions"></ul>
            </div>
        </form>
    `;
    
    node.innerHTML = html;
    
    const form = node.querySelector('form');
    const input = node.querySelector('.cdlv-search__input');
    const dropdown = node.querySelector('.cdlv-search__dropdown');
    const suggestionsList = node.querySelector('.cdlv-search__suggestions');
    
    // Real-time suggestions
    input.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        const words = value.split(/\s+/);
        
        // Trigger only when the second word starts (or > 3 chars for single words)
        if (words.length >= 2 || value.length >= 3) {
            const matches = config.dataset.filter(item => 
                item.title.toLowerCase().includes(value.toLowerCase())
            );
            
            if (matches.length > 0) {
                suggestionsList.innerHTML = matches.map(match => `
                    <li class="cdlv-search__item">
                        <a href="?a=${match.id}" class="cdlv-search__link">
                            ${highlightKeywords(match.title, value)}
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
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!node.contains(e.target)) {
            dropdown.setAttribute('hidden', '');
        }
    });
    
    // Handle form submit (Updates URL to ?s=keyword)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (value) {
            dropdown.setAttribute('hidden', '');
            const newUrl = `${window.location.pathname}?s=${encodeURIComponent(value)}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            // Dispatch a custom event so listener modules (like FAQ) can re-render
            window.dispatchEvent(new Event('popstate'));
        }
    });
};