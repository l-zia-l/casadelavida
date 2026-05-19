/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js)
   ========================================================================== */

const handleImageLoad = (img) => {
    requestAnimationFrame(() => {
        img.classList.add('is-loaded');
    });
};

const setupImageReveal = (img) => {
    // 1. Universal Bailout: Skip if tracked or structural
    if (img.hasAttribute('data-image-tracked') || img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        return;
    }
    
    // 2. Lock image
    img.setAttribute('data-image-tracked', 'true');

    // 3. Ensure reveal class is present
    if (!img.classList.contains('u-img-reveal')) {
        img.classList.add('u-img-reveal');
    }

    // 4. Reveal individually when ready
    if (img.complete) {
        handleImageLoad(img);
    } else {
        img.addEventListener('load', () => handleImageLoad(img), { once: true });
        // Fail-safe: if an image 404s, reveal the broken image icon so it doesn't leave an empty void
        img.addEventListener('error', () => handleImageLoad(img), { once: true }); 
    }
};

export const initImageRenderer = () => {
    // Track existing images safely
    document.querySelectorAll('img:not([data-image-tracked])').forEach(setupImageReveal);

    // Optimized observer that specifically targets untracked images
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // If the node itself is an image
                if (node.tagName === 'IMG') {
                    setupImageReveal(node);
                } 
                // If the node is a container element
                else if (node.nodeType === 1 && node.querySelectorAll) {
                    node.querySelectorAll('img:not([data-image-tracked])').forEach(setupImageReveal);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageRenderer);
} else {
    initImageRenderer();
}