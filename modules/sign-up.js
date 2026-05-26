/* ==========================================================================
   MODULE: MULTI-STEP SIGN-UP (modules/sign-up.js)
   Architecture: Exportable ES Module acting as an internal state machine.
   Security: 
   - DOMPurify-style text sanitization for XSS prevention.
   - PII memory wiping between state transitions.
   Dependencies: Relies on `utils/components.js` for initialization.
   ========================================================================== */

/**
 * Basic text sanitizer to prevent HTML injection from config strings.
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// --- VALIDATION UTILS ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

const defaultConfig = {
    step1: {
        title: "Begin Your Ritual",
        subtitle: "Create an account to curate your wellness journeys, track seasonal honey harvests, and manage your subscriptions.",
        namePlaceholder: "Name",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Minimum 8 characters",
        passwordHint: "Intentional security: Passwords must contain letters and numbers to protect your account data.",
        buttonText: "Continue to Verification"
    },
    step2: {
        title: "Verify Your Email",
        subtitle: "To secure your personal wellness dashboard, we have sent a 4-digit verification token to your inbox. Please enter it below.",
        buttonText: "Verify & Activate Account",
        digitCount: 4
    }
};

/**
 * Core initialization function triggered by the global component loader.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // State Holder
    let userEmailCache = "";

    // --- STATE MACHINE ROUTERS ---

    const mountStep1 = () => {
        const conf = config.step1;
        node.innerHTML = `
            <div class="cdlv-sign-up cdlv-auth-step">
                <header class="cdlv-sign-up__header">
                    <h2 class="cdlv-sign-up__title">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-sign-up__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                
                <form class="cdlv-sign-up__form" id="cdlv-signup-form" novalidate>
                    <div class="cdlv-sign-up__group">
                        <label for="signup-name" class="visually-hidden">Full Name</label>
                        <input type="text" id="signup-name" class="cdlv-sign-up__input" placeholder="${sanitizeText(conf.namePlaceholder)}" required aria-describedby="error-signup-name">
                        <span class="cdlv-auth__error" id="error-signup-name" aria-live="polite"></span>
                    </div>

                    <div class="cdlv-sign-up__group">
                        <label for="signup-email" class="visually-hidden">Email Address</label>
                        <input type="email" id="signup-email" class="cdlv-sign-up__input" placeholder="${sanitizeText(conf.emailPlaceholder)}" required aria-describedby="error-signup-email">
                        <span class="cdlv-auth__error" id="error-signup-email" aria-live="polite"></span>
                    </div>

                    <div class="cdlv-sign-up__group">
                        <label for="signup-password" class="visually-hidden">Create Password</label>
                        <input type="password" id="signup-password" class="cdlv-sign-up__input" placeholder="${sanitizeText(conf.passwordPlaceholder)}" required aria-describedby="hint-signup-password error-signup-password">
                        <small id="hint-signup-password" class="cdlv-sign-up__hint">${sanitizeText(conf.passwordHint)}</small>
                        <span class="cdlv-auth__error" id="error-signup-password" aria-live="polite"></span>
                    </div>

                    <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(conf.buttonText)}</button>
                </form>

                <footer class="cdlv-sign-up__footer">
                    <p>Already have an account? <a href="login.html" class="cdlv-sign-up__link">Log In</a></p>
                </footer>
            </div>
        `;

        bindStep1Events();
    };

    const mountStep2 = () => {
        const conf = config.step2;
        const inputsHTML = Array.from({ length: conf.digitCount }).map((_, i) => `
            <input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" 
                   class="cdlv-2fa__input-box" aria-label="Digit ${i + 1}" data-index="${i}">
        `).join('');

        node.innerHTML = `
            <div class="cdlv-2fa cdlv-auth-step">
                <header class="cdlv-2fa__header">
                    <h2 class="cdlv-2fa__title">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-2fa__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                
                <form class="cdlv-sign-up__form" id="cdlv-2fa-form" novalidate>
                    <div class="cdlv-2fa__digits" id="cdlv-2fa-container">
                        ${inputsHTML}
                    </div>
                    
                    <span class="cdlv-auth__error" id="error-2fa-validation" aria-live="polite"></span>

                    <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">
                        ${sanitizeText(conf.buttonText)}
                    </button>
                </form>

                <footer class="cdlv-2fa__footer">
                    <p>Didn't receive the code? <button type="button" id="resend-code" class="cdlv-2fa__btn--resend">Resend Token</button></p>
                    <p>or <button type="button" id="change-email" class="cdlv-2fa__link--change">Change Email Address</button></p>
                </footer>
            </div>
        `;

        bindStep2Events();
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

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let hasError = false;

            [nameError, emailError, passwordError].forEach(el => { el.textContent = ''; el.classList.remove('is-visible'); });

            if (nameInput.value.trim() === '') {
                nameError.textContent = 'Please enter your full name.';
                nameError.classList.add('is-visible');
                hasError = true;
            }

            if (!isValidEmail(emailInput.value.trim())) {
                emailError.textContent = 'Please enter a valid email address.';
                emailError.classList.add('is-visible');
                hasError = true;
            }

            if (!isValidPassword(passwordInput.value)) {
                passwordError.textContent = 'Password must be at least 8 characters and include letters and numbers.';
                passwordError.classList.add('is-visible');
                hasError = true;
            }

            if (hasError) return;

            // Cache email for resend purposes, clear password from DOM
            userEmailCache = emailInput.value.trim();
            passwordInput.value = ''; 
            
            console.log('Step 1 Passed. Firing API to send 2FA...');
            
            // Unmount Step 1 and Mount Step 2
            mountStep2();
        });
    };

    const bindStep2Events = () => {
        const form = node.querySelector('#cdlv-2fa-form');
        const inputBoxes = Array.from(node.querySelectorAll('.cdlv-2fa__input-box'));
        const errorMsg = node.querySelector('#error-2fa-validation');
        const resendBtn = node.querySelector('#resend-code');
        const changeEmailBtn = node.querySelector('#change-email');

        // Focus the first input automatically on mount
        setTimeout(() => { if(inputBoxes[0]) inputBoxes[0].focus(); }, 100);

        inputBoxes.forEach((input, index) => {
            // Auto-advance
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value !== '' && index < inputBoxes.length - 1) {
                    inputBoxes[index + 1].focus();
                }
            });

            // Backspace bridge
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    inputBoxes[index - 1].focus();
                }
            });

            // Paste distribution
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, config.step2.digitCount);
                
                if (!numericData) return;

                numericData.split('').forEach((char, i) => {
                    if (inputBoxes[i]) inputBoxes[i].value = char;
                });

                const nextIndex = Math.min(numericData.length, config.step2.digitCount - 1);
                inputBoxes[nextIndex].focus();
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMsg.classList.remove('is-visible');
            
            const token = inputBoxes.map(input => input.value).join('');

            if (token.length < config.step2.digitCount) {
                errorMsg.textContent = `Please enter all ${config.step2.digitCount} digits.`;
                errorMsg.classList.add('is-visible');
                return;
            }

            console.log('Verifying Token:', token, 'for email:', userEmailCache);
            // TODO: Route token verification to utils/auth.js
        });

        resendBtn.addEventListener('click', () => {
            console.log(`Resending token to ${userEmailCache}...`);
        });

        // Allow user to go back to Step 1 if they made a typo in their email
        changeEmailBtn.addEventListener('click', () => {
            mountStep1();
        });
    };

    // Initialize by mounting the first step
    mountStep1();
};