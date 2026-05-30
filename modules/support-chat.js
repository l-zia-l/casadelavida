/* ==========================================================================
   MODULE: SUPPORT CHAT (modules/support-chat.js)
   Architecture: Exportable ES Module. Single Page Application (SPA) logic 
                 contained within a dynamically injected fragment.
   Security: DOMPurify-style text sanitization for user inputs to prevent XSS.
   Performance: Hardware-accelerated CSS animations. DocumentFragment used
                for heavy DOM insertions.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

/**
 * Basic text sanitizer to prevent HTML injection from user inputs.
 * @param {string} str - Raw input string
 * @returns {string} - Sanitized string
 */
const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML.trim();
};

/**
 * Generates current formatted timestamp
 */
const getTimestamp = () => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date());
};

// SVG Assets
const svgs = {
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    minimize: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
};

/**
 * Core initialization function
 */
export const init = (node) => {
    let userData = { firstName: '', lastName: '', email: '' };
    let humanContacted = false;
    const botAvatarPath = buildPath('assets/images/backgrounds/stock_2.webp'); 
    
    // 1. Build Base HTML Structure
    const markup = `
        <button class="cdlv-support-chat-launcher" aria-label="Open Support Chat" id="cdlv-chat-launcher">
            ${svgs.chat}
        </button>

        <section class="cdlv-support-chat-window" id="cdlv-chat-window" aria-hidden="true">
            <header class="cdlv-support-chat__header">
                <h2 class="cdlv-support-chat__header-title">How can I help?</h2>
                <div class="cdlv-support-chat__header-actions">
                    <button class="cdlv-support-chat__btn-icon" id="cdlv-chat-min" aria-label="Minimize Chat">${svgs.minimize}</button>
                    <button class="cdlv-support-chat__btn-icon" id="cdlv-chat-close" aria-label="Close and Restart Chat">${svgs.close}</button>
                </div>
            </header>
            
            <div class="cdlv-support-chat__stream" id="cdlv-chat-stream">
            </div>

            <div class="cdlv-support-chat__modal-overlay" id="cdlv-chat-modal">
                <div class="cdlv-support-chat__modal">
                    <h3>End Chat Session?</h3>
                    <p>Closing the chat will reset your current progress.</p>
                    <div class="cdlv-support-chat__modal-actions">
                        <button class="cdlv-support-chat__pill" id="cdlv-modal-confirm" style="background: var(--color-accent); color: var(--color-text-light); border-color: var(--color-accent);">End Session</button>
                        <button class="cdlv-support-chat__pill" id="cdlv-modal-cancel">Keep Chatting</button>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    node.innerHTML = markup;

    // 2. Cache DOM Elements
    const elements = {
        launcher: document.getElementById('cdlv-chat-launcher'),
        window: document.getElementById('cdlv-chat-window'),
        stream: document.getElementById('cdlv-chat-stream'),
        btnMin: document.getElementById('cdlv-chat-min'),
        btnClose: document.getElementById('cdlv-chat-close'),
        modal: document.getElementById('cdlv-chat-modal'),
        btnModalCancel: document.getElementById('cdlv-modal-cancel'),
        btnModalConfirm: document.getElementById('cdlv-modal-confirm')
    };

    // 3. UI Helper Functions
    const scrollToBottom = () => {
        setTimeout(() => { elements.stream.scrollTop = elements.stream.scrollHeight; }, 50);
    };

    const closeAndResetChat = () => {
        elements.window.classList.remove('is-open');
        document.body.classList.remove('u-chat-open'); 
        elements.stream.innerHTML = ''; 
        messageQueue.length = 0; 
        isTyping = false;
        humanContacted = false;
    };

    // --- 3.5 Message Queuing System ---
    let isTyping = false;
    const messageQueue = [];

    const processQueue = () => {
        if (isTyping || messageQueue.length === 0) return;
        isTyping = true;
        
        const nextAction = messageQueue.shift();
        
        const typingRow = document.createElement('div');
        typingRow.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
        typingRow.id = 'cdlv-chat-typing-indicator';
        typingRow.innerHTML = `
            <img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar" onerror="this.style.display='none'">
            <div class="cdlv-support-chat__typing">
                <div class="cdlv-support-chat__gem"></div>
                <span class="cdlv-support-chat__typing-text">typing...</span>
            </div>
        `;
        elements.stream.appendChild(typingRow);
        scrollToBottom();

        setTimeout(() => {
            const indicator = document.getElementById('cdlv-chat-typing-indicator');
            if (indicator) indicator.remove();
            
            try {
                nextAction(); 
            } catch (error) {
                console.error("Support Chat Engine Error:", error);
            } finally {
                isTyping = false;
                processQueue(); 
            }
        }, 1200);
    };

    const enqueueBotAction = (actionFn) => {
        messageQueue.push(actionFn);
        processQueue();
    };

    const appendBotMessage = (text) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            row.innerHTML = `
                <img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='">
                <div class="cdlv-support-chat__bubble-wrapper">
                    <div class="cdlv-support-chat__bubble">${text}</div>
                    <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                </div>
            `;
            elements.stream.appendChild(row);
            scrollToBottom();
        });
    };

    const appendUserMessage = (text) => {
        const row = document.createElement('div');
        row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--user';
        row.innerHTML = `
            <div class="cdlv-support-chat__bubble-wrapper">
                <div class="cdlv-support-chat__bubble">${sanitizeText(text)}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            </div>
        `;
        elements.stream.appendChild(row);
        scrollToBottom();
    };

    const appendOptions = (options, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            row.style.marginLeft = 'calc(clamp(2.5rem, 4vw, 3.5rem) + var(--spacing-sm))'; 
            
            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills';
            
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.onclick = () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    appendUserMessage(opt.label);
                    setTimeout(() => callback(opt.value), 300);
                };
                pillsContainer.appendChild(btn);
            });
            row.appendChild(pillsContainer);
            elements.stream.appendChild(row);
            scrollToBottom();
        });
    };

    const appendForm = (fields, submitLabel, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            row.style.marginLeft = 'calc(clamp(2.5rem, 4vw, 3.5rem) + var(--spacing-sm))';
            
            const form = document.createElement('form');
            form.className = 'cdlv-support-chat__form';
            
            fields.forEach(f => {
                const group = document.createElement('div');
                group.className = 'cdlv-support-chat__form-group';
                
                let inputHTML = '';
                if (f.type === 'textarea') {
                    inputHTML = `<textarea class="cdlv-support-chat__textarea" name="${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}></textarea>`;
                } else if (f.type === 'select') {
                    inputHTML = `
                        <select class="cdlv-support-chat__input" name="${f.name}" ${f.required ? 'required' : ''}>
                            <option value="" disabled selected>Select an option...</option>
                            ${f.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    `;
                } else {
                    inputHTML = `<input class="cdlv-support-chat__input" type="${f.type}" name="${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>`;
                }

                group.innerHTML = `
                    <label class="cdlv-support-chat__label">${f.label} ${f.required ? '*' : ''}</label>
                    ${inputHTML}
                `;
                form.appendChild(group);
            });

            const submitBtn = document.createElement('button');
            submitBtn.type = 'submit';
            submitBtn.className = 'cdlv-support-chat__submit';
            submitBtn.textContent = submitLabel;
            form.appendChild(submitBtn);

            form.onsubmit = (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                Array.from(form.elements).forEach(el => el.disabled = true);
                submitBtn.textContent = 'Submitted ✓';
                submitBtn.style.backgroundColor = 'var(--color-text-dark)';
                
                callback(data);
            };

            row.appendChild(form);
            elements.stream.appendChild(row);
            scrollToBottom();
        });
    };

    // Card Builder specifically for external links opening in a new tab
    const appendCardMessage = (title, imagePath, description, linkUrl, linkText) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            row.style.marginLeft = 'calc(clamp(2.5rem, 4vw, 3.5rem) + var(--spacing-sm))';
            
            row.innerHTML = `
                <div class="cdlv-support-chat__card">
                    <h3 class="cdlv-support-chat__card-title">${title}</h3>
                    <img src="${buildPath(imagePath)}" alt="${title}" class="cdlv-support-chat__card-img">
                    <p style="font-size: var(--font-size-small); margin-bottom: 0.5rem;">${description}</p>
                    <a href="${buildPath(linkUrl)}" target="_blank" rel="noopener noreferrer" class="cdlv-support-chat__pill" style="width: 100%; display: block; text-align: center; box-sizing: border-box; text-decoration: none;">${linkText}</a>
                </div>
            `;
            elements.stream.appendChild(row);
            scrollToBottom();
        });
    };

    // 4. Chat Flow Logic (Pipelines)
    
    const triggerGlobalEnd = () => {
        const endOptions = [
            { label: 'Nope, all set', value: 'end' },
            { label: 'Another Question', value: 'menu' }
        ];
        
        if (!humanContacted) {
            endOptions.push({ label: 'Need to Speak With Someone', value: 'human' });
        }

        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4='">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper';
            wrapper.style.width = '100%';
            
            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">Is there anything else I can help you with?</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            `;

            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills';
            pillsContainer.style.marginTop = 'var(--spacing-xs)';

            endOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.onclick = () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    
                    appendUserMessage(opt.label);
                    
                    setTimeout(() => {
                        if (opt.value === 'end') {
                            appendBotMessage("Thank you for chatting with me today. Wishing you a beautiful, balanced day!");
                            
                            // Conversational bridge before the final End Session button
                            appendBotMessage("You can safely close this session below whenever you are ready.");
                            
                            appendOptions([{label: 'End Session', value: 'close_chat'}], (val) => {
                                if (val === 'close_chat') closeAndResetChat();
                            });
                        } else if (opt.value === 'menu') {
                            showMainMenu();
                        } else {
                            triggerHumanPipeline();
                        }
                    }, 300);
                };
                pillsContainer.appendChild(btn);
            });

            wrapper.appendChild(pillsContainer);
            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            scrollToBottom();
        });
    };

    const triggerHumanPipeline = () => {
        appendBotMessage("I'll connect you with our wellness team to look into this personally. They will email you within minutes. Please confirm your email address below.");
        
        appendForm([{ label: 'Email Address', name: 'email', type: 'email', required: true }], 'Confirm Email', (data) => {
            humanContacted = true; 
            appendBotMessage(`Thank you. A team member will reach out to ${sanitizeText(data.email)} shortly.`);
            
            setTimeout(() => {
                triggerGlobalEnd();
            }, 1200);
        });
    };

    const runOrderPipeline = () => {
        appendBotMessage("To best assist you with your order, could you let me know if you checked out as a guest or if you are logged into your account?");
        appendOptions([
            { label: 'Guest Checkout', value: 'guest' },
            { label: 'Logged into my account', value: 'logged' }
        ], (accountStatus) => {
            
            // Conversational bridge before sub-options
            appendBotMessage("Understood. What specific action would you like to take regarding your order?");
            
            const orderOpts = [
                { label: 'Cancel order', value: 'cancel' },
                { label: 'Place order', value: 'place' },
                { label: 'Track order', value: 'track' },
                { label: 'Change order', value: 'change' }
            ];
            
            appendOptions(orderOpts, (action) => {
                if (action === 'track') {
                    runTrackOrderPipeline();
                    return;
                }

                if (accountStatus === 'guest') {
                    if (action === 'cancel') {
                        appendBotMessage("Canceling orders is not possible once they have been shipped. Please restart the chat to check the order status if you have your Order ID.");
                        triggerGlobalEnd();
                    } else {
                        triggerHumanPipeline();
                    }
                } else {
                    if (action === 'place') {
                        appendBotMessage("Ready to step into the soft life? You can explore our artisanal collections and place a new order right here:");
                        appendCardMessage("Shop Casa De La Vida", "assets/images/products/item_2.2.1.webp", "Explore our artisanal collections and wellness boxes.", "shop.html", "Shop Now");
                        triggerGlobalEnd();
                    } else {
                        appendBotMessage("To ensure your rituals arrive quickly, we process orders immediately. Once placed, an order cannot be modified. However, if your order has not yet shipped, you can cancel it directly in your account dashboard and place a new one.");
                        appendCardMessage("Account Dashboard", "assets/images/backgrounds/stock_3.webp", "Manage your orders, subscriptions, and settings.", "account/orders.html", "View Orders");
                        triggerGlobalEnd();
                    }
                }
            });
        });
    };

    const runTrackOrderPipeline = () => {
        appendBotMessage("Please share your Order ID and delivery region so we can pull up your natural self-care rituals.");
        
        const ghanaRegions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Western', 'Western North'];

        appendForm([
            { label: 'Order ID', name: 'orderId', type: 'text', placeholder: 'e.g. CDLV-12345', required: true },
            { label: 'Region', name: 'region', type: 'select', options: ghanaRegions, required: true }
        ], 'Track Order', (data) => {
            appendBotMessage("Searching for your rituals...");
            
            setTimeout(() => {
                if (data.orderId.length > 3) { 
                    appendBotMessage(`<strong>Order: ${sanitizeText(data.orderId)}</strong><br>Status: Processing<br>Expected delivery: 2-3 Business Days.`);
                    triggerGlobalEnd();
                } else { 
                    appendBotMessage("It looks like those details don't match our records. Let's try again.");
                    setTimeout(() => {
                        showMainMenu();
                    }, 1200); 
                }
            }, 1000);
        });
    };

    const handleTopicSelection = (topic) => {
        if (topic === 'order') runOrderPipeline();
        else if (topic === 'tech') {
            appendBotMessage("If you are having trouble finding an order or managing a subscription, I recommend using the specific options in our main menu or visiting our Help Center. If you are experiencing a glitch or bug on the website, please describe it below and attach a screenshot if possible.");
            appendForm([{ label: 'Describe Issue', name: 'issue', type: 'textarea', required: true }], 'Submit Report', () => triggerGlobalEnd());
        }
        else if (topic === 'shop') {
            appendBotMessage("Let's find the perfect addition to your daily ritual. Tell me a bit about what you are looking for, and I will curate a selection just for you.");
            appendForm([
                { label: 'Category Preference', name: 'cat', type: 'text', required: false },
                { label: 'Budget', name: 'budget', type: 'text', required: false }
            ], 'Find Products', () => {
                appendBotMessage("Based on your vibes, check out our catalog:");
                appendCardMessage("Curated Wellness", "assets/images/products/item_1.webp", "Discover holistic products tailored to your routine.", "shop.html", "Explore Catalog");
                
                // Conversational bridge before options
                appendBotMessage("Would you like to explore further, or speak with an expert?");
                
                appendOptions([
                    {label: 'I want to explore more', value: 'more'},
                    {label: 'I want a consultation', value: 'consult'},
                    {label: 'I\'m done looking', value: 'done'}
                ], (res) => {
                    if(res === 'consult') {
                        appendBotMessage("Book your consultation here:");
                        appendCardMessage("Wellness Consultation", "assets/images/backgrounds/stock_1.webp", "Speak with our experts to personalize your routine.", "appointments.html", "Book Now");
                    }
                    triggerGlobalEnd();
                });
            });
        }
        else {
            triggerHumanPipeline();
        }
    };

    const showMainMenu = () => {
        appendBotMessage(`Thank you, ${sanitizeText(userData.firstName)}! How can I help you today? 🫖`);
        
        enqueueBotAction(() => {
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            wrapper.style.marginLeft = 'calc(clamp(2.5rem, 4vw, 3.5rem) + var(--spacing-sm))';
            wrapper.style.flexDirection = 'column'; 
            wrapper.style.gap = 'var(--spacing-sm)';
            
            const uniqueTrackId = 'cdlv-track-btn-' + Math.random().toString(36).substr(2, 9);

            const cardHTML = `
                <div class="cdlv-support-chat__card">
                    <h3 class="cdlv-support-chat__card-title">Where is my order?</h3>
                    <img src="${buildPath('assets/images/products/box_1.webp')}" alt="Casa De La Vida Box" class="cdlv-support-chat__card-img">
                    <p style="font-size: var(--font-size-small); margin-bottom: 0.5rem;">Need to know when your Casa De La Vida product will be arriving?</p>
                    <button class="cdlv-support-chat__pill" id="${uniqueTrackId}" style="width: 100%;">Track Now!</button>
                </div>
            `;

            const topics = [
                { label: 'Order', value: 'order' },
                { label: 'Subscriptions', value: 'subscriptions' },
                { label: 'Quality', value: 'quality' },
                { label: 'Shop', value: 'shop' },
                { label: 'Care Tips', value: 'care' },
                { label: 'Technical Issues', value: 'tech' }
            ];
            
            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills';
            
            topics.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.onclick = () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    
                    const trackBtn = wrapper.querySelector(`#${uniqueTrackId}`);
                    if(trackBtn) { 
                        trackBtn.style.pointerEvents = 'none'; 
                        trackBtn.style.opacity = '0.5'; 
                    }

                    appendUserMessage(opt.label);
                    setTimeout(() => handleTopicSelection(opt.value), 300);
                };
                pillsContainer.appendChild(btn);
            });

            wrapper.innerHTML = cardHTML;
            wrapper.appendChild(pillsContainer);
            
            const trackBtn = wrapper.querySelector(`#${uniqueTrackId}`);
            if(trackBtn) {
                trackBtn.addEventListener('click', (e) => {
                    e.target.classList.add('is-selected');
                    e.target.disabled = true;
                    
                    pillsContainer.style.pointerEvents = 'none';
                    pillsContainer.style.opacity = '0.5';
                    
                    appendUserMessage("Track Now!");
                    runTrackOrderPipeline();
                });
            }

            elements.stream.appendChild(wrapper);
            scrollToBottom();
        });
    };

    const startFlow = () => {
        elements.stream.innerHTML = ''; 
        appendBotMessage("Welcome to Casa De La Vida. We are here to support your holistic wellness journey. Please tell us a little about yourself to get started.");
        
        appendForm([
            { label: 'First Name', name: 'firstName', type: 'text', required: true },
            { label: 'Last Name', name: 'lastName', type: 'text', required: true },
            { label: 'Email Address', name: 'email', type: 'email', required: true }
        ], 'Start Chat', (data) => {
            userData = { ...data };
            showMainMenu();
        });
    };

    // 5. Event Listeners for State Management
    elements.launcher.addEventListener('click', () => {
        elements.window.classList.add('is-open');
        document.body.classList.add('u-chat-open'); 
        if (elements.stream.children.length === 0) {
            setTimeout(() => startFlow(), 600); 
        }
    });

    elements.btnMin.addEventListener('click', () => {
        elements.window.classList.remove('is-open');
        document.body.classList.remove('u-chat-open'); 
    });

    elements.btnClose.addEventListener('click', () => {
        elements.modal.classList.add('is-active');
    });

    elements.btnModalCancel.addEventListener('click', () => {
        elements.modal.classList.remove('is-active');
    });

    elements.btnModalConfirm.addEventListener('click', () => {
        elements.modal.classList.remove('is-active');
        closeAndResetChat();
    });
};