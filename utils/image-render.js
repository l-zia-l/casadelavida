/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js)
   Purpose: Globally intercepts images, hides them, and triggers a radial 
   reveal animation only after they have fully downloaded.
   Features: Supports Group Synchronization via [data-image-sync] container attribute.
   ========================================================================== */

const handleImageLoad = (img) => {
    requestAnimationFrame(() => {
        img.classList.add('is-loaded');
    });
};

const setupImageReveal = (img) => {
    // Skip if already set up, or if it's a structural UI icon
    if (img.classList.contains('u-img-reveal') || img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        return;
    }

    // ==========================================================================
    // NEW: GLOBAL SYNCHRONIZATION GATE
    // ==========================================================================
    const syncContainer = img.closest('[data-image-sync]');
    
    // Only group images that are meant to load immediately (ignore lazy ones)
    if (syncContainer && img.getAttribute('loading') !== 'lazy') {
        
        // If we haven't locked this specific container yet, lock it and group its images
        if (!syncContainer.hasAttribute('data-sync-active')) {
            syncContainer.setAttribute('data-sync-active', 'true');
            
            // Grab all images in THIS container that are NOT lazy
            const syncImages = Array.from(syncContainer.querySelectorAll('img:not([loading="lazy"])'));
            
            const promises = syncImages.map(syncImg => {
                syncImg.classList.add('u-img-reveal'); // Hide immediately
                
                // If browser already cached it, resolve immediately
                if (syncImg.complete && syncImg.naturalHeight !== 0) return Promise.resolve();
                
                // Otherwise, wait for the network
                return new Promise(resolve => {
                    syncImg.addEventListener('load', resolve, { once: true });
                    syncImg.addEventListener('error', resolve, { once: true }); // Fail-safe
                });
            });

            // Wait for all visible images in this container, then reveal together
            Promise.all(promises).then(() => {
                requestAnimationFrame(() => {
                    syncImages.forEach(syncImg => syncImg.classList.add('is-loaded'));
                });
            });
        }
        // Exit early so the individual logic below doesn't run on grouped images
        return; 
    }

    // ==========================================================================
    // ORIGINAL FALLBACK: Individual & Lazy Images
    // ==========================================================================
    img.classList.add('u-img-reveal');

    if (img.complete && img.naturalHeight !== 0) {
        handleImageLoad(img);
    } else {
        img.addEventListener('load', () => handleImageLoad(img), { once: true });
        img.addEventListener('error', () => handleImageLoad(img), { once: true });
    }
};

export const initImageRenderer = () => {
    document.querySelectorAll('img').forEach(setupImageReveal);

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageRenderer);
} else {
    initImageRenderer();
}