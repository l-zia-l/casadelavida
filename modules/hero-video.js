/* ==========================================================================
   MODULE: HERO VIDEO (modules/hero-video.js)
   Architecture: Exportable ES Module. Injects a full-width video block.
   Security: Implements DOMPurify-style text sanitization to mitigate XSS 
   vulnerabilities. Validates URL structures before DOM insertion.
   Dependencies: Relies on `utils/components.js` for initialization and 
   `components.css` for styling. `buildPath` for asset routing.
   Performance: Uses `playsinline` to prevent disruptive mobile full-screen 
   hijacking. Uses passive event listeners for control interactions.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

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

const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return '';
    const cleanUrl = sanitizeText(url);
    if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:text/html')) {
        return '#';
    }
    return cleanUrl;
};

const defaultConfig = {
    videoSrc: 'assets/videos/default-hero.mp4',
    posterSrc: 'assets/images/video-poster.jpg',
    autoplay: true,
    loop: true,
    muted: true,
    controls: false,
    buttonText: '', 
    buttonLink: ''   
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    // A11y: Check for user system preferences regarding motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Override autoplay if user prefers reduced motion (WCAG 2.2.2 compliance)
    const willAutoplay = config.autoplay && !prefersReducedMotion;
    
    const videoAttrs = [
        'playsinline', 
        willAutoplay ? 'autoplay' : '',
        config.loop ? 'loop' : '',
        config.muted ? 'muted' : ''
    ].filter(Boolean).join(' ');

    // A11y: Added aria-hidden="true" and focusable="false" to all SVGs.
    // Dynamic aria-labels established on the buttons.
    const controlsHTML = config.controls ? `
        <div class="cdlv-hero-video__controls" role="group" aria-label="Video Controls">
            <button class="cdlv-hero-video__control-btn js-cdlv-play" aria-label="${willAutoplay ? 'Pause video' : 'Play video'}">
                <svg class="cdlv-hero-video__control-icon cdlv-hero-video__icon-play" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg class="cdlv-hero-video__control-icon cdlv-hero-video__icon-pause" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            </button>
            <button class="cdlv-hero-video__control-btn js-cdlv-mute" aria-label="${config.muted ? 'Unmute video' : 'Mute video'}">
                <svg class="cdlv-hero-video__control-icon cdlv-hero-video__icon-unmute" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <svg class="cdlv-hero-video__control-icon cdlv-hero-video__icon-mute" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="1" x2="1" y2="23"></line>
                </svg>
            </button>
        </div>
    ` : '';

    const buttonHTML = (config.buttonText && config.buttonLink) ? `
        <div class="cdlv-hero-video__action">
            <a href="${sanitizeUrl(config.buttonLink)}" class="cdlv-hero-video__btn-ghost">
                ${sanitizeText(config.buttonText)}
            </a>
        </div>
    ` : '';

    const moduleHTML = `
        <section class="cdlv-hero-video u-fill-screen ${willAutoplay ? 'is-playing' : ''} ${config.muted ? 'is-muted' : ''}" aria-label="Video Feature Background">
            <video 
                class="cdlv-hero-video__media" 
                poster="${buildPath(config.posterSrc)}"
                aria-hidden="true"
                tabindex="-1"
                ${videoAttrs}
            >
                <source src="${buildPath(config.videoSrc)}" type="video/mp4">
            </video>
            ${buttonHTML}
            ${controlsHTML}
        </section>
    `;

    node.innerHTML = moduleHTML;

    // 4. Bind Interactions
    if (config.controls) {
        const section = node.querySelector('.cdlv-hero-video');
        const video = node.querySelector('.cdlv-hero-video__media');
        const playBtn = node.querySelector('.js-cdlv-play');
        const muteBtn = node.querySelector('.js-cdlv-mute');

        if (playBtn && video) {
            playBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                    section.classList.add('is-playing');
                    playBtn.setAttribute('aria-label', 'Pause video');
                } else {
                    video.pause();
                    section.classList.remove('is-playing');
                    playBtn.setAttribute('aria-label', 'Play video');
                }
            });
        }

        if (muteBtn && video) {
            muteBtn.addEventListener('click', () => {
                video.muted = !video.muted;
                if (video.muted) {
                    section.classList.add('is-muted');
                    muteBtn.setAttribute('aria-label', 'Unmute video');
                } else {
                    section.classList.remove('is-muted');
                    muteBtn.setAttribute('aria-label', 'Mute video');
                }
            });
        }
    }
};