/* ==========================================================================
   MODULE: SIGN UP (modules/sign-up.js)
   Architecture: Exportable ES Module. Injects the registration UI and handles
   client-side form validation securely.
   Security: 
   - DOMPurify-style text sanitization for XSS prevention.
   - PII is strictly handled in memory during validation; no localStorage usage.
   - Prevents default form submission natively until validation passes.
   Dependencies: Relies on `utils/components.js` for initialization.
   ========================================================================== */

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
    title: "Begin Your Ritual",
    subtitle: "Create an account to curate your wellness journeys, track seasonal honey harvests, and manage your subscriptions.",
    namePlaceholder: "Name",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Minimum 8 characters",
    passwordHint: "Intentional security: Passwords must contain letters and numbers to protect your account data.",
    buttonText: "Continue to Verification"
};

/**
 * Validates the email format using a strict regex pattern.
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validates password complexity: Min 8 chars, at least one letter and one number.
 * @param {string} password 
 * @returns {boolean}
 */
const isValidPassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
};

/**
 * Core initialization function triggered by the global component loader.
 * @param {HTMLElement} node - The target DOM element.
 * @param {Object} customConfig - Optional JSON config from data-config.
 */
export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };

    // 1. Build & Inject HTML
    const signUpHTML = `
        <div class="cdlv-sign-up">
            <header class="cdlv-sign-up__header">
                <h2 class="cdlv-sign-up__title">${sanitizeText(config.title)}</h2>
                <p class="cdlv-sign-up__subtitle">${sanitizeText(config.subtitle)}</p>
            </header>
            
            <form class="cdlv-sign-up__form" id="cdlv-signup-form" novalidate>
                <div class="cdlv-sign-up__group">
                    <label for="signup-name" class="visually-hidden">Full Name</label>
                    <input type="text" id="signup-name" class="cdlv-sign-up__input" placeholder="${sanitizeText(config.namePlaceholder)}" required aria-describedby="error-signup-name">
                    <span class="cdlv-sign-up__error" id="error-signup-name" aria-live="polite"></span>
                </div>

                <div class="cdlv-sign-up__group">
                    <label for="signup-email" class="visually-hidden">Email Address</label>
                    <input type="email" id="signup-email" class="cdlv-sign-up__input" placeholder="${sanitizeText(config.emailPlaceholder)}" required aria-describedby="error-signup-email">
                    <span class="cdlv-sign-up__error" id="error-signup-email" aria-live="polite"></span>
                </div>

                <div class="cdlv-sign-up__group">
                    <label for="signup-password" class="visually-hidden">Create Password</label>
                    <input type="password" id="signup-password" class="cdlv-sign-up__input" placeholder="${sanitizeText(config.passwordPlaceholder)}" required aria-describedby="hint-signup-password error-signup-password">
                    <small id="hint-signup-password" class="cdlv-sign-up__hint">${sanitizeText(config.passwordHint)}</small>
                    <span class="cdlv-sign-up__error" id="error-signup-password" aria-live="polite"></span>
                </div>

                <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(config.buttonText)}</button>
            </form>

            <footer class="cdlv-sign-up__footer">
                <p>Already have an account? <a href="login.html" class="cdlv-sign-up__link">Log In</a></p>
            </footer>
        </div>
    `;
    
    node.innerHTML = signUpHTML;

    // 2. DOM Node Selection
    const form = node.querySelector('#cdlv-signup-form');
    const nameInput = node.querySelector('#signup-name');
    const emailInput = node.querySelector('#signup-email');
    const passwordInput = node.querySelector('#signup-password');
    
    const nameError = node.querySelector('#error-signup-name');
    const emailError = node.querySelector('#error-signup-email');
    const passwordError = node.querySelector('#error-signup-password');

    // 3. Isolated Event Handling & Validation Logic
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Halt submission immediately for validation

        let hasError = false;

        // Reset error states
        [nameError, emailError, passwordError].forEach(el => {
            el.textContent = '';
            el.classList.remove('is-visible');
        });

        // Validate Name
        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Please enter your full name.';
            nameError.classList.add('is-visible');
            hasError = true;
        }

        // Validate Email
        if (!isValidEmail(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.classList.add('is-visible');
            hasError = true;
        }

        // Validate Password
        if (!isValidPassword(passwordInput.value)) {
            passwordError.textContent = 'Password must be at least 8 characters and include letters and numbers.';
            passwordError.classList.add('is-visible');
            hasError = true;
        }

        if (hasError) return; // Exit if validation fails

        // Secure Submission Hook (Prep for 2FA routing)
        console.log('Validation passed. Transitioning to 2FA verification...');
        
        // TODO: Integrate auth.js / backend API call here.
        // Memory clearing (optional, highly secure systems wipe inputs manually after extraction)
    });
};