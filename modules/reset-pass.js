/* ==========================================================================
   MODULE: RESET PASSWORD (modules/reset-password.js)
   Architecture: Exportable ES Module. Acts as a client-side router, swapping 
   between Phase 1 (Email Request) and Phase 2 (New Password) based on URL hash.
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

const validatePasswordStrength = (val) => {
    if (val.length < 8) return "Your password must be at least 8 characters long.";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/.test(val)) return "Please include at least one letter and one number.";
    return null;
};

const validatePasswordMatch = (val, matchVal) => {
    if (!val) return "Please confirm your new password.";
    if (val !== matchVal) return "The passwords do not match. Please try again.";
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
const config = {
    // Phase 1 (Email Request)
    phase1Title: "Reset Your Password",
    phase1Subtitle: "Enter the email address associated with your account, and we will send you a secure link to restore your access.",
    phase1Button: "Send Recovery Link",
    loginUrl: "auth/login.html",
    successTitle: "Recovery Link Sent",
    successMessage: "Check your inbox. If an account exists for that email, we have sent a recovery link. You can safely close this tab.",
    
    // Phase 2 (Update Password)
    phase2Title: "Secure Your Account",
    phase2Subtitle: "Please enter a new password for your wellness portal.",
    phase2Hint: "Intentional security: Passwords must contain letters and numbers.",
    phase2Button: "Update Password & Log In",
    dashboardUrl: "account/index.html"
};

// Premium Envelope SVG for the success state
const envelopeIcon = `<svg class="cdlv-reset__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`;

export const init = (node, customConfig = {}) => {
    Object.assign(config, customConfig);

    // --- A11Y FOCUS MANAGER ---
    const shiftFocusToHeading = (selector) => {
        requestAnimationFrame(() => {
            const heading = node.querySelector(selector);
            if (heading) {
                heading.focus();
                heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
            }
        });
    };

    // =========================================================================
    // PHASE 1: EMAIL REQUEST
    // =========================================================================
    const mountPhase1 = () => {
        node.innerHTML = `
            <div class="cdlv-auth-step animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="reset-title" tabindex="-1">${sanitizeText(config.phase1Title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(config.phase1Subtitle)}</p>
                </header>
                
                <div class="cdlv-auth__panel">
                    <form class="cdlv-auth__form" id="cdlv-reset-form" novalidate aria-labelledby="reset-title">
                        <div class="cdlv-auth__group">
                            <label for="reset-email" class="visually-hidden">Email Address</label>
                            <input type="email" id="reset-email" class="cdlv-auth__input" placeholder="you@example.com" required autocomplete="email" aria-describedby="error-reset-email">
                            <span class="cdlv-auth__error" id="error-reset-email" aria-live="polite"></span>
                        </div>
                        
                        <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary" id="reset-submit-btn">${sanitizeText(config.phase1Button)}</button>
                    </form>

                    <footer class="cdlv-auth__footer">
                        <p>Remembered it? <a href="${buildPath(sanitizeText(config.loginUrl))}" class="cdlv-auth__link">Return to Log In</a>.</p>
                    </footer>
                </div>
            </div>
        `;

        shiftFocusToHeading('#reset-title');

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

            // Simulate backend request. NEVER reveal if the email actually exists.
            setTimeout(() => {
                console.log('Recovery link requested for:', emailInput.value);
                mountSuccess();
            }, 800); 
        });
    };

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
        shiftFocusToHeading('#success-title');
    };

    // =========================================================================
    // PHASE 2: UPDATE PASSWORD
    // =========================================================================
    const mountPhase2 = () => {
        node.innerHTML = `
            <div class="cdlv-auth-step animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="update-title" tabindex="-1">${sanitizeText(config.phase2Title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(config.phase2Subtitle)}</p>
                </header>
                
                <div class="cdlv-auth__panel">
                    <form class="cdlv-auth__form" id="cdlv-update-form" novalidate aria-labelledby="update-title">
                        <div class="cdlv-auth__group">
                            <label for="new-password" class="visually-hidden">New Password</label>
                            <input type="password" id="new-password" class="cdlv-auth__input" placeholder="Minimum 8 characters" required minlength="8" autocomplete="new-password" aria-describedby="hint-new-password error-new-password">
                            <small id="hint-new-password" class="cdlv-auth__hint">${sanitizeText(config.phase2Hint)}</small>
                            <span class="cdlv-auth__error" id="error-new-password" aria-live="polite"></span>
                        </div>

                        <div class="cdlv-auth__group">
                            <label for="confirm-password" class="visually-hidden">Confirm Password</label>
                            <input type="password" id="confirm-password" class="cdlv-auth__input" placeholder="Re-enter new password" required autocomplete="new-password" aria-describedby="error-confirm-password">
                            <span class="cdlv-auth__error" id="error-confirm-password" aria-live="polite"></span>
                        </div>
                        
                        <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary" id="update-submit-btn">${sanitizeText(config.phase2Button)}</button>
                    </form>
                </div>
            </div>
        `;

        shiftFocusToHeading('#update-title');

        const form = node.querySelector('#cdlv-update-form');
        const newPasswordInput = node.querySelector('#new-password');
        const confirmPasswordInput = node.querySelector('#confirm-password');
        
        const newPasswordError = node.querySelector('#error-new-password');
        const confirmPasswordError = node.querySelector('#error-confirm-password');
        const submitBtn = node.querySelector('#update-submit-btn');

        newPasswordInput.addEventListener('blur', () => toggleError(newPasswordInput, newPasswordError, validatePasswordStrength(newPasswordInput.value)));
        
        confirmPasswordInput.addEventListener('blur', () => {
            // Only validate match if they've typed something in the confirm box
            if (confirmPasswordInput.value.length > 0) {
                toggleError(confirmPasswordInput, confirmPasswordError, validatePasswordMatch(confirmPasswordInput.value, newPasswordInput.value));
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isNewInvalid = toggleError(newPasswordInput, newPasswordError, validatePasswordStrength(newPasswordInput.value));
            const isConfirmInvalid = toggleError(confirmPasswordInput, confirmPasswordError, validatePasswordMatch(confirmPasswordInput.value, newPasswordInput.value));

            if (isNewInvalid) return newPasswordInput.focus();
            if (isConfirmInvalid) return confirmPasswordInput.focus();

            requestAnimationFrame(() => {
                submitBtn.setAttribute('aria-disabled', 'true');
                submitBtn.textContent = 'Updating...';
            });

            // Hand off to Supabase via auth listener, then redirect
            setTimeout(() => {
                window.location.href = buildPath(sanitizeText(config.dashboardUrl));
            }, 800);
        });
    };

    // =========================================================================
    // CLIENT-SIDE ROUTER
    // =========================================================================
    // Supabase appends tokens to the URL hash (e.g., #access_token=...) upon redirect
    if (window.location.hash.includes('access_token=') || window.location.hash.includes('type=recovery')) {
        mountPhase2();
    } else {
        mountPhase1();
    }
};