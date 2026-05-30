/* ==========================================================================
   MODULE: DASHBOARD (modules/dashboard.js)
   Architecture: Exportable ES Module. Multi-page router with internal Sub-Views.
   Security: Strict DOMPurify-style sanitization applied.
   Performance: Leverages data-image-sync for batch image loading.
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
        { id: 'overview', label: 'Overview', href: 'account/index.html' },
        { id: 'orders', label: 'Orders', href: 'account/orders.html' },
        { id: 'billing', label: 'Billing', href: 'account/billing.html' },
        { id: 'settings', label: 'Personal Info', href: 'account/settings.html' },
        { id: 'security', label: 'Security', href: 'account/security.html' },
        { id: 'preferences', label: 'Preferences', href: 'account/preferences.html' }
    ],
    data: {
        activeSubscription: { plan: 'The Sleep Routine Box', renewal: 'June 28, 2026', link: 'account/index.html' },
        overview: [
            { date: 'May 28, 2026', activity: 'Purchased The Sleep Routine Box', link: 'account/orders.html' },
            { date: 'May 10, 2026', activity: 'Updated Shipping Address', link: 'account/settings.html' }
        ],
        orders: [
            { orderId: '#CDLV-1092', date: 'May 28, 2026', status: 'Processing', total: '₵ 450.00', link: 'account/orders.html' }
        ],
        wishlist: [
            { id: 'w1', title: 'Raw Savannah Honey', price: '₵ 85.00', img: 'assets/images/honey.jpg', link: 'shop/individual-wellness-products.html' },
            { id: 'w2', title: 'Ceramic Matcha Bowl', price: '₵ 120.00', img: 'assets/images/bowl.jpg', link: 'shop/all-accessories.html' }
        ],
        subscriptions: [
            { id: 'sub1', title: 'The Sleep Routine Box', frequency: 'Monthly', price: '₵ 350.00', nextBilling: 'June 28, 2026', img: 'assets/images/sleep-box.jpg' }
        ],
        paymentMethods: [
            { id: 'pm1', type: 'Visa', last4: '4242', exp: '12/28', name: 'Ama Mensah', isDefault: true },
            { id: 'pm2', type: 'Mastercard', last4: '8811', exp: '09/25', name: 'Ama Mensah', isDefault: false }
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

const generateNav = (tabs, activeTabId) => `
    <div class="cdlv-dashboard__nav-wrapper">
        <nav class="cdlv-dashboard__nav" aria-label="Account Navigation">
            ${tabs.map(tab => `
                <a href="${buildPath(tab.href)}" 
                   class="cdlv-dashboard__tab-link ${tab.id === activeTabId ? 'is-active' : ''}" 
                   ${tab.id === activeTabId ? 'aria-current="page"' : ''}>
                    ${sanitizeText(tab.label)}
                </a>
            `).join('')}
        </nav>
    </div>
`;

const generateTable = (headers, rows, mapRow) => `
    <div class="cdlv-dashboard__table-wrapper">
        <table class="cdlv-dashboard__table">
            <thead><tr>${headers.map(h => `<th>${sanitizeText(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${mapRow(row)}</tr>`).join('')}</tbody>
        </table>
    </div>
`;

const generateItemGrid = (items, type) => `
    <div class="cdlv-dashboard__grid" data-image-sync>
        ${items.map(item => `
            <div class="cdlv-dashboard__item-card">
                <div class="cdlv-dashboard__item-img-wrapper u-img-loader">
                    <img src="${buildPath(item.img)}" alt="${sanitizeText(item.title)}" loading="eager">
                </div>
                <div class="cdlv-dashboard__item-details">
                    <h3 class="cdlv-dashboard__item-title">${sanitizeText(item.title)}</h3>
                    <p class="cdlv-dashboard__item-meta">
                        ${type === 'subscription' ? `Ships ${sanitizeText(item.frequency)} &middot; Next: ${sanitizeText(item.nextBilling)}<br>` : ''}
                        ${sanitizeText(item.price)}
                    </p>
                    <div class="cdlv-dashboard__item-actions">
                        ${type === 'subscription' 
                            ? `<button class="cdlv-dashboard__btn cdlv-dashboard__btn--danger" data-action="cancel-sub" data-id="${sanitizeText(item.id)}">Cancel Plan</button>` 
                            : `<a href="${buildPath(item.link)}" class="cdlv-dashboard__btn">View Product</a>`
                        }
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
`;

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
    const activeTabId = node.getAttribute('data-account-tab') || 'overview';
    let activePanelHTML = '';

    switch (activeTabId) {
        case 'overview': {
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
                    <div class="cdlv-dashboard__sub-view is-active" data-view="default">
                        <div class="cdlv-dashboard__card">
                            <div class="cdlv-dashboard__card-content">
                                <h3>Active Subscription</h3>
                                <p>${sanitizeText(data.activeSubscription.plan)} &middot; Renews ${sanitizeText(data.activeSubscription.renewal)}</p>
                            </div>
                            <button class="cdlv-dashboard__btn" data-action="switch-view" data-target="subscriptions">Manage Subscriptions</button>
                        </div>
                        <div class="cdlv-dashboard__panel-header" style="margin-top: 2rem;">
                            <h2 class="cdlv-dashboard__panel-title">Your Wishlist</h2>
                            <button class="cdlv-dashboard__edit-btn" data-action="switch-view" data-target="wishlist">VIEW ALL</button>
                        </div>
                        <div class="cdlv-dashboard__panel-header" style="margin-top: 2rem;">
                            <h2 class="cdlv-dashboard__panel-title">Recent Activity</h2>
                        </div>
                        ${generateTable(['Date', 'Activity'], data.overview, r => `
                            <td>${sanitizeText(r.date)}</td>
                            <td><a href="${buildPath(r.link)}" class="cdlv-dashboard__link">${sanitizeText(r.activity)}</a></td>
                        `)}
                    </div>
                    <div class="cdlv-dashboard__sub-view" data-view="wishlist">
                        <button class="cdlv-dashboard__back-btn" data-action="switch-view" data-target="default">← Back to Overview</button>
                        <div class="cdlv-dashboard__panel-header">
                            <h2 class="cdlv-dashboard__panel-title">Wishlist</h2>
                        </div>
                        ${generateItemGrid(data.wishlist, 'wishlist')}
                    </div>
                    <div class="cdlv-dashboard__sub-view" data-view="subscriptions">
                        <button class="cdlv-dashboard__back-btn" data-action="switch-view" data-target="default">← Back to Overview</button>
                        <div class="cdlv-dashboard__panel-header">
                            <h2 class="cdlv-dashboard__panel-title">Manage Subscriptions</h2>
                        </div>
                        ${generateItemGrid(data.subscriptions, 'subscription')}
                    </div>
                </div>
            `;
            break;
        }

        case 'orders': {
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
                    ${generateTable(['Order ID', 'Date', 'Status', 'Total'], data.orders, r => `
                        <td><a href="${buildPath(r.link)}" class="cdlv-dashboard__link">${sanitizeText(r.orderId)}</a></td>
                        <td>${sanitizeText(r.date)}</td>
                        <td>${sanitizeText(r.status)}</td>
                        <td>${sanitizeText(r.total)}</td>
                    `)}
                </div>
            `;
            break;
        }

        case 'billing': {
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
                    <div class="cdlv-dashboard__sub-view is-active" data-view="default">
                        <div class="cdlv-dashboard__panel-header">
                            <h2 class="cdlv-dashboard__panel-title">Recent Billing</h2>
                        </div>
                        ${generateTable(['Method', 'Expires', 'Status'], data.paymentMethods.filter(pm => pm.isDefault), r => `
                            <td>${sanitizeText(r.type)} ending in ${sanitizeText(r.last4)}</td>
                            <td>${sanitizeText(r.exp)}</td>
                            <td>Default</td>
                        `)}
                        <div class="cdlv-dashboard__actions">
                            <button class="cdlv-dashboard__btn" data-action="switch-view" data-target="payment-methods">Manage Payment Methods</button>
                        </div>
                    </div>
                    <div class="cdlv-dashboard__sub-view" data-view="payment-methods">
                        <button class="cdlv-dashboard__back-btn" data-action="switch-view" data-target="default">← Back to Billing</button>
                        <div class="cdlv-dashboard__panel-header">
                            <h2 class="cdlv-dashboard__panel-title">Saved Payment Methods</h2>
                        </div>
                        <div class="cdlv-dashboard__payment-list">
                            ${data.paymentMethods.map(pm => `
                                <div class="cdlv-dashboard__payment-card">
                                    <div class="cdlv-dashboard__payment-info">
                                        <span class="cdlv-dashboard__payment-title">
                                            ${sanitizeText(pm.type)} ending in ${sanitizeText(pm.last4)}
                                            ${pm.isDefault ? `<span class="cdlv-dashboard__payment-badge">Default</span>` : ''}
                                        </span>
                                        <span class="cdlv-dashboard__item-meta">Expires ${sanitizeText(pm.exp)} &middot; ${sanitizeText(pm.name)}</span>
                                    </div>
                                    <button class="cdlv-dashboard__edit-btn" data-action="switch-view" data-target="edit-payment-${pm.id}">EDIT</button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="cdlv-dashboard__btn cdlv-dashboard__btn--outline" style="margin-top: 1rem;">+ Add New Method</button>
                    </div>
                    ${data.paymentMethods.map(pm => `
                        <div class="cdlv-dashboard__sub-view" data-view="edit-payment-${pm.id}">
                            <button class="cdlv-dashboard__back-btn" data-action="switch-view" data-target="payment-methods">← Back to Payment Methods</button>
                            <div class="cdlv-dashboard__panel-header">
                                <h2 class="cdlv-dashboard__panel-title">Edit Payment Method</h2>
                            </div>
                            <form class="cdlv-dashboard__form cdlv-dashboard__edit-state" style="display:block;">
                                <div class="cdlv-dashboard__field-group">
                                    <label class="cdlv-dashboard__label">Name on Card</label>
                                    <input class="cdlv-dashboard__input" type="text" value="${sanitizeText(pm.name)}" required>
                                </div>
                                <div class="cdlv-dashboard__field-group">
                                    <label class="cdlv-dashboard__label">Expiration Date (MM/YY)</label>
                                    <input class="cdlv-dashboard__input" type="text" value="${sanitizeText(pm.exp)}" required>
                                </div>
                                <div class="cdlv-dashboard__pref-group" style="margin-top: 1rem;">
                                    <label class="cdlv-dashboard__checkbox-label">
                                        <input type="checkbox" ${pm.isDefault ? 'checked' : ''}> Set as default payment method
                                    </label>
                                </div>
                                <div class="cdlv-dashboard__actions" style="justify-content: flex-start; gap: 1rem;">
                                    <button type="button" class="cdlv-dashboard__btn">Save Changes</button>
                                    <button type="button" class="cdlv-dashboard__btn cdlv-dashboard__btn--danger">Delete Card</button>
                                </div>
                            </form>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
        }

        case 'settings': {
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
                    ${generateEditablePanel('settings', 'Personal Info', data.personalInfo)}
                </div>
            `;
            break;
        }

        case 'security': {
            const twoFactorHTML = `
                <div class="cdlv-dashboard__toggle-wrapper">
                    <span class="cdlv-dashboard__toggle-label">Two-Factor Authentication</span>
                    <label class="cdlv-dashboard__toggle">
                        <input type="checkbox" ${data.security.twoFactor ? 'checked' : ''}>
                        <span class="cdlv-dashboard__toggle-slider"></span>
                    </label>
                </div>
            `;
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
                    ${generateEditablePanel('security', 'Security & Passwords', data.security.viewFields, data.security.editFields, twoFactorHTML)}
                </div>
            `;
            break;
        }

        case 'preferences': {
            activePanelHTML = `
                <div class="cdlv-dashboard__panel">
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
            `;
            break;
        }
    }

    const modalHTML = `
        <div class="cdlv-dashboard__modal" id="cdlv-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="cdlv-dashboard__modal-content">
                <h2 id="modal-title" class="cdlv-dashboard__modal-title">Cancel Subscription?</h2>
                <p class="cdlv-dashboard__modal-text">Are you sure you want to cancel? You will lose access to member-only pricing and priority shipping.</p>
                <p class="cdlv-dashboard__modal-text" style="font-size: 0.75rem; opacity: 0.6;">By confirming cancellation, you agree to the Casa De La Vida <a href="${buildPath('legal/terms-of-service.html')}" class="cdlv-dashboard__link">Terms of Service</a>. Your cancellation will take effect at the end of your current billing cycle.</p>
                <div class="cdlv-dashboard__modal-actions">
                    <button class="cdlv-dashboard__btn cdlv-dashboard__btn--outline" data-action="close-modal">Keep Subscription</button>
                    <button class="cdlv-dashboard__btn cdlv-dashboard__btn--danger" data-action="confirm-cancel">Confirm Cancellation</button>
                </div>
            </div>
        </div>
    `;

    node.innerHTML = `
        <div class="cdlv-dashboard">
            ${generateNav(tabs, activeTabId)}
            <div class="cdlv-dashboard__panels">
                ${activePanelHTML}
            </div>
            ${activeTabId === 'overview' ? modalHTML : ''}
        </div>
    `;

    // Event Delegation
    node.addEventListener('click', (e) => {
        // Sub-View Switching
        const switchBtn = e.target.closest('[data-action="switch-view"]');
        if (switchBtn) {
            const currentActiveView = node.querySelector('.cdlv-dashboard__sub-view.is-active');
            const targetView = node.querySelector(`.cdlv-dashboard__sub-view[data-view="${switchBtn.getAttribute('data-target')}"]`);
            if (currentActiveView && targetView) {
                currentActiveView.classList.remove('is-active');
                targetView.classList.add('is-active');
            }
        }

        // Edit Toggling
        const editBtn = e.target.closest('.cdlv-dashboard__edit-btn[data-action="edit"]');
        if (editBtn) {
            const wrapper = node.querySelector(`#wrapper-${editBtn.getAttribute('data-target')}`);
            if (wrapper) {
                if (wrapper.classList.contains('is-editing')) {
                    wrapper.classList.remove('is-editing');
                    editBtn.textContent = 'EDIT';
                } else {
                    wrapper.classList.add('is-editing');
                    editBtn.textContent = 'CANCEL';
                }
            }
        }

        // Password Toggling
        const pwdToggleBtn = e.target.closest('.cdlv-dashboard__pwd-toggle');
        if (pwdToggleBtn) {
            const inputField = pwdToggleBtn.previousElementSibling;
            if (inputField && inputField.tagName === 'INPUT') {
                if (inputField.type === 'password') {
                    inputField.type = 'text';
                    pwdToggleBtn.textContent = 'HIDE';
                } else {
                    inputField.type = 'password';
                    pwdToggleBtn.textContent = 'SHOW';
                }
            }
        }

        // Modal Operations
        const modal = node.querySelector('#cdlv-cancel-modal');
        
        // 1. Open Modal & Pass ID
        const openModalBtn = e.target.closest('[data-action="cancel-sub"]');
        if (openModalBtn) {
            if (modal) {
                modal.classList.add('is-open');
                const confirmBtn = modal.querySelector('[data-action="confirm-cancel"]');
                if (confirmBtn) {
                    // Pass the subscription ID to the confirm button
                    confirmBtn.setAttribute('data-target-id', openModalBtn.getAttribute('data-id'));
                    // Reset button text just in case it was used previously
                    confirmBtn.textContent = 'Confirm Cancellation';
                }
            }
        }

        // 2. Close Modal
        if (e.target.closest('[data-action="close-modal"]') || (e.target === modal)) {
            if (modal) modal.classList.remove('is-open');
        }

        // 3. Confirm Cancel & Transform Button
        const confirmCancelBtn = e.target.closest('[data-action="confirm-cancel"]');
        if (confirmCancelBtn) {
            confirmCancelBtn.textContent = 'CANCELED';
            const targetId = confirmCancelBtn.getAttribute('data-target-id');
            
            setTimeout(() => { 
                if (modal) modal.classList.remove('is-open'); 
                
                // Find the original cancel button on the card using the passed ID
                const originalCardBtn = node.querySelector(`[data-action="cancel-sub"][data-id="${targetId}"]`);
                
                if (originalCardBtn) {
                    // Replace the button with an anchor tag pointing to the cart
                    originalCardBtn.outerHTML = `<a href="${buildPath('shopping-cart.html')}" class="cdlv-dashboard__btn">Renew Plan</a>`;
                }
            }, 1000);
        }
    });

    node.addEventListener('submit', (e) => {
        if (e.target.matches('.cdlv-dashboard__form')) {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                const errorMsg = input.nextElementSibling && input.nextElementSibling.classList.contains('cdlv-dashboard__error-msg') 
                                 ? input.nextElementSibling 
                                 : input.parentElement.querySelector('.cdlv-dashboard__error-msg');
                
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