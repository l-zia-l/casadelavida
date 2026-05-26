/* ==========================================================================
   MODULE: ERROR 404 (modules/error-404.js)
   Architecture: Exportable ES Module.
   Purpose: Renders a clean 404 error message with a return-to-shop CTA.
   Security: Text sanitization for all injected strings to mitigate XSS.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Basic text sanitizer to prevent HTML injection from config strings.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string safe for DOM insertion
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const defaultConfig = {
    heading: "404",
    message: "Oops, seems like you typed the wrong URL.",
    btnText: "Back to the Shop",
    btnLink: "shop.html"
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // Resolve the absolute path for the CTA button
    const safeBtnLink = buildPath(config.btnLink);

    // Using inline flex styles specifically for centering, while inheriting 
    // fluid typography and brand colors directly from global.css tokens.
    const errorHTML = `
        <div class="cdlv-404-wrapper animate-enter" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-height: 50vh; padding: var(--spacing-xl) 0;">
            <h1 class="cdlv-404-heading" style="font-size: var(--font-size-h1); color: var(--color-accent); margin-bottom: var(--spacing-xs);">
                ${sanitizeText(config.heading)}
            </h1>
            <p class="cdlv-404-message" style="font-size: var(--font-size-body); color: var(--color-text-dark); margin-bottom: var(--spacing-lg);">
                ${sanitizeText(config.message)}
            </p>
            <a href="${sanitizeText(safeBtnLink)}" class="cdlv-hero__btn cdlv-hero__btn--primary">
                ${sanitizeText(config.btnText)}
            </a>
        </div>
    `;

    node.innerHTML = errorHTML;
};