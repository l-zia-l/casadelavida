/* ==========================================================================
   MODULE: IMAGE RIGHT TEXT LEFT (modules/img-right-text-left.js)
   Architecture: Exportable ES Module. Responsive split layout. 
   Customization: Supports both Image and Video media types with custom controls.
   Security: DOMPurify-style text/URL sanitization. Event delegation.
   A11y & SEO: WCAG compliant, semantic landmarks, aria-labels for video controls.
   ========================================================================== */

import { buildPath } from '../utils/path.js';

const sanitizeText = (str) => {
    if (typeof str !== 'string') return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
};

const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return '';
    return encodeURI(url.replace(/javascript:/gi, ''));
};

// SVG Icons for Video Controls
const icons = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    rewind: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`,
    forward: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
    volumeOn: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    volumeOff: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
};

const defaultConfig = {
    mediaType: "image", // Options: "image" | "video"
    videoSrc: "",       // Used if mediaType is "video"
    imageSrc: "assets/images/logo.png", // Used as image source OR video poster
    imageAlt: "Casa De La Vida Logo",
    layout: "image-right", 
    headingLevel: "h2", 
    subtitle: "Our Story",
    title: "Supporting Women's Health",
    content: ["Casa De La Vida was born from a simple but powerful intention..."],
    showCTA: true, 
    ctaText: "Discover More", 
    ctaLink: "about-us.html", 
    isLCP: false 
};

export const init = (node, customConfig = {}) => {
    const config = { ...defaultConfig, ...customConfig };
    
    const instanceId = Math.random().toString(36).substring(2, 9);
    const titleId = `cdlv-section-title-${instanceId}`;
    const safeAlt = sanitizeText(config.imageAlt);
    const ariaHiddenAttr = safeAlt === "" ? `aria-hidden="true" role="presentation"` : "";
    
    const imageLoadingAttr = config.isLCP ? 'fetchpriority="high"' : 'loading="lazy"';
    const textAnimateClass = config.isLCP ? '' : 'animate-enter';
    const safeHeadingLevel = /^[a-zA-Z0-9]+$/.test(config.headingLevel) ? config.headingLevel.toLowerCase() : 'h2';
    const layoutModifier = config.layout === "image-left" ? "image-left" : "image-right";

    const resolvedImageSrc = sanitizeUrl(buildPath(config.imageSrc));
    const resolvedVideoSrc = config.videoSrc ? sanitizeUrl(buildPath(config.videoSrc)) : '';

    const renderContent = (contentData) => {
        if (Array.isArray(contentData)) {
            return contentData.map(paragraph => `<p class="cdlv-img-right-text-left__body">${sanitizeText(paragraph)}</p>`).join('');
        }
        return `<p class="cdlv-img-right-text-left__body">${sanitizeText(contentData)}</p>`;
    };

    const renderCTA = () => {
        if (config.showCTA && config.ctaText && config.ctaLink) {
            return `<a href="${sanitizeUrl(buildPath(config.ctaLink))}" class="cdlv-img-right-text-left__cta">${sanitizeText(config.ctaText)}</a>`;
        }
        return '';
    };

    const renderMedia = () => {
        if (config.mediaType === "video" && resolvedVideoSrc) {
            return `
                <div class="cdlv-video-wrapper">
                    <video class="cdlv-img-right-text-left__video" poster="${resolvedImageSrc}" preload="metadata">
                        <source src="${resolvedVideoSrc}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="cdlv-video-controls" aria-label="Video Controls">
                        <button type="button" class="cdlv-video-btn" data-action="rewind" aria-label="Rewind 10 seconds">${icons.rewind}</button>
                        <button type="button" class="cdlv-video-btn" data-action="play" aria-label="Play video">${icons.play}</button>
                        <button type="button" class="cdlv-video-btn" data-action="forward" aria-label="Forward 10 seconds">${icons.forward}</button>
                        <button type="button" class="cdlv-video-btn" data-action="mute" aria-label="Mute video">${icons.volumeOn}</button>
                    </div>
                </div>
            `;
        }
        const imageRevealClass = config.isLCP ? '' : 'u-img-reveal';
        return `<img src="${resolvedImageSrc}" alt="${safeAlt}" ${ariaHiddenAttr} ${imageLoadingAttr} class="cdlv-img-right-text-left__image ${imageRevealClass}">`;
    };

    node.innerHTML = `
        <section class="cdlv-img-right-text-left cdlv-img-right-text-left--${layoutModifier} u-fill-width" aria-labelledby="${titleId}">
            <div class="container-fluid cdlv-img-right-text-left__grid">
                <article class="cdlv-img-right-text-left__content ${textAnimateClass}">
                    ${config.subtitle ? `<span class="cdlv-img-right-text-left__subtitle">${sanitizeText(config.subtitle)}</span>` : ''}
                    <${safeHeadingLevel} id="${titleId}" class="cdlv-img-right-text-left__title">${sanitizeText(config.title)}</${safeHeadingLevel}>
                    ${renderContent(config.content)}
                    ${renderCTA()}
                </article>
                <figure class="cdlv-img-right-text-left__media">
                    ${renderMedia()}
                </figure>
            </div>
        </section>
    `;

    // Initialize Video Logic if video exists
    const videoElement = node.querySelector('.cdlv-img-right-text-left__video');
    if (videoElement) {
        const controls = node.querySelector('.cdlv-video-controls');
        const playBtn = controls.querySelector('[data-action="play"]');
        const muteBtn = controls.querySelector('[data-action="mute"]');

        const togglePlay = () => {
            if (videoElement.paused) {
                videoElement.play();
                playBtn.innerHTML = icons.pause;
                playBtn.setAttribute('aria-label', 'Pause video');
            } else {
                videoElement.pause();
                playBtn.innerHTML = icons.play;
                playBtn.setAttribute('aria-label', 'Play video');
            }
        };

        // Delegate clicks on the controls wrapper
        controls.addEventListener('click', (e) => {
            const btn = e.target.closest('.cdlv-video-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            if (action === 'play') togglePlay();
            if (action === 'rewind') videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
            if (action === 'forward') videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
            if (action === 'mute') {
                videoElement.muted = !videoElement.muted;
                muteBtn.innerHTML = videoElement.muted ? icons.volumeOff : icons.volumeOn;
                muteBtn.setAttribute('aria-label', videoElement.muted ? 'Unmute video' : 'Mute video');
            }
        });

        // Allow clicking the video itself to play/pause
        videoElement.addEventListener('click', togglePlay);
    }
};