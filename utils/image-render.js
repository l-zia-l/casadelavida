/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js)
   Purpose: The universal hub for image load tracking and smooth revealing.
   ========================================================================== */

const handleImageLoad = (img) => {
    // DOUBLE rAF: Forces the browser to paint the hidden state before adding the class
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            img.classList.add('is-loaded');
        });
    });
};

const setupImageReveal = (img) => {
    if (img.hasAttribute('data-image-tracked') || img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        return;
    }
    
    img.setAttribute('data-image-tracked', 'true');

    if (!img.classList.contains('u-img-reveal')) {
        img.classList.add('u-img-reveal');
    }

    // ==========================================================================
    // GROUP SYNCHRONIZATION
    // ==========================================================================
    const syncContainer = img.closest('[data-image-sync]');
    
    if (syncContainer && img.getAttribute('loading') !== 'lazy') {
        
        if (!syncContainer.hasAttribute('data-sync-active')) {
            syncContainer.setAttribute('data-sync-active', 'true');
            
            setTimeout(() => {
                const syncImages = Array.from(syncContainer.querySelectorAll('img:not([loading="lazy"])'));
                
                const promises = syncImages.map(syncImg => {
                    syncImg.setAttribute('data-image-tracked', 'true'); 
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
                    // DOUBLE rAF for the synchronized groups as well
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            syncImages.forEach(syncImg => syncImg.classList.add('is-loaded'));
                        });
                    });
                });
            }, 0);
        }
        return; 
    }

    // ==========================================================================
    // INDIVIDUAL IMAGES
    // ==========================================================================
    if (img.complete) {
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