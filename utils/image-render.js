/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js)
   Purpose: The universal hub for image load tracking and smooth revealing.
   ========================================================================== */

const handleImageLoad = (img) => {
    requestAnimationFrame(() => {
        img.classList.add('is-loaded');
    });
};

const setupImageReveal = (img) => {
    // 1. Universal Bailout: Skip if already tracked, or if it's a structural icon
    if (img.hasAttribute('data-image-tracked') || img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        return;
    }
    
    // Lock this image immediately so the observer ignores it on the next pass
    img.setAttribute('data-image-tracked', 'true');

    // Fail-safe: Ensure it's hidden just in case the HTML template missed the class
    if (!img.classList.contains('u-img-reveal')) {
        img.classList.add('u-img-reveal');
    }

    // ==========================================================================
    // GROUP SYNCHRONIZATION (e.g., Catalog Sliders)
    // ==========================================================================
    const syncContainer = img.closest('[data-image-sync]');
    
    if (syncContainer && img.getAttribute('loading') !== 'lazy') {
        
        if (!syncContainer.hasAttribute('data-sync-active')) {
            syncContainer.setAttribute('data-sync-active', 'true');
            
            // Push to the end of the execution stack to ensure all injected sibling images are in the DOM
            setTimeout(() => {
                const syncImages = Array.from(syncContainer.querySelectorAll('img:not([loading="lazy"])'));
                
                const promises = syncImages.map(syncImg => {
                    syncImg.setAttribute('data-image-tracked', 'true'); // Lock siblings
                    if (!syncImg.classList.contains('u-img-reveal')) syncImg.classList.add('u-img-reveal');
                    
                    return new Promise(resolve => {
                        if (syncImg.complete) {
                            resolve();
                        } else {
                            syncImg.addEventListener('load', resolve, { once: true });
                            syncImg.addEventListener('error', resolve, { once: true }); 
                        }
                    });
                });

                Promise.all(promises).then(() => {
                    requestAnimationFrame(() => {
                        syncImages.forEach(syncImg => syncImg.classList.add('is-loaded'));
                    });
                });
            }, 0);
        }
        return; 
    }

    // ==========================================================================
    // INDIVIDUAL IMAGES (e.g., Hero Banners)
    // ==========================================================================
    if (img.complete) {
        handleImageLoad(img);
    } else {
        img.addEventListener('load', () => handleImageLoad(img), { once: true });
        img.addEventListener('error', () => handleImageLoad(img), { once: true });
    }
};

export const initImageRenderer = () => {
    // Check existing images
    document.querySelectorAll('img').forEach(setupImageReveal);

    // Watch for dynamically injected images
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