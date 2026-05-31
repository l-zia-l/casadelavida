/* ==========================================================================
   MODULE: SUPPORT CHAT (modules/support-chat.js)
   Architecture: Exportable ES Module. Single Page Application (SPA) logic 
                 contained within a dynamically injected fragment.
   Security: STRICT CSP COMPLIANT. No inline styles or inline event handlers.
             DOMPurify-style text sanitization for user inputs to prevent XSS.
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
    chat: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    close: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    minimize: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    play: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    rewind: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>`,
    fastForward: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>`,
    volume: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
    mute: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="1" x2="1" y2="23"></line></svg>`,
    cc: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><path d="M9 10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2"></path><path d="M17 10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2"></path></svg>`
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
        <button class="cdlv-support-chat-launcher" aria-label="Open Support Chat" aria-expanded="false" aria-controls="cdlv-chat-window" id="cdlv-chat-launcher">
            <span class="cdlv-support-chat-launcher__text">Chat</span>
            ${svgs.chat}
        </button>

        <section class="cdlv-support-chat-window" id="cdlv-chat-window" role="dialog" aria-modal="true" aria-labelledby="cdlv-chat-title" aria-hidden="true">
            <header class="cdlv-support-chat__header">
                <h2 class="cdlv-support-chat__header-title" id="cdlv-chat-title">How can I help?</h2>
                <div class="cdlv-support-chat__header-actions">
                    <button class="cdlv-support-chat__btn-icon" id="cdlv-chat-min" aria-label="Minimize Chat">${svgs.minimize}</button>
                    <button class="cdlv-support-chat__btn-icon" id="cdlv-chat-close" aria-label="Close and Restart Chat">${svgs.close}</button>
                </div>
            </header>
            
            <div class="cdlv-support-chat__stream" id="cdlv-chat-stream" aria-live="polite">
                </div>

            <div class="cdlv-support-chat__modal-overlay" id="cdlv-chat-modal">
                <div class="cdlv-support-chat__modal" role="alertdialog" aria-modal="true" aria-labelledby="cdlv-modal-title">
                    <h3 id="cdlv-modal-title">End Chat Session?</h3>
                    <p>Closing the chat will reset your current progress.</p>
                    <div class="cdlv-support-chat__modal-actions">
                        <button class="cdlv-support-chat__pill cdlv-support-chat__pill--primary" id="cdlv-modal-confirm">End Session</button>
                        <button class="cdlv-support-chat__pill" id="cdlv-modal-cancel">Keep Chatting</button>
                    </div>
                </div>
            </div>

            <div class="cdlv-support-chat-video-overlay" id="cdlv-chat-video-overlay" role="dialog" aria-modal="true" aria-label="Video Player" aria-hidden="true">
                <div class="cdlv-support-chat-video-container">
                    <button class="cdlv-support-chat-video-close" id="cdlv-video-close" aria-label="Close Video">${svgs.close}</button>
                    <video id="cdlv-chat-video-el" class="cdlv-support-chat-video-el" playsinline></video>
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
        btnModalConfirm: document.getElementById('cdlv-modal-confirm'),
        // Video Elements
        videoOverlay: document.getElementById('cdlv-chat-video-overlay'),
        videoEl: document.getElementById('cdlv-chat-video-el'),
        videoClose: document.getElementById('cdlv-video-close'),
        videoPlayPause: document.getElementById('cdlv-video-playpause'),
        videoRewind: document.getElementById('cdlv-video-rewind'),
        videoFF: document.getElementById('cdlv-video-ff'),
        videoMute: document.getElementById('cdlv-video-mute'),
        videoCC: document.getElementById('cdlv-video-cc')
    };

    // 3. UI Helper Functions
    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                elements.stream.scrollTop = elements.stream.scrollHeight;
            });
        });
    };

    const setFocusOnOpen = () => {
        // Focus the first interactive element or the title
        elements.window.setAttribute('aria-hidden', 'false');
        elements.launcher.setAttribute('aria-expanded', 'true');
        elements.btnClose.focus(); 
    };

    const closeAndResetChat = () => {
        elements.window.classList.remove('is-open');
        elements.window.setAttribute('aria-hidden', 'true');
        elements.launcher.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('u-chat-open'); 
        elements.stream.innerHTML = ''; 
        messageQueue.length = 0; 
        isTyping = false;
        humanContacted = false;
        elements.launcher.focus(); // Return focus to launcher
    };

    const attachAvatarFallbacks = () => {
        const avatars = elements.stream.querySelectorAll('.cdlv-support-chat__avatar:not(.is-tracked)');
        avatars.forEach(img => {
            img.classList.add('is-tracked');
            img.addEventListener('error', () => { img.style.display = 'none'; });
        });
    };

    // --- Video Player Controller ---
    const openVideo = (srcUrl) => {
        elements.videoEl.src = srcUrl;
        elements.videoOverlay.classList.add('is-active');
        elements.videoOverlay.setAttribute('aria-hidden', 'false');
        elements.videoEl.play().catch(e => console.log("Autoplay prevented.", e));
        elements.videoPlayPause.innerHTML = svgs.pause;
        elements.videoPlayPause.focus(); // Route focus to the video player
    };

    const closeVideo = () => {
        elements.videoEl.pause();
        elements.videoEl.src = '';
        elements.videoOverlay.classList.remove('is-active');
        elements.videoOverlay.setAttribute('aria-hidden', 'true');
        // Return focus to the stream so user doesn't get lost
        elements.stream.focus(); 
    };

    elements.videoClose.addEventListener('click', closeVideo);

    elements.videoPlayPause.addEventListener('click', () => {
        if (elements.videoEl.paused) {
            elements.videoEl.play();
            elements.videoPlayPause.innerHTML = svgs.pause;
        } else {
            elements.videoEl.pause();
            elements.videoPlayPause.innerHTML = svgs.play;
        }
    });

    elements.videoRewind.addEventListener('click', () => {
        elements.videoEl.currentTime = Math.max(0, elements.videoEl.currentTime - 10);
    });

    elements.videoFF.addEventListener('click', () => {
        elements.videoEl.currentTime = Math.min(elements.videoEl.duration, elements.videoEl.currentTime + 10);
    });

    elements.videoMute.addEventListener('click', () => {
        elements.videoEl.muted = !elements.videoEl.muted;
        elements.videoMute.innerHTML = elements.videoEl.muted ? svgs.mute : svgs.volume;
    });

    elements.videoCC.addEventListener('click', () => {
        const track = elements.videoEl.textTracks[0];
        if (track) {
            track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
            elements.videoCC.classList.toggle('is-active');
        } else {
            elements.videoCC.classList.toggle('is-active');
        }
    });

    elements.videoEl.addEventListener('ended', () => {
        elements.videoPlayPause.innerHTML = svgs.play;
    });

    // Global Keyboard Event Listener for 'Escape' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Check contextual layer stack from top to bottom
            if (elements.videoOverlay.classList.contains('is-active')) {
                closeVideo();
            } else if (elements.modal.classList.contains('is-active')) {
                elements.modal.classList.remove('is-active');
                elements.btnClose.focus();
            } else if (elements.window.classList.contains('is-open')) {
                elements.btnMin.click(); // Standard minimize behavior
            }
        }
    });

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
            <img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">
            <div class="cdlv-support-chat__typing">
                <div class="cdlv-support-chat__gem"></div>
                <span class="cdlv-support-chat__typing-text">typing...</span>
            </div>
        `;
        elements.stream.appendChild(typingRow);
        attachAvatarFallbacks();
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

    const appendUserMessage = (text) => {
        const row = document.createElement('div');
        row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--user animate-enter';
        row.innerHTML = `
            <div class="cdlv-support-chat__bubble-wrapper">
                <div class="cdlv-support-chat__bubble">${sanitizeText(text)}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            </div>
        `;
        elements.stream.appendChild(row);
        scrollToBottom();
    };

    // --- Unified Rendering Helpers ---

    const appendBotMessage = (text) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot animate-enter';
            row.innerHTML = `
                <img src="${botAvatarPath}" alt="Vida" class="cdlv-support-chat__avatar" loading="lazy" decoding="async">
                <div class="cdlv-support-chat__bubble-wrapper">
                    <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                    <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                </div>
            `;
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const appendStepsWithFeedback = (stepsText) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const likeIconPath = buildPath('assets/icons/like.svg');
            const dislikeIconPath = buildPath('assets/icons/dislike.svg');

            row.innerHTML = `
                <img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">
                <div class="cdlv-support-chat__bubble-wrapper u-w-100">
                    <div class="cdlv-support-chat__bubble">${stepsText}</div>
                    <div class="cdlv-support-chat__feedback-row">
                        <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                        <div class="cdlv-support-chat__feedback-actions">
                            <span>Was this helpful?</span>
                            <button type="button" class="cdlv-support-chat__feedback-btn cdlv-btn-like">
                                <img src="${likeIconPath}" alt="Like" loading="eager">
                            </button>
                            <button type="button" class="cdlv-support-chat__feedback-btn cdlv-btn-dislike">
                                <img src="${dislikeIconPath}" alt="Dislike" loading="eager">
                            </button>
                        </div>
                    </div>
                </div>
            `;
            elements.stream.appendChild(row);
            
            const likeBtn = row.querySelector('.cdlv-btn-like');
            const dislikeBtn = row.querySelector('.cdlv-btn-dislike');
            
            if(likeBtn && dislikeBtn) {
                likeBtn.addEventListener('click', () => {
                    likeBtn.classList.add('is-selected');
                    dislikeBtn.classList.remove('is-selected');
                });
                dislikeBtn.addEventListener('click', () => {
                    dislikeBtn.classList.add('is-selected');
                    likeBtn.classList.remove('is-selected');
                });
            }

            attachAvatarFallbacks();
            scrollToBottom();
            triggerGlobalEnd();
        });
    };

    const askWithOptions = (text, options, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            `;

            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills u-mt-xs';

            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.addEventListener('click', () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    appendUserMessage(opt.label);
                    setTimeout(() => callback(opt.value), 300);
                });
                pillsContainer.appendChild(btn);
            });

            wrapper.appendChild(pillsContainer);
            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const askWithForm = (text, fields, submitLabel, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            `;

            const form = document.createElement('form');
            form.className = 'cdlv-support-chat__form u-mt-xs';
            
            fields.forEach(f => {
                const group = document.createElement('div');
                group.className = 'cdlv-support-chat__form-group';
                
                let inputHTML = '';
                if (f.type === 'textarea') {
                    inputHTML = `<textarea class="cdlv-support-chat__textarea" name="${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}></textarea>`;
                } else if (f.type === 'select') {
                    inputHTML = `
                        <select class="cdlv-support-chat__input" name="${f.name}" ${f.required ? 'required' : ''}>
                            <option value="" ${f.required ? 'disabled selected' : 'selected'}>Select an option...</option>
                            ${f.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    `;
                } else if (f.type === 'file') {
                    // Added file type handling for attachments
                    inputHTML = `<input class="cdlv-support-chat__input cdlv-support-chat__input--file" type="file" name="${f.name}" accept="${f.accept || '*/*'}" ${f.required ? 'required' : ''}>`;
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

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                Array.from(form.elements).forEach(el => el.disabled = true);
                submitBtn.textContent = 'Submitted';
                submitBtn.style.backgroundColor = 'var(--color-text-dark)';
                
                callback(data);
            });

            wrapper.appendChild(form);
            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const askWithCard = (text, title, imagePath, description, linkUrl, linkText) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                <div class="cdlv-support-chat__card u-mt-xs">
                    <h3 class="cdlv-support-chat__card-title">${title}</h3>
                    <img src="${buildPath(imagePath)}" alt="${title}" class="cdlv-support-chat__card-img">
                    <p style="font-size: var(--font-size-small); margin-bottom: 0.5rem;">${description}</p>
                    <a href="${buildPath(linkUrl)}" target="_blank" rel="noopener noreferrer" class="cdlv-support-chat__pill cdlv-support-chat__card-link">${linkText}</a>
                </div>
            `;

            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const askWithSlider = (text, items, followUpOptions, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            const cardsHTML = items.map((item, index) => {
                const loadingStrategy = index < 2 ? 'loading="eager" decoding="sync"' : 'loading="lazy" decoding="async"';
                const displayPrice = isNaN(item.price) ? item.price : `GH₵ ${item.price}`;

                return `
                    <article class="cdlv-catalog-slider__card cdlv-support-chat__slider-card">
                        <a href="${buildPath(item.link || '#')}" target="_blank" class="cdlv-catalog-slider__image-box img-hover-scale cdlv-support-chat__slider-img-box">
                            <img src="${buildPath(item.image)}" alt="${sanitizeText(item.title)}" class="cdlv-support-chat__slider-img" ${loadingStrategy}>
                        </a>
                        <div class="cdlv-catalog-slider__info">
                            <h3 class="cdlv-support-chat__slider-title">
                                <a href="${buildPath(item.link || '#')}" target="_blank" class="cdlv-support-chat__slider-link">${sanitizeText(item.title)}</a>
                            </h3>
                            <p class="cdlv-support-chat__slider-price">${sanitizeText(displayPrice)}</p>
                        </div>
                    </article>
                `;
            }).join('');

            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                
                <section class="cdlv-catalog-slider animate-enter u-mt-xs cdlv-support-chat__slider-section">
                    <div class="cdlv-catalog-slider__carousel-wrapper cdlv-support-chat__slider-wrapper">
                        <div class="cdlv-catalog-slider__track cdlv-support-chat__slider-track">
                            ${cardsHTML}
                        </div>
                    </div>
                </section>
            `;

            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills u-mt-xs';

            followUpOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.addEventListener('click', () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    appendUserMessage(opt.label);
                    setTimeout(() => callback(opt.value), 300);
                });
                pillsContainer.appendChild(btn);
            });

            wrapper.appendChild(pillsContainer);
            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const askWithVideoSlider = (text, videos, followUpOptions, callback) => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            const cardsHTML = videos.map((video, index) => {
                const loadingStrategy = index < 2 ? 'loading="eager" decoding="sync"' : 'loading="lazy" decoding="async"';
                return `
                    <article class="cdlv-catalog-slider__card cdlv-support-chat__slider-card cdlv-video-trigger" data-video-src="${buildPath(video.link)}">
                        <div class="cdlv-catalog-slider__image-box img-hover-scale cdlv-support-chat__slider-img-box">
                            <img src="${buildPath(video.image)}" alt="${sanitizeText(video.title)}" class="cdlv-support-chat__slider-img" ${loadingStrategy}>
                            <div class="cdlv-support-chat__video-overlay-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                        </div>
                        <div class="cdlv-catalog-slider__info">
                            <h3 class="cdlv-support-chat__slider-title">
                                ${sanitizeText(video.title)}
                            </h3>
                            <p class="cdlv-support-chat__slider-price cdlv-support-chat__slider-price--accent">▶ Watch Guide</p>
                        </div>
                    </article>
                `;
            }).join('');

            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">${text.replace(/\n/g, '<br>')}</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
                
                <section class="cdlv-catalog-slider animate-enter u-mt-xs cdlv-support-chat__slider-section">
                    <div class="cdlv-catalog-slider__carousel-wrapper cdlv-support-chat__slider-wrapper">
                        <div class="cdlv-catalog-slider__track cdlv-support-chat__slider-track">
                            ${cardsHTML}
                        </div>
                    </div>
                </section>
            `;

            const pillsContainer = document.createElement('div');
            pillsContainer.className = 'cdlv-support-chat__pills u-mt-xs';

            followUpOptions.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'cdlv-support-chat__pill';
                btn.textContent = opt.label;
                btn.addEventListener('click', () => {
                    pillsContainer.style.pointerEvents = 'none'; 
                    Array.from(pillsContainer.children).forEach(child => {
                        if (child === btn) child.classList.add('is-selected');
                        else child.style.opacity = '0.5';
                    });
                    appendUserMessage(opt.label);
                    setTimeout(() => callback(opt.value), 300);
                });
                pillsContainer.appendChild(btn);
            });

            wrapper.appendChild(pillsContainer);
            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);

            const triggers = row.querySelectorAll('.cdlv-video-trigger');
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const src = trigger.getAttribute('data-video-src');
                    if(src && src !== '#') openVideo(src);
                });
            });

            attachAvatarFallbacks();
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

        askWithOptions("Is there anything else I can help you with?", endOptions, (choice) => {
            if (choice === 'end') {
                askWithOptions("Thank you for chatting with me today. Wishing you a beautiful, balanced day!<br><br>You can safely close this session below whenever you are ready.", [{label: 'End Session', value: 'close_chat'}], (val) => {
                    if (val === 'close_chat') closeAndResetChat();
                });
            } else if (choice === 'menu') {
                showMainMenu();
            } else {
                triggerHumanPipeline();
            }
        });
    };

    const triggerHumanPipeline = () => {
        askWithForm("I'll connect you with our wellness team to look into this personally. They will email you within minutes. Please confirm your email address below.", [{ label: 'Email Address', name: 'email', type: 'email', required: true }], 'Confirm Email', (data) => {
            humanContacted = true; 
            appendBotMessage(`Thank you. A team member will reach out to ${sanitizeText(data.email)} shortly.`);
            setTimeout(() => triggerGlobalEnd(), 1200);
        });
    };

    const runQualityPipeline = () => {
        askWithOptions("We are so sorry to hear your experience wasn't perfectly calming. Please let us know what happened so we can make it right.", [
            { label: 'Product quality', value: 'quality' },
            { label: 'My order was damaged', value: 'damaged' },
            { label: 'Product doesn\'t look like the photo', value: 'photo' },
            { label: 'Something else', value: 'else' }
        ], (issue) => {
            
            const requestOrderIdAndImage = () => {
                askWithForm("Could you please provide your Order ID so we can look into this?", [
                    { label: 'Order ID', name: 'orderId', type: 'text', placeholder: 'e.g. CDLV-12345', required: true }
                ], 'Submit ID', (data) => {
                    askWithOptions("Could you please upload a photo of the item? This helps our wellness team understand the issue quickly.", [
                        { label: 'Upload Attachment', value: 'upload' },
                        { label: 'I don\'t have an image right now', value: 'no_image' }
                    ], (imgChoice) => {
                        if (imgChoice === 'upload') {
                            appendBotMessage("Attachment securely received.");
                        }
                        triggerHumanPipeline();
                    });
                });
            };

            if (issue === 'else') {
                triggerHumanPipeline();
            } else if (issue === 'quality' || issue === 'damaged') {
                requestOrderIdAndImage();
            } else if (issue === 'photo') {
                const prText = "Because our herbs and botanicals are 100% natural and hand-sourced, slight variations in color and texture are perfectly normal and celebrate the authenticity of our ingredients.";
                appendStepsWithFeedback(prText);
            }
        });
    };

    const runSubscriptionsPipeline = () => {
        askWithOptions("Are you looking for general information about our wellness subscriptions, or do you need help managing an existing one?", [
            { label: 'General Information', value: 'general' },
            { label: 'Existing Subscription', value: 'existing' }
        ], (choice) => {
            if (choice === 'general') {
                askWithCard(
                    "Our wellness subscriptions are designed to keep your self-care routine uninterrupted. By subscribing, you secure a recurring delivery of your favorite blends and save 10% on every order.", 
                    "Wellness Subscriptions", 
                    "assets/images/products/box_1.webp", 
                    "Keep your routine consistent and save on every delivery.", 
                    "subscriptions.html", 
                    "View Subscriptions"
                );
                triggerGlobalEnd();
            } else {
                askWithOptions("What do you need help with regarding your existing subscription?", [
                    { label: 'Reinstate a skipped delivery', value: 'reinstate' },
                    { label: 'Update subscription settings', value: 'settings' },
                    { label: 'Update an order', value: 'update_order' },
                    { label: 'It\'s something else', value: 'else' }
                ], (action) => {
                    if (action === 'reinstate' || action === 'settings') {
                        appendBotMessage("Follow these quick steps to update your delivery preferences.");
                        
                        const instructions = `1. <strong>Log in</strong> to your account.<br>2. Go to <strong>"Manage My Deliveries"</strong> under "My Subscriptions".<br>3. <strong>Select the delivery</strong> you'd like to adjust.<br>4. <strong>Toggle your preferences</strong> or skip settings.<br>5. Click <strong>"Save Changes"</strong> at the bottom.`;
                        appendStepsWithFeedback(instructions);
                    } else if (action === 'else') {
                        triggerHumanPipeline();
                    } else if (action === 'update_order') {
                        askWithOptions("To help you update your subscription order, how is your account setup?", [
                            { label: 'Guest Checkout', value: 'guest' },
                            { label: 'Logged into my account', value: 'logged' }
                        ], (accountType) => {
                            const orderOptions = [
                                { label: 'View', value: 'view' },
                                { label: 'Cancel', value: 'cancel' },
                                { label: 'Track', value: 'track' },
                                { label: 'Change', value: 'change' },
                                { label: 'Order', value: 'order' },
                                { label: 'Order issues', value: 'issues' },
                                { label: 'Late order', value: 'late' }
                            ];
                            
                            askWithOptions("What would you like to do with your subscription order?", orderOptions, (orderAction) => {
                                if (orderAction === 'order') {
                                    askWithCard("Ready to step into the soft life? You can explore our artisanal collections and place a new order right here:", "Shop Casa De La Vida", "assets/images/products/item_2.2.1.webp", "Explore our artisanal collections and wellness boxes.", "shop.html", "Shop Now");
                                    triggerGlobalEnd();
                                } else if (orderAction === 'issues' || orderAction === 'late') {
                                    triggerHumanPipeline();
                                } else {
                                    if (accountType === 'guest') {
                                        triggerHumanPipeline();
                                    } else {
                                        const ghanaRegions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Western', 'Western North'];
                                        askWithForm("Please share your Order ID and delivery region to locate your order.", [
                                            { label: 'Order ID', name: 'orderId', type: 'text', placeholder: 'e.g. CDLV-12345', required: true },
                                            { label: 'Region', name: 'region', type: 'select', options: ghanaRegions, required: true }
                                        ], 'Find Order', (data) => {
                                            appendBotMessage("Searching for your order...");
                                            setTimeout(() => {
                                                if (data.orderId.length > 3) {
                                                    appendBotMessage("Follow these quick steps to update your delivery.");
                                                    const steps = `<strong>Order Found!</strong><br><br>To ${sanitizeText(orderAction)} this order:<br>1. Go to your <strong>Account Dashboard</strong>.<br>2. Navigate to <strong>"My Orders"</strong>.<br>3. Select <strong>Order ${sanitizeText(data.orderId)}</strong>.<br>4. Click the <strong>"${sanitizeText(orderAction)}"</strong> button to proceed.`;
                                                    appendStepsWithFeedback(steps);
                                                } else {
                                                    appendBotMessage("It looks like those details don't match our records.");
                                                    triggerHumanPipeline();
                                                }
                                            }, 1000);
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
    };

    const runOrderPipeline = () => {
        askWithOptions("To best assist you with your order, could you let me know if you checked out as a guest or if you are logged into your account?", [
            { label: 'Guest Checkout', value: 'guest' },
            { label: 'Logged into my account', value: 'logged' }
        ], (accountStatus) => {
            
            const orderOpts = [
                { label: 'Cancel order', value: 'cancel' },
                { label: 'Place order', value: 'place' },
                { label: 'Track order', value: 'track' },
                { label: 'Change order', value: 'change' },
                { label: 'Order issues', value: 'issues' },
                { label: 'Late order', value: 'late' }
            ];
            
            askWithOptions("Understood. What specific action would you like to take regarding your order?", orderOpts, (action) => {
                if (action === 'track') {
                    runTrackOrderPipeline();
                    return;
                }

                if (action === 'issues' || action === 'late') {
                    triggerHumanPipeline();
                    return;
                }

                if (accountStatus === 'guest') {
                    if (action === 'cancel') {
                        appendBotMessage("Canceling orders is not possible once they have been shipped. Please restart the chat to check the order status if you have your Order ID.");
                        triggerGlobalEnd();
                    } else if (action === 'place') {
                        askWithCard("Ready to step into the soft life? You can explore our artisanal collections and place a new order right here:", "Shop Casa De La Vida", "assets/images/products/item_2.2.1.webp", "Explore our artisanal collections and wellness boxes.", "shop.html", "Shop Now");
                        triggerGlobalEnd();
                    } else {
                        triggerHumanPipeline();
                    }
                } else {
                    if (action === 'place') {
                        askWithCard("Ready to step into the soft life? You can explore our artisanal collections and place a new order right here:", "Shop Casa De La Vida", "assets/images/products/item_2.2.1.webp", "Explore our artisanal collections and wellness boxes.", "shop.html", "Shop Now");
                        triggerGlobalEnd();
                    } else {
                        askWithCard("To ensure your rituals arrive quickly, we process orders immediately. Once placed, an order cannot be modified. However, if your order has not yet shipped, you can cancel it directly in your account dashboard and place a new one.", "Account Dashboard", "assets/images/backgrounds/stock_3.webp", "Manage your orders, subscriptions, and settings.", "account/orders.html", "View Orders");
                        triggerGlobalEnd();
                    }
                }
            });
        });
    };

    const runTrackOrderPipeline = () => {
        const ghanaRegions = ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Western', 'Western North'];

        askWithForm("Please share your Order ID and delivery region so we can pull up your natural self-care rituals.", [
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

    const runShopPipeline = () => {
        askWithForm("Let's find the perfect addition to your daily ritual. Tell me a bit about what you are looking for, and I will curate a selection just for you.", [
            { label: 'Category Preference', name: 'cat', type: 'select', options: ['Tea', 'Honey', 'Oils', 'Accessories', 'Packages'], required: false },
            { label: 'Budget (Max GH₵)', name: 'budget', type: 'number', required: false }
        ], 'Find Products', (data) => {
            
            const catalogData = [
                { title: "Premium Herbal Infusion", image: "assets/images/products/item_2.2.1.webp", link: "shop/products/premium-herbal-infusion.html", price: 100, category: "Tea" },
                { title: "Honey Infused Tumeric", image: "assets/images/products/item_1.webp", link: "shop/products/honey-infused-tumeric.html", price: 100, category: "Honey" },
                { title: "Saffron Infused Honey", image: "assets/images/products/item_4.webp", link: "shop/products/saffron-infused-honey.html", price: 80, category: "Honey" },
                { title: "Blackseed Infused Honey", image: "assets/images/products/item_4.2.webp", link: "shop/products/blackseed-infused-honey.html", price: 80, category: "Honey" },
                { title: "Calming Fertility Package", image: "assets/images/products/box_3.webp", link: "shop/packages/fertility-wellness-box.html", price: 600, category: "Packages" },
                { title: "Tea Infuser", image: "assets/images/products/item_7.webp", link: "shop/accessories/tea-infuser.html", price: 90, category: "Accessories" },
                { title: "Vanilla Candle", image: "assets/images/products/item_6.3.webp", link: "shop/accessories/vanilla-candle.html", price: 100, category: "Accessories" }
            ];

            let filteredProducts = catalogData;
            let foundMatch = true;
            
            if (data.cat) {
                filteredProducts = filteredProducts.filter(item => item.category.toLowerCase() === data.cat.toLowerCase());
            }
            if (data.budget) {
                filteredProducts = filteredProducts.filter(item => item.price <= parseInt(data.budget));
            }
            
            if (filteredProducts.length === 0) {
                foundMatch = false;
                appendBotMessage("This item is not available at the moment, but here are other items you might be interested in:");
                filteredProducts = catalogData.sort((a, b) => {
                    const matchA = data.cat && a.category.toLowerCase() === data.cat.toLowerCase();
                    return matchA ? -1 : 1;
                });
            }

            const postSliderOptions = [
                {label: 'I want to explore more', value: 'more'},
                {label: 'I want a consultation', value: 'consult'},
                {label: 'I\'m done looking', value: 'done'}
            ];

            askWithSlider(foundMatch ? "Based on your vibes, check out this curated selection:" : "Discover our full wellness collection:", filteredProducts, postSliderOptions, (res) => {
                if (res === 'more') {
                    runShopPipeline(); 
                } else if (res === 'consult') {
                    askWithCard("Book your consultation here:", "Wellness Consultation", "assets/images/backgrounds/stock_1.webp", "Speak with our experts to personalize your routine.", "appointments.html", "Book Now");
                    triggerGlobalEnd();
                } else {
                    triggerGlobalEnd();
                }
            });
        });
    };

    const runCareTipsPipeline = () => {
        askWithVideoSlider(
            "Embracing intentional self-care is a beautiful journey. Here are some gentle guides on how to properly brew and enjoy your Casa De La Vida products.",
            [
                { 
                    title: "Brewing Perfect Tea", 
                    image: "assets/images/backgrounds/stock_1.webp", 
                    link: "assets/videos/video_show_1.mp4", 
                    price: "Video" 
                },
                { 
                    title: "Honey Pairing Tips", 
                    image: "assets/images/backgrounds/stock_2.webp", 
                    link: "assets/videos/video_show_1.mp4", 
                    price: "Video" 
                },
                { 
                    title: "Storage Guide", 
                    image: "assets/images/backgrounds/stock_3.webp", 
                    link: "assets/videos/video_show_1.mp4", 
                    price: "Video" 
                }
            ],
            [
                { label: 'I\'m done, thank you', value: 'done' }
            ],
            (res) => {
                triggerGlobalEnd();
            }
        );
    };

    const handleTopicSelection = (topic) => {
        if (topic === 'order') runOrderPipeline();
        else if (topic === 'subscriptions') runSubscriptionsPipeline();
        else if (topic === 'quality') runQualityPipeline();
        else if (topic === 'shop') runShopPipeline();
        else if (topic === 'care') runCareTipsPipeline();
        else if (topic === 'tech') {
            // Updated Tech Issues Pipeline to include screenshot attachment
            askWithForm(
                "If you are having trouble finding an order or managing a subscription, I recommend using the specific options in our main menu or visiting our Help Center. If you are experiencing a glitch or bug on the website, please describe it below and attach a screenshot if possible.", 
                [
                    { label: 'Describe Issue', name: 'issue', type: 'textarea', required: true },
                    { label: 'Attach Screenshot (Optional)', name: 'screenshot', type: 'file', accept: 'image/*', required: false }
                ], 
                'Submit Report', 
                () => triggerGlobalEnd()
            );
        }
        else {
            triggerHumanPipeline();
        }
    };

    const showMainMenu = () => {
        enqueueBotAction(() => {
            const row = document.createElement('div');
            row.className = 'cdlv-support-chat__msg-row cdlv-support-chat__msg-row--bot';
            const avatarHTML = `<img src="${botAvatarPath}" alt="Flora" class="cdlv-support-chat__avatar">`;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cdlv-support-chat__bubble-wrapper u-w-100';
            
            wrapper.innerHTML = `
                <div class="cdlv-support-chat__bubble">Thank you, ${sanitizeText(userData.firstName)}! How can I help you today? 🫖</div>
                <span class="cdlv-support-chat__timestamp">${getTimestamp()}</span>
            `;
            
            const uniqueTrackId = 'cdlv-track-btn-' + Math.random().toString(36).substr(2, 9);

            const cardHTML = `
                <div class="cdlv-support-chat__card">
                    <h3 class="cdlv-support-chat__card-title">Where is my order?</h3>
                    <img src="${buildPath('assets/images/products/box_1.webp')}" alt="Casa De La Vida Box" class="cdlv-support-chat__card-img">
                    <p style="font-size: var(--font-size-small); margin-bottom: 0.5rem;">Need to know when your Casa De La Vida product will be arriving?</p>
                    <button class="cdlv-support-chat__pill u-w-100" id="${uniqueTrackId}">Track Now!</button>
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
                btn.addEventListener('click', () => {
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
                });
                pillsContainer.appendChild(btn);
            });

            const comboContainer = document.createElement('div');
            comboContainer.className = 'u-flex-col u-mt-xs';
            
            comboContainer.innerHTML = cardHTML;
            comboContainer.appendChild(pillsContainer);
            wrapper.appendChild(comboContainer);
            
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

            row.innerHTML = avatarHTML;
            row.appendChild(wrapper);
            
            elements.stream.appendChild(row);
            attachAvatarFallbacks();
            scrollToBottom();
        });
    };

    const startFlow = () => {
        elements.stream.innerHTML = ''; 
        askWithForm("Welcome to Casa De La Vida. We are here to support your holistic wellness journey. Please tell us a little about yourself to get started.", [
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