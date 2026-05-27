/* ==========================================================================
   MODULE: MULTI-STEP SIGN-UP (modules/sign-up.js)
   Architecture: Exportable ES Module acting as an internal state machine.
   Performance: Uses requestAnimationFrame for DOM batching, prevents memory leaks.
   Layout: Fluidly stacks beneath previous DOM elements without rigid 100vh wrappers.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

let countdownInterval = null; 

const sanitizerNode = document.createElement('div');
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    sanitizerNode.textContent = str;
    return sanitizerNode.innerHTML;
};

// --- VALIDATION ENGINE ---
const validateName = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Please enter your name.";
    if (!/^[\p{L}\s'.-]+$/u.test(trimmed)) return "Please use only letters, spaces, or hyphens.";
    if (trimmed.split(/\s+/).length < 2) return "Please enter your full name (first and last).";
    return null;
};

const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "An email address is required for your account.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email address (e.g., you@example.com).";
    return null;
};

const validatePassword = (val) => {
    if (val.length < 8) return "Your password must be at least 8 characters long.";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$/.test(val)) return "Please include at least one letter and one number for security.";
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

const defaultConfig = {
    step1: {
        title: "Begin Your Wellness Routine", 
        subtitle: "Create an account to curate your wellness journeys, track seasonal honey harvests, and manage your subscriptions.",
        buttonText: "Continue to Verification",
        loginUrl: "auth/login.html" 
    },
    step2: {
        title: "Verify Your Email", 
        subtitle: "To secure your personal wellness dashboard, we have sent a 4-digit verification token to your inbox. Please enter it below.",
        buttonText: "Verify & Activate Account", 
        digitCount: 4
    },
    step3: {
        title: "Welcome to Casa De La Vida", 
        subtitle: "Your account is fully verified and secure. Your personal canvas is ready. From your dashboard, you can now manage your subscription frequencies, save your preferred artisanal tea rituals, and access exclusive wellness consultations.",
        buttonText: "Enter Your Dashboard", 
        redirectUrl: "account/index.html", 
        countdownSeconds: 5
    }
};

const DRAFT_NAME_KEY = 'cdlv_signup_draft_name';
const DRAFT_EMAIL_KEY = 'cdlv_signup_draft_email';

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    let userEmailCache = "";

    if (countdownInterval) clearInterval(countdownInterval);

    const shiftFocusToHeading = (selector) => {
        requestAnimationFrame(() => {
            const heading = node.querySelector(selector);
            if (heading) heading.focus();
        });
    };

    const mountStep1 = () => {
        const conf = config.step1;
        node.innerHTML = `
            <div class="cdlv-auth-step animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="step1-title" tabindex="-1">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                <div class="cdlv-auth__panel">
                    <form class="cdlv-auth__form" id="cdlv-signup-form" novalidate aria-labelledby="step1-title">
                        <div class="cdlv-auth__group">
                            <label for="signup-name" class="visually-hidden">Full Name</label>
                            <input type="text" id="signup-name" class="cdlv-auth__input" placeholder="Name" required minlength="2" maxlength="50" autocomplete="name" aria-describedby="error-signup-name">
                            <span class="cdlv-auth__error" id="error-signup-name" aria-live="polite"></span>
                        </div>
                        <div class="cdlv-auth__group">
                            <label for="signup-email" class="visually-hidden">Email Address</label>
                            <input type="email" id="signup-email" class="cdlv-auth__input" placeholder="you@example.com" required autocomplete="email" aria-describedby="error-signup-email">
                            <span class="cdlv-auth__error" id="error-signup-email" aria-live="polite"></span>
                        </div>
                        <div class="cdlv-auth__group">
                            <label for="signup-password" class="visually-hidden">Create Password</label>
                            <input type="password" id="signup-password" class="cdlv-auth__input" placeholder="Minimum 8 characters" required minlength="8" autocomplete="new-password" aria-describedby="hint-signup-password error-signup-password">
                            <small id="hint-signup-password" class="cdlv-auth__hint">Passwords must contain letters and numbers to protect your account data.</small>
                            <span class="cdlv-auth__error" id="error-signup-password" aria-live="polite"></span>
                        </div>
                        <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(conf.buttonText)}</button>
                    </form>
                    <footer class="cdlv-auth__footer">
                        <p>Already have an account? <a href="${buildPath(sanitizeText(conf.loginUrl))}" class="cdlv-auth__link">Log In</a></p>
                    </footer>
                </div>
            </div>
        `;
        bindStep1Events();
        shiftFocusToHeading('#step1-title');
    };

    const mountStep2 = () => {
        const conf = config.step2;
        const inputsHTML = Array.from({ length: conf.digitCount }).map((_, i) => `
            <input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" required
                   class="cdlv-2fa__input-box" aria-label="Digit ${i + 1} of ${conf.digitCount}" data-index="${i}">
        `).join('');

        node.innerHTML = `
            <div class="cdlv-auth-step animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-auth__title" id="step2-title" tabindex="-1">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                <div class="cdlv-auth__panel">
                    <form class="cdlv-auth__form" id="cdlv-2fa-form" novalidate aria-labelledby="step2-title">
                        <div class="cdlv-2fa__digits" id="cdlv-2fa-container" role="group" aria-label="4-digit verification code">
                            ${inputsHTML}
                        </div>
                        <span class="cdlv-auth__error" id="error-2fa-validation" aria-live="assertive"></span>
                        <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(conf.buttonText)}</button>
                    </form>
                    <footer class="cdlv-auth__footer">
                        <p>Didn't receive the code? <button type="button" id="resend-code" class="cdlv-auth__link">Resend Token</button></p>
                        <p>or <button type="button" id="change-email" class="cdlv-auth__link cdlv-auth__link--muted">Change Email Address</button></p>
                    </footer>
                </div>
            </div>
        `;
        bindStep2Events();
        shiftFocusToHeading('#step2-title');
    };

    const mountStep3 = () => {
        const conf = config.step3;
        let timeLeft = conf.countdownSeconds;
        const resolvedRedirectUrl = buildPath(sanitizeText(conf.redirectUrl));

        node.innerHTML = `
            <div class="cdlv-auth-step cdlv-auth-step--centered animate-enter">
                <header class="cdlv-auth__header">
                    <h2 class="cdlv-welcome__title" id="step3-title" tabindex="-1">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-auth__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                <a href="${resolvedRedirectUrl}" class="cdlv-hero__btn cdlv-hero__btn--primary cdlv-welcome__btn">
                    ${sanitizeText(conf.buttonText)} <span class="cdlv-welcome__countdown" aria-hidden="true">(Redirecting in ${timeLeft}...)</span>
                </a>
            </div>
        `;

        shiftFocusToHeading('#step3-title');

        const countdownSpan = node.querySelector('.cdlv-welcome__countdown');
        
        countdownInterval = setInterval(() => {
            // PERF/MEM: Stop the interval if the user navigated away and the node was destroyed
            if (!document.body.contains(node)) {
                clearInterval(countdownInterval);
                return;
            }

            timeLeft -= 1;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                requestAnimationFrame(() => {
                    if (countdownSpan) countdownSpan.textContent = "(Redirecting...)";
                });
                window.location.href = resolvedRedirectUrl;
            } else {
                requestAnimationFrame(() => {
                    if (countdownSpan) countdownSpan.textContent = `(Redirecting in ${timeLeft}...)`;
                });
            }
        }, 1000);
    };

    // --- EVENT BINDERS ---

    const bindStep1Events = () => {
        const form = node.querySelector('#cdlv-signup-form');
        const nameInput = node.querySelector('#signup-name');
        const emailInput = node.querySelector('#signup-email');
        const passwordInput = node.querySelector('#signup-password');
        
        const nameError = node.querySelector('#error-signup-name');
        const emailError = node.querySelector('#error-signup-email');
        const passwordError = node.querySelector('#error-signup-password');

        const savedName = localStorage.getItem(DRAFT_NAME_KEY);
        const savedEmail = localStorage.getItem(DRAFT_EMAIL_KEY);
        if (savedName) nameInput.value = savedName;
        if (savedEmail) emailInput.value = savedEmail;

        nameInput.addEventListener('input', (e) => localStorage.setItem(DRAFT_NAME_KEY, e.target.value));
        emailInput.addEventListener('input', (e) => localStorage.setItem(DRAFT_EMAIL_KEY, e.target.value));

        nameInput.addEventListener('blur', () => toggleError(nameInput, nameError, validateName(nameInput.value)));
        emailInput.addEventListener('blur', () => toggleError(emailInput, emailError, validateEmail(emailInput.value)));
        passwordInput.addEventListener('blur', () => toggleError(passwordInput, passwordError, validatePassword(passwordInput.value)));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isNameInvalid = toggleError(nameInput, nameError, validateName(nameInput.value));
            const isEmailInvalid = toggleError(emailInput, emailError, validateEmail(emailInput.value));
            const isPasswordInvalid = toggleError(passwordInput, passwordError, validatePassword(passwordInput.value));

            if (isNameInvalid) return shiftFocusToHeading('#signup-name');
            if (isEmailInvalid) return shiftFocusToHeading('#signup-email');
            if (isPasswordInvalid) return shiftFocusToHeading('#signup-password');

            localStorage.removeItem(DRAFT_NAME_KEY);
            localStorage.removeItem(DRAFT_EMAIL_KEY);

            userEmailCache = emailInput.value.trim();
            mountStep2();
        });
    };

    const bindStep2Events = () => {
        const form = node.querySelector('#cdlv-2fa-form');
        const inputBoxes = Array.from(node.querySelectorAll('.cdlv-2fa__input-box'));
        const errorMsg = node.querySelector('#error-2fa-validation');

        inputBoxes.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value !== '' && index < inputBoxes.length - 1) inputBoxes[index + 1].focus();
            });
            input.addEventListener('keydown', (e) => {
                // Handle Backspace logic
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    inputBoxes[index - 1].focus();
                }
                // A11y: Support Left Arrow navigation
                else if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    inputBoxes[index - 1].focus();
                }
                // A11y: Support Right Arrow navigation
                else if (e.key === 'ArrowRight' && index < inputBoxes.length - 1) {
                    e.preventDefault();
                    inputBoxes[index + 1].focus();
                }
            });
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const numericData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, config.step2.digitCount);
                if (!numericData) return;
                numericData.split('').forEach((char, i) => { if (inputBoxes[i]) inputBoxes[i].value = char; });
                inputBoxes[Math.min(numericData.length, config.step2.digitCount - 1)].focus();
            });
            input.addEventListener('focus', () => {
                requestAnimationFrame(() => {
                    errorMsg.classList.remove('is-visible');
                    inputBoxes.forEach(box => {
                        box.classList.remove('has-error');
                        box.removeAttribute('aria-invalid');
                    });
                });
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const token = inputBoxes.map(input => input.value).join('');

            if (token.length < config.step2.digitCount || !/^\d{4}$/.test(token)) {
                requestAnimationFrame(() => {
                    errorMsg.textContent = `Please enter the full ${config.step2.digitCount}-digit token.`;
                    errorMsg.classList.add('is-visible');
                    inputBoxes.forEach(box => {
                        box.classList.add('has-error');
                        box.setAttribute('aria-invalid', 'true');
                    });
                });
                return inputBoxes[0].focus();
            }

            if (token === "0000") {
                requestAnimationFrame(() => {
                    errorMsg.textContent = "That token didn't match. Please check your email and try again.";
                    errorMsg.classList.add('is-visible');
                    inputBoxes.forEach(box => { 
                        box.classList.add('has-error'); 
                        box.setAttribute('aria-invalid', 'true');
                        box.value = ''; 
                    });
                });
                return inputBoxes[0].focus();
            }

            mountStep3(); 
        });

        node.querySelector('#resend-code').addEventListener('click', () => console.log('Resending...'));
        node.querySelector('#change-email').addEventListener('click', mountStep1);
    };

    mountStep1();
    const heading = node.querySelector('#step1-title');
    if (heading) heading.removeAttribute('tabindex');
};