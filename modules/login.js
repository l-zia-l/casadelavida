/* ==========================================================================
   MODULE: LOGIN (modules/login.js)
   Architecture: Exportable ES Module acting as an internal state machine.
   Security: DOMPurify-style text sanitization for XSS prevention.
   Performance: requestAnimationFrame for DOM updates.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

// PERF: Cache a single DOM node for sanitization
const sanitizerNode = document.createElement('div');
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    sanitizerNode.textContent = str;
    return sanitizerNode.innerHTML;
};

// --- VALIDATION ENGINE ---
const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "An email address is required to log in.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address.";
    return null;
};

const validatePassword = (val) => {
    if (val.length === 0) return "Please enter your password.";
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
    title: "Welcome Back",
    subtitle: "Resume your wellness journey and access your curated rituals.",
    googleText: "Continue with Google",
    appleText: "Continue with Apple",
    dividerText: "or log in with email",
    buttonText: "Log In",
    forgotUrl: "auth/reset-password.html",
    signupUrl: "auth/sign-up.html",
    redirectUrl: "account/index.html" // Added redirect URL
};

// SVG Definitions for pristine scaling
const googleIcon = `<svg class="cdlv-oauth-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>`;
const appleIcon = `<svg class="cdlv-oauth-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.79 3.59-.76 1.56.04 2.86.69 3.63 1.83-3.05 1.87-2.52 6.07.45 7.23-.71 1.68-1.57 3.08-2.75 3.87zm-3.69-15.65c.67-1.04 1.15-2.25 1-3.48-1.12.06-2.43.74-3.18 1.65-.63.74-1.2 1.99-1 3.2 1.25.13 2.45-.48 3.18-1.37z" /></svg>`;

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // 1. Mount DOM
    node.innerHTML = `
        <div class="cdlv-auth-step animate-enter">
            <header class="cdlv-auth__header">
                <h2 class="cdlv-auth__title" id="login-title" tabindex="-1">${sanitizeText(config.title)}</h2>
                <p class="cdlv-auth__subtitle">${sanitizeText(config.subtitle)}</p>
            </header>
            
            <div class="cdlv-auth__panel">
                <div class="cdlv-oauth-group">
                    <button class="cdlv-oauth-btn" type="button" id="oauth-google">
                        ${googleIcon} ${sanitizeText(config.googleText)}
                    </button>
                    <button class="cdlv-oauth-btn" type="button" id="oauth-apple">
                        ${appleIcon} ${sanitizeText(config.appleText)}
                    </button>
                </div>

                <div class="cdlv-auth__divider">
                    <span>${sanitizeText(config.dividerText)}</span>
                </div>

                <form class="cdlv-auth__form" id="cdlv-login-form" novalidate aria-labelledby="login-title">
                    <div class="cdlv-auth__group">
                        <label for="login-email" class="visually-hidden">Email Address</label>
                        <input type="email" id="login-email" class="cdlv-auth__input" placeholder="you@example.com" required autocomplete="email" aria-describedby="error-login-email">
                        <span class="cdlv-auth__error" id="error-login-email" aria-live="polite"></span>
                    </div>
                    
                    <div class="cdlv-auth__group">
                        <label for="login-password" class="visually-hidden">Password</label>
                        <input type="password" id="login-password" class="cdlv-auth__input" placeholder="Enter your password" required autocomplete="current-password" aria-describedby="error-login-password">
                        <span class="cdlv-auth__error" id="error-login-password" aria-live="polite"></span>
                        
                        <div class="cdlv-auth__forgot-wrapper">
                            <a href="${buildPath(sanitizeText(config.forgotUrl))}" class="cdlv-auth__link cdlv-auth__link--muted">Forgot?</a>
                        </div>
                    </div>
                    
                    <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(config.buttonText)}</button>
                </form>

                <footer class="cdlv-auth__footer">
                    <p>Don't have an account? <a href="${buildPath(sanitizeText(config.signupUrl))}" class="cdlv-auth__link">Create one</a>.</p>
                </footer>
            </div>
        </div>
    `;

    // 2. Manage A11y Focus
    requestAnimationFrame(() => {
        const heading = node.querySelector('#login-title');
        if (heading) heading.focus();
    });

    // 3. Bind Events
    const form = node.querySelector('#cdlv-login-form');
    const emailInput = node.querySelector('#login-email');
    const passwordInput = node.querySelector('#login-password');
    const emailError = node.querySelector('#error-login-email');
    const passwordError = node.querySelector('#error-login-password');

    emailInput.addEventListener('blur', () => toggleError(emailInput, emailError, validateEmail(emailInput.value)));
    passwordInput.addEventListener('blur', () => toggleError(passwordInput, passwordError, validatePassword(passwordInput.value)));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isEmailInvalid = toggleError(emailInput, emailError, validateEmail(emailInput.value));
        const isPasswordInvalid = toggleError(passwordInput, passwordError, validatePassword(passwordInput.value));

        if (isEmailInvalid) return emailInput.focus();
        if (isPasswordInvalid) return passwordInput.focus();

        // Redirect to the account dashboard upon passing validation
        window.location.href = buildPath(sanitizeText(config.redirectUrl));
    });

    node.querySelector('#oauth-google').addEventListener('click', () => console.log('Google OAuth trigger'));
    node.querySelector('#oauth-apple').addEventListener('click', () => console.log('Apple OAuth trigger'));
    
    // Clean up focus styling post-mount
    const heading = node.querySelector('#login-title');
    if (heading) heading.removeAttribute('tabindex');
};