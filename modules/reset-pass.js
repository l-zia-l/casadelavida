/* ==========================================================================
   MODULE: RESET PASSWORD (modules/reset-password.js)
   Architecture: Exportable ES Module. Handles state swapping without redirection.
   Security: DOMPurify-style text sanitization for XSS prevention.
   Performance: requestAnimationFrame for DOM updates. 
   ========================================================================== */

import { buildPath } from '../utils/path.js';

// PERF: Cache a single DOM node for sanitization to prevent memory leaks
const sanitizerNode = document.createElement('div');
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    sanitizerNode.textContent = str;
    return sanitizerNode.innerHTML;
};

// --- VALIDATION ENGINE ---
const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "An email address is required to locate your account.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address.";
    return null;
};

const toggleError = (inputEl, errorEl, errorMessage) => {
    requestAnimationFrame(() => {
        if (errorMessage) {
            errorEl.textContent = errorMessage; 
            errorEl.classList.add('is-visible'); 
            inputEl.classList.add('has-error');
            inputEl.setAttribute('aria-invalid', 'true');
        } else {
            errorEl.textContent = ''; 
            errorEl.classList.remove('is-visible'); 
            inputEl.classList.remove('has-error');
            inputEl.removeAttribute('aria-invalid');
        }
    });
    return !!errorMessage; 
};

// --- CONFIGURATION ---
const defaultConfig = {
    title: "Reset Your Password",
    subtitle: "Enter the email address associated with your account, and we will send you a secure link to restore your access.",
    buttonText: "Send Recovery Link",
    loginUrl: "auth/login.html",
    successTitle: "Recovery Link Sent",
    successMessage: "Check your inbox. If an account exists for that email, we have sent a recovery link. You can safely close this tab."
};

// Premium, scalable Envelope SVG for the success state
const envelopeIcon = `<svg class="cdlv-reset__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`;

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // --- STATE 1: MOUNT RECOVERY FORM ---
    const mountForm = () => {
        node.innerHTML = `
            <div class="cdlv-auth-step animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="reset-title" tabindex="-1">${sanitizeText(config.title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(config.subtitle)}</p>
                </header>
                
                <div class="cdlv-auth__panel">
                    <form class="cdlv-auth__form" id="cdlv-reset-form" novalidate aria-labelledby="reset-title">
                        <div class="cdlv-auth__group">
                            <label for="reset-email" class="visually-hidden">Email Address</label>
                            <input type="email" id="reset-email" class="cdlv-auth__input" placeholder="you@example.com" required autocomplete="email" aria-describedby="error-reset-email">
                            <span class="cdlv-auth__error" id="error-reset-email" aria-live="polite"></span>
                        </div>
                        
                        <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary" id="reset-submit-btn">${sanitizeText(config.buttonText)}</button>
                    </form>

                    <footer class="cdlv-auth__footer">
                        <p>Remembered it? <a href="${buildPath(sanitizeText(config.loginUrl))}" class="cdlv-auth__link">Return to Log In</a>.</p>
                    </footer>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            const heading = node.querySelector('#reset-title');
            if (heading) heading.focus();
        });

        bindFormEvents();
    };

    // --- STATE 2: MOUNT SUCCESS CONFIRMATION ---
    const mountSuccess = () => {
        node.innerHTML = `
            <div class="cdlv-auth-step cdlv-auth-step--centered animate-enter">
                ${envelopeIcon}
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="success-title" tabindex="-1">${sanitizeText(config.successTitle)}</h2>
                    <p class="cdlv-auth__subtitle cdlv-reset__success-text">${sanitizeText(config.successMessage)}</p>
                </header>
                
                <div style="margin-top: var(--spacing-md); width: 100%; max-width: 400px;">
                    <a href="${buildPath(sanitizeText(config.loginUrl))}" class="cdlv-hero__btn cdlv-hero__btn--secondary">Return to Log In</a>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            const heading = node.querySelector('#success-title');
            if (heading) heading.focus();
        });
    };

    // --- EVENT BINDING ---
    const bindFormEvents = () => {
        const form = node.querySelector('#cdlv-reset-form');
        const emailInput = node.querySelector('#reset-email');
        const emailError = node.querySelector('#error-reset-email');
        const submitBtn = node.querySelector('#reset-submit-btn');

        emailInput.addEventListener('blur', () => toggleError(emailInput, emailError, validateEmail(emailInput.value)));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isEmailInvalid = toggleError(emailInput, emailError, validateEmail(emailInput.value));
            if (isEmailInvalid) return emailInput.focus();

            // A11y: Notify screen readers that processing has started
            requestAnimationFrame(() => {
                submitBtn.setAttribute('aria-disabled', 'true');
                submitBtn.textContent = 'Sending...';
            });

            // Simulate backend request to Supabase
            // Replace setTimeout with your actual async fetch call
            setTimeout(() => {
                console.log('Recovery link requested for:', emailInput.value);
                mountSuccess();
            }, 800); 
        });
        
        // Clean up focus styling post-mount
        const heading = node.querySelector('#reset-title');
        if (heading) heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
    };

    // Initialize the module by mounting the form
    mountForm();
};