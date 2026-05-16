/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js)
   Purpose: Globally intercepts images, hides them, and triggers a radial 
   reveal animation only after they have fully downloaded.
   ========================================================================== */

const handleImageLoad = (img) => {
    // Add the loaded class to trigger the CSS transition
    requestAnimationFrame(() => {
        img.classList.add('is-loaded');
    });
};

const setupImageReveal = (img) => {
    // Skip if it's already set up, or if it's a tiny icon/logo (we only want this on big photos)
    if (img.classList.contains('u-img-reveal') || img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        return;
    }

    // 1. Add the reveal class
    img.classList.add('u-img-reveal');

    // 2. Wrap the image in our background-colored container
    const wrapper = document.createElement('div');
    wrapper.className = 'u-img-wrapper';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // 3. Check if already cached by the browser
    if (img.complete && img.naturalHeight !== 0) {
        handleImageLoad(img);
    } else {
        // Wait for the download to finish
        img.addEventListener('load', () => handleImageLoad(img), { once: true });
        // Fail-safe just in case the image breaks
        img.addEventListener('error', () => handleImageLoad(img), { once: true });
    }
};

export const initImageRenderer = () => {
    // Process existing images
    document.querySelectorAll('img').forEach(setupImageReveal);

    // Set up an observer to catch dynamically injected images (like your components)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'IMG') {
                    setupImageReveal(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(setupImageReveal);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

// Auto-start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageRenderer);
} else {
    initImageRenderer();
}