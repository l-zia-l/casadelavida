/* ==========================================================================
   MODULE: MULTI-STEP SIGN-UP (modules/sign-up.js)
   Architecture: Exportable ES Module acting as an internal state machine.
   Security: DOMPurify-style text sanitization for XSS prevention.
   Dependencies: Relies on `utils/components.js` for initialization and 
   your global .animate-enter class for smooth vertical transitions.
   ========================================================================== */

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

const defaultConfig = {
    step1: {
        title: "Begin Your Ritual",
        subtitle: "Create an account to curate your wellness journeys, track seasonal honey harvests, and manage your subscriptions.",
        namePlaceholder: "Name",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Minimum 8 characters",
        buttonText: "Continue to Verification"
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

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    let userEmailCache = "";

    // --- STATE MACHINE ROUTERS ---

    const mountStep1 = () => {
        const conf = config.step1;
        // Using global .animate-enter class ensures the "floating up" animation triggers on injection
        node.innerHTML = `
            <div class="cdlv-sign-up cdlv-auth-step animate-enter">
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
                        <input type="password" id="signup-password" class="cdlv-sign-up__input" placeholder="${sanitizeText(conf.passwordPlaceholder)}" required aria-describedby="error-signup-password">
                        <small class="cdlv-sign-up__hint">Intentional security: Passwords must contain letters and numbers to protect your account data.</small>
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
            <div class="cdlv-2fa cdlv-auth-step animate-enter">
                <header class="cdlv-2fa__header">
                    <h2 class="cdlv-2fa__title">${sanitizeText(conf.title)}</h2>
                    <p class="cdlv-2fa__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                <form class="cdlv-sign-up__form" id="cdlv-2fa-form" novalidate>
                    <div class="cdlv-2fa__digits" id="cdlv-2fa-container">${inputsHTML}</div>
                    <span class="cdlv-auth__error" id="error-2fa-validation" aria-live="polite"></span>
                    <button type="submit" class="cdlv-hero__btn cdlv-hero__btn--primary">${sanitizeText(conf.buttonText)}</button>
                </form>
                <footer class="cdlv-2fa__footer">
                    <p>Didn't receive the code? <button type="button" id="resend-code" class="cdlv-2fa__btn--resend">Resend Token</button></p>
                    <p>or <button type="button" id="change-email" class="cdlv-2fa__link--change">Change Email Address</button></p>
                </footer>
            </div>
        `;
        bindStep2Events();
    };

    const mountStep3 = () => {
        const conf = config.step3;
        let timeLeft = conf.countdownSeconds;

        // Custom Leaf/Flower Minimalist SVG Vector
        const celebrationVector = `
            <svg class="cdlv-welcome__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
                <path d="M12 2C7 2 3 6 3 11c0 4 3 8 9 11 6-3 9-7 9-11 0-5-4-9-9-9z"></path>
                <line x1="12" y1="2" x2="12" y2="22"></line>
            </svg>
        `;

        node.innerHTML = `
            <div class="cdlv-welcome cdlv-auth-step animate-enter">
                <header class="cdlv-sign-up__header">
                    ${celebrationVector}
                    <h1 class="cdlv-welcome__title">${sanitizeText(conf.title)}</h1>
                    <p class="cdlv-sign-up__subtitle">${sanitizeText(conf.subtitle)}</p>
                </header>
                
                <a href="${sanitizeText(conf.redirectUrl)}" id="cdlv-dashboard-redirect" class="cdlv-hero__btn cdlv-hero__btn--primary cdlv-welcome__btn">
                    ${sanitizeText(conf.buttonText)} 
                    <span class="cdlv-welcome__countdown">(Redirecting in ${timeLeft}s...)</span>
                </a>
            </div>
        `;

        // Countdown Timer Logic
        const countdownSpan = node.querySelector('.cdlv-welcome__countdown');
        
        const countdownInterval = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownSpan.textContent = "(Redirecting...)";
                window.location.href = conf.redirectUrl; // Fires the absolute redirect
            } else {
                countdownSpan.textContent = `(Redirecting in ${timeLeft}s...)`;
            }
        }, 1000);
    };

    // --- EVENT BINDERS ---

    const bindStep1Events = () => {
        const form = node.querySelector('#cdlv-signup-form');
        const [nameInput, emailInput, passwordInput] = ['name', 'email', 'password'].map(id => node.querySelector(`#signup-${id}`));
        const [nameError, emailError, passwordError] = ['name', 'email', 'password'].map(id => node.querySelector(`#error-signup-${id}`));

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let hasError = false;

            [nameError, emailError, passwordError].forEach(el => { el.textContent = ''; el.classList.remove('is-visible'); });

            if (!nameInput.value.trim()) { nameError.textContent = 'Please enter your full name.'; nameError.classList.add('is-visible'); hasError = true; }
            if (!isValidEmail(emailInput.value.trim())) { emailError.textContent = 'Please enter a valid email address.'; emailError.classList.add('is-visible'); hasError = true; }
            if (!isValidPassword(passwordInput.value)) { passwordError.textContent = 'Minimum 8 characters with letters and numbers required.'; passwordError.classList.add('is-visible'); hasError = true; }

            if (hasError) return;

            userEmailCache = emailInput.value.trim();
            mountStep2(); // Transition up
        });
    };

    const bindStep2Events = () => {
        const form = node.querySelector('#cdlv-2fa-form');
        const inputBoxes = Array.from(node.querySelectorAll('.cdlv-2fa__input-box'));
        const errorMsg = node.querySelector('#error-2fa-validation');

        setTimeout(() => { if(inputBoxes[0]) inputBoxes[0].focus(); }, 100);

        inputBoxes.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (e.target.value !== '' && index < inputBoxes.length - 1) inputBoxes[index + 1].focus();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) inputBoxes[index - 1].focus();
            });
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const numericData = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '').slice(0, config.step2.digitCount);
                if (!numericData) return;
                numericData.split('').forEach((char, i) => { if (inputBoxes[i]) inputBoxes[i].value = char; });
                inputBoxes[Math.min(numericData.length, config.step2.digitCount - 1)].focus();
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

            // Simulate Token verification success, then move to Step 3
            mountStep3();
        });

        node.querySelector('#resend-code').addEventListener('click', () => console.log('Resending...'));
        node.querySelector('#change-email').addEventListener('click', mountStep1);
    };

    // Initialize module by mounting the first step
    mountStep1();
};