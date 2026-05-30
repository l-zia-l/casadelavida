/* ==========================================================================
   MODULE: DASHBOARD (modules/dashboard.js)
   Architecture: Exportable ES Module. 
   Security: DOMPurify-style sanitization applied.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const defaultConfig = {
    tabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'orders', label: 'Orders' },
        { id: 'billing', label: 'Billing' },
        { id: 'personal-info', label: 'Personal Info' },
        { id: 'security', label: 'Security' },
        { id: 'preferences', label: 'Preferences' }
    ],
    data: {
        activeSubscription: {
            plan: 'The Sleep Routine Box',
            status: 'Active',
            renewal: 'June 28, 2026',
            link: 'account/subscriptions.html'
        },
        overview: [
            { date: 'May 28, 2026', activity: 'Purchased The Sleep Routine Box', link: 'account/orders.html' },
            { date: 'May 25, 2026', activity: 'Read: The Science of Raw Honey', link: 'blog/post_1.html' },
            { date: 'May 10, 2026', activity: 'Updated Shipping Address', link: 'account/index.html' }
        ],
        orders: [
            { orderId: '#CDLV-1092', date: 'May 28, 2026', status: 'Processing', total: '₵ 450.00', link: 'account/orders.html' },
            { orderId: '#CDLV-1004', date: 'April 12, 2026', status: 'Delivered', total: '₵ 120.00', link: 'account/orders.html' }
        ],
        billing: [
            { method: 'Visa ending in 4242', expires: '12/28', status: 'Default' }
        ],
        personalInfo: [
            { id: 'fname', label: 'First Name', value: 'Ama', type: 'text' },
            { id: 'lname', label: 'Last Name', value: 'Mensah', type: 'text' },
            { id: 'email', label: 'Email Address', value: 'ama.mensah@example.com', type: 'email' },
            { id: 'phone', label: 'Phone Number', value: '+233 20 123 4567', type: 'tel' },
            { id: 'address', label: 'Primary Shipping Address', value: '12 Independence Ave, Accra, Ghana', type: 'text' }
        ],
        security: {
            viewFields: [
                { label: 'Current Password', value: '********' }
            ],
            editFields: [
                { id: 'current_pwd', label: 'Current Password', value: '', type: 'password' },
                { id: 'new_pwd', label: 'New Password', value: '', type: 'password' },
                { id: 'confirm_pwd', label: 'Confirm New Password', value: '', type: 'password' }
            ],
            twoFactor: true
        },
        preferences: [
            { id: 'pref_newsletter', label: 'Join the Ritual', description: 'Receive monthly wellness tips and exclusive member-only early access to new tea arrivals.', checked: true },
            { id: 'pref_sms', label: 'SMS Delivery Updates', description: 'Get real-time text notifications about your order status and delivery times.', checked: false }
        ]
    }
};

const generateNav = (tabs) => `
    <div class="cdlv-dashboard__nav-wrapper">
        <nav class="cdlv-dashboard__nav" role="tablist">
            ${tabs.map((tab, index) => `
                <button class="cdlv-dashboard__tab-btn ${index === 0 ? 'is-active' : ''}" 
                        role="tab" 
                        aria-selected="${index === 0 ? 'true' : 'false'}" 
                        aria-controls="panel-${tab.id}" 
                        id="tab-${tab.id}">
                    ${sanitizeText(tab.label)}
                </button>
            `).join('')}
        </nav>
    </div>
`;

const generateTable = (headers, rows, mapRow) => `
    <div class="cdlv-dashboard__table-wrapper">
        <table class="cdlv-dashboard__table">
            <thead>
                <tr>${headers.map(h => `<th>${sanitizeText(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${rows.map(row => `<tr>${mapRow(row)}</tr>`).join('')}
            </tbody>
        </table>
    </div>
`;

// Updated generator to handle separate View/Edit fields and password toggles
const generateEditablePanel = (id, title, viewFields, editFields = viewFields, customHTML = '') => `
    <div class="cdlv-dashboard__panel-header">
        <h2 class="cdlv-dashboard__panel-title">${sanitizeText(title)}</h2>
        <button class="cdlv-dashboard__edit-btn" data-action="edit" data-target="${id}">EDIT</button>
    </div>
    <div class="cdlv-dashboard__content-wrapper" id="wrapper-${id}">
        <div class="cdlv-dashboard__view-state">
            ${viewFields.map(f => `
                <div class="cdlv-dashboard__field-group">
                    <span class="cdlv-dashboard__label">${sanitizeText(f.label)}</span>
                    <span class="cdlv-dashboard__value">${sanitizeText(f.value) || '—'}</span>
                </div>
            `).join('')}
            ${customHTML}
        </div>
        <form class="cdlv-dashboard__edit-state cdlv-dashboard__form" novalidate>
            ${editFields.map(f => `
                <div class="cdlv-dashboard__field-group">
                    <label class="cdlv-dashboard__label" for="${sanitizeText(f.id)}">${sanitizeText(f.label)}</label>
                    ${f.type === 'password' ? `
                        <div class="cdlv-dashboard__input-wrapper">
                            <input class="cdlv-dashboard__input" type="password" id="${sanitizeText(f.id)}" name="${sanitizeText(f.id)}" value="${sanitizeText(f.value)}" required>
                            <button type="button" class="cdlv-dashboard__pwd-toggle" aria-label="Toggle password visibility">SHOW</button>
                        </div>
                    ` : `
                        <input class="cdlv-dashboard__input" type="${sanitizeText(f.type)}" id="${sanitizeText(f.id)}" name="${sanitizeText(f.id)}" value="${sanitizeText(f.value)}" required>
                    `}
                    <div class="cdlv-dashboard__error-msg">This field is required.</div>
                </div>
            `).join('')}
            ${customHTML}
            <button type="submit" class="cdlv-dashboard__btn">Update</button>
        </form>
    </div>
`;

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    const { tabs, data } = config;

    const twoFactorHTML = `
        <div class="cdlv-dashboard__toggle-wrapper">
            <span class="cdlv-dashboard__toggle-label">Two-Factor Authentication</span>
            <label class="cdlv-dashboard__toggle">
                <input type="checkbox" ${data.security.twoFactor ? 'checked' : ''}>
                <span class="cdlv-dashboard__toggle-slider"></span>
            </label>
        </div>
    `;

    const html = `
        <div class="cdlv-dashboard">
            ${generateNav(tabs)}
            <div class="cdlv-dashboard__panels">
                
                <div class="cdlv-dashboard__panel is-active" id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
                    <div class="cdlv-dashboard__card">
                        <div class="cdlv-dashboard__card-content">
                            <h3>Active Subscription</h3>
                            <p>${sanitizeText(data.activeSubscription.plan)} &middot; Renews ${sanitizeText(data.activeSubscription.renewal)}</p>
                        </div>
                        <a href="${buildPath(data.activeSubscription.link)}" class="cdlv-dashboard__btn">Manage Plan</a>
                    </div>
                    <div class="cdlv-dashboard__panel-header">
                        <h2 class="cdlv-dashboard__panel-title">Recent Activity</h2>
                    </div>
                    ${generateTable(['Date', 'Activity'], data.overview, r => `
                        <td>${sanitizeText(r.date)}</td>
                        <td><a href="${buildPath(r.link)}" class="cdlv-dashboard__link">${sanitizeText(r.activity)}</a></td>
                    `)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-orders" role="tabpanel" aria-labelledby="tab-orders" hidden>
                    ${generateTable(['Order ID', 'Date', 'Status', 'Total'], data.orders, r => `
                        <td><a href="${buildPath(r.link)}" class="cdlv-dashboard__link">${sanitizeText(r.orderId)}</a></td>
                        <td>${sanitizeText(r.date)}</td>
                        <td>${sanitizeText(r.status)}</td>
                        <td>${sanitizeText(r.total)}</td>
                    `)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-billing" role="tabpanel" aria-labelledby="tab-billing" hidden>
                     ${generateTable(['Method', 'Expires', 'Status'], data.billing, r => `
                        <td>${sanitizeText(r.method)}</td>
                        <td>${sanitizeText(r.expires)}</td>
                        <td>${sanitizeText(r.status)}</td>
                    `)}
                    <div class="cdlv-dashboard__actions">
                        <button class="cdlv-dashboard__btn">Manage Payment Methods</button>
                    </div>
                </div>

                <div class="cdlv-dashboard__panel" id="panel-personal-info" role="tabpanel" aria-labelledby="tab-personal-info" hidden>
                    ${generateEditablePanel('personal-info', 'Personal Info', data.personalInfo)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-security" role="tabpanel" aria-labelledby="tab-security" hidden>
                    ${generateEditablePanel('security', 'Security & Passwords', data.security.viewFields, data.security.editFields, twoFactorHTML)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-preferences" role="tabpanel" aria-labelledby="tab-preferences" hidden>
                    <div class="cdlv-dashboard__panel-header">
                        <h2 class="cdlv-dashboard__panel-title">Preferences</h2>
                    </div>
                    <form class="cdlv-dashboard__form">
                        ${data.preferences.map(p => `
                            <div class="cdlv-dashboard__pref-group">
                                <label class="cdlv-dashboard__checkbox-label">
                                    <input type="checkbox" id="${sanitizeText(p.id)}" name="${sanitizeText(p.id)}" ${p.checked ? 'checked' : ''}>
                                    ${sanitizeText(p.label)}
                                </label>
                                <span class="cdlv-dashboard__pref-desc">${sanitizeText(p.description)}</span>
                            </div>
                        `).join('')}
                        <button type="submit" class="cdlv-dashboard__btn">Save Preferences</button>
                    </form>
                </div>

            </div>
        </div>
    `;

    node.innerHTML = html;

    // Delegate tab switching logic
    node.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.cdlv-dashboard__tab-btn');
        if (tabBtn) {
            node.querySelectorAll('.cdlv-dashboard__tab-btn').forEach(btn => {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            });
            node.querySelectorAll('.cdlv-dashboard__panel').forEach(panel => {
                panel.classList.remove('is-active');
                panel.setAttribute('hidden', 'true');
            });

            tabBtn.classList.add('is-active');
            tabBtn.setAttribute('aria-selected', 'true');
            const targetPanel = node.querySelector(`#${tabBtn.getAttribute('aria-controls')}`);
            if(targetPanel) {
                targetPanel.classList.add('is-active');
                targetPanel.removeAttribute('hidden');
            }
        }
    });

    // Delegate edit toggling
    node.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.cdlv-dashboard__edit-btn');
        if (editBtn) {
            const wrapper = node.querySelector(`#wrapper-${editBtn.getAttribute('data-target')}`);
            if (wrapper.classList.contains('is-editing')) {
                wrapper.classList.remove('is-editing');
                editBtn.textContent = 'EDIT';
            } else {
                wrapper.classList.add('is-editing');
                editBtn.textContent = 'CANCEL';
            }
        }
    });

    // Delegate password visibility toggling
    node.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.cdlv-dashboard__pwd-toggle');
        if (toggleBtn) {
            const inputField = toggleBtn.previousElementSibling;
            if (inputField && inputField.tagName === 'INPUT') {
                if (inputField.type === 'password') {
                    inputField.type = 'text';
                    toggleBtn.textContent = 'HIDE';
                } else {
                    inputField.type = 'password';
                    toggleBtn.textContent = 'SHOW';
                }
            }
        }
    });

    // Form submission validation
    node.addEventListener('submit', (e) => {
        if (e.target.matches('.cdlv-dashboard__form')) {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                const errorMsg = input.nextElementSibling && input.nextElementSibling.classList.contains('cdlv-dashboard__error-msg') 
                                 ? input.nextElementSibling 
                                 : input.parentElement.querySelector('.cdlv-dashboard__error-msg'); // Adjusted for wrapped inputs
                
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    if(errorMsg) errorMsg.style.display = 'block';
                } else {
                    input.classList.remove('is-invalid');
                    if(errorMsg) errorMsg.style.display = 'none';
                }
            });

            if (isValid) {
                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'SAVED ✓';
                setTimeout(() => submitBtn.textContent = originalText, 2000);
            }
        }
    });
};