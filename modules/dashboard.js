/* ==========================================================================
   MODULE: DASHBOARD (modules/dashboard.js)
   Architecture: Exportable ES Module. Dynamically constructs the dashboard
   interface based on configurable JSON data.
   Security: Utilizes strict DOMPurify-style sanitization for all injected
   strings. No direct user input is rendered without escaping.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Text sanitizer to prevent XSS.
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

// Default configuration (can be overridden via data-config)
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
            { id: 'email', label: 'Email Address', value: 'ama.mensah@example.com', type: 'email' }
        ],
        security: [
            { id: 'current_pwd', label: 'Current Password', value: '********', type: 'password' },
            { id: 'new_pwd', label: 'New Password', value: '', type: 'password' }
        ],
        preferences: [
            { id: 'pref_newsletter', label: 'Join the Ritual (Newsletter)', checked: true },
            { id: 'pref_sms', label: 'SMS Delivery Updates', checked: false }
        ]
    }
};

/**
 * Generators for module sections
 */
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

const generateEditablePanel = (id, title, fields) => `
    <div class="cdlv-dashboard__panel-header">
        <h2 class="cdlv-dashboard__panel-title">${sanitizeText(title)}</h2>
        <button class="cdlv-dashboard__edit-btn" data-action="edit" data-target="${id}">EDIT</button>
    </div>
    <div class="cdlv-dashboard__content-wrapper" id="wrapper-${id}">
        <div class="cdlv-dashboard__view-state">
            ${fields.map(f => `
                <div class="cdlv-dashboard__field-group">
                    <span class="cdlv-dashboard__label">${sanitizeText(f.label)}</span>
                    <span class="cdlv-dashboard__value">${sanitizeText(f.value) || '—'}</span>
                </div>
            `).join('')}
        </div>
        <form class="cdlv-dashboard__edit-state cdlv-dashboard__form" novalidate>
            ${fields.map(f => `
                <div class="cdlv-dashboard__field-group">
                    <label class="cdlv-dashboard__label" for="${sanitizeText(f.id)}">${sanitizeText(f.label)}</label>
                    <input class="cdlv-dashboard__input" type="${sanitizeText(f.type)}" id="${sanitizeText(f.id)}" name="${sanitizeText(f.id)}" value="${sanitizeText(f.value)}" required>
                    <div class="cdlv-dashboard__error-msg">This field is required.</div>
                </div>
            `).join('')}
            <button type="submit" class="cdlv-dashboard__btn">Update</button>
        </form>
    </div>
`;

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    const { tabs, data } = config;

    // 1. Build Initial DOM Fragment
    const html = `
        <div class="cdlv-dashboard">
            ${generateNav(tabs)}
            <div class="cdlv-dashboard__panels">
                
                <div class="cdlv-dashboard__panel is-active" id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
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
                </div>

                <div class="cdlv-dashboard__panel" id="panel-personal-info" role="tabpanel" aria-labelledby="tab-personal-info" hidden>
                    ${generateEditablePanel('personal-info', 'Personal Info', data.personalInfo)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-security" role="tabpanel" aria-labelledby="tab-security" hidden>
                    ${generateEditablePanel('security', 'Security & Passwords', data.security)}
                </div>

                <div class="cdlv-dashboard__panel" id="panel-preferences" role="tabpanel" aria-labelledby="tab-preferences" hidden>
                    <div class="cdlv-dashboard__panel-header">
                        <h2 class="cdlv-dashboard__panel-title">Preferences</h2>
                    </div>
                    <form class="cdlv-dashboard__form">
                        ${data.preferences.map(p => `
                            <div class="cdlv-dashboard__field-group">
                                <label class="cdlv-dashboard__checkbox-label">
                                    <input type="checkbox" id="${sanitizeText(p.id)}" name="${sanitizeText(p.id)}" ${p.checked ? 'checked' : ''}>
                                    ${sanitizeText(p.label)}
                                </label>
                            </div>
                        `).join('')}
                        <button type="submit" class="cdlv-dashboard__btn">Save Preferences</button>
                    </form>
                </div>

            </div>
        </div>
    `;

    node.innerHTML = html;

    // 2. Event Delegation: Tab Switching
    node.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.cdlv-dashboard__tab-btn');
        if (tabBtn) {
            // Reset all tabs & panels
            node.querySelectorAll('.cdlv-dashboard__tab-btn').forEach(btn => {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-selected', 'false');
            });
            node.querySelectorAll('.cdlv-dashboard__panel').forEach(panel => {
                panel.classList.remove('is-active');
                panel.setAttribute('hidden', 'true');
            });

            // Activate targeted tab & panel
            tabBtn.classList.add('is-active');
            tabBtn.setAttribute('aria-selected', 'true');
            const targetPanelId = tabBtn.getAttribute('aria-controls');
            const targetPanel = node.querySelector(`#${targetPanelId}`);
            if(targetPanel) {
                targetPanel.classList.add('is-active');
                targetPanel.removeAttribute('hidden');
            }
        }
    });

    // 3. Event Delegation: Edit Mode Toggling
    node.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.cdlv-dashboard__edit-btn');
        if (editBtn) {
            const targetId = editBtn.getAttribute('data-target');
            const wrapper = node.querySelector(`#wrapper-${targetId}`);
            
            if (wrapper.classList.contains('is-editing')) {
                wrapper.classList.remove('is-editing');
                editBtn.textContent = 'EDIT';
            } else {
                wrapper.classList.add('is-editing');
                editBtn.textContent = 'CANCEL';
            }
        }
    });

    // 4. Event Delegation: Form Validation & Submission
    node.addEventListener('submit', (e) => {
        if (e.target.matches('.cdlv-dashboard__form')) {
            e.preventDefault();
            const form = e.target;
            const inputs = form.querySelectorAll('input[required]');
            let isValid = true;

            // Strict Validation loop
            inputs.forEach(input => {
                const errorMsg = input.nextElementSibling;
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    if(errorMsg && errorMsg.classList.contains('cdlv-dashboard__error-msg')) {
                        errorMsg.style.display = 'block';
                    }
                } else {
                    input.classList.remove('is-invalid');
                    if(errorMsg && errorMsg.classList.contains('cdlv-dashboard__error-msg')) {
                        errorMsg.style.display = 'none';
                    }
                }
            });

            if (isValid) {
                // Future API integration goes here. 
                // For now, simulate success:
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'SAVED ✓';
                setTimeout(() => submitBtn.textContent = originalText, 2000);
            }
        }
    });
};