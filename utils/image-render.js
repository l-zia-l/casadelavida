/* ==========================================================================
   MODULE: IMAGE RENDER ENGINE (utils/image-render.js) - REWRITTEN
   Purpose: Universal image reveal handler, safely animating images on load.
   Architecture: ES Module, Plug-and-Play.
   ========================================================================== */

// Forces a browser reflow, ensuring initial hidden state (.u-img-reveal)
// is rendered before the transition begins.
const forceReflow = (element) => {
    if (!element) return;
    // Accessing layout property forces a reflow.
    void element.offsetHeight; 
};

// ==========================================================================
// Standard Reveal Flow for Individual Images (and failsafe standard handling)
// ==========================================================================
const handleStandardIndividualReveal = (img) => {
    // Re-apply reveal class if somehow missing (failsafe)
    if (!img.classList.contains('u-img-reveal')) img.classList.add('u-img-reveal');
    
    // Safety guard
    if (img.classList.contains('is-loaded')) return;

    // Standard reveal uses the original double rAF strategy
    requestAnimationFrame(() => {
        // Force Reflow on image
        forceReflow(img);
        
        // Add loaded state next frame
        requestAnimationFrame(() => {
            img.classList.add('is-loaded');
        });
    });
};


// ==========================================================================
// Core Processing Function
// ==========================================================================
const setupImageReveal = (img) => {
    // --- 1. Guard Clauses & Validation ---
    if (!img || img.tagName !== 'IMG' || img.hasAttribute('data-image-tracked')) return;
    
    // Exclude UI icons (header/footer typically don't animate like this)
    if (img.closest('.cdlv-header__nav') || img.closest('.cdlv-footer')) {
        img.setAttribute('data-image-tracked', 'true'); // still track it so we don't look again
        return;
    }

    // --- 2. Initial Setup: Set Tracking Attribute ---
    img.setAttribute('data-image-tracked', 'true');
    
    // Failure failsafe: Ensure standard base hidden state exists.
    // The HTML templates from components should already have this class.
    if (!img.classList.contains('u-img-reveal')) {
        img.classList.add('u-img-reveal');
    }

    // --- 3. Determine Image Priority/Strategy ---
    // Priority/Cached images bypass 'load' events. Sync images must wait for the group.
    const syncContainer = img.closest('[data-image-sync]');
    const isPriorityOrEager = (img.getAttribute('fetchpriority') === 'high' || img.getAttribute('loading') === 'eager');
    
    // ==========================================================================
    // BRANCH A: SYNCHRONIZED GROUP REVEAL (wait for priority group members)
    // ==========================================================================
    // This logic handles priority/cached images (catalog cards and compact heroes)
    // and ensures they sync loading state before revealing smoothly.
    if (syncContainer && isPriorityOrEager) {
        
        // Group initialization (runs only once per container)
        if (!syncContainer.hasAttribute('data-sync-active')) {
            syncContainer.setAttribute('data-sync-active', 'true');
            
            // Collect images. We use Double rAF to wait until the DOM insertion that triggered this is complete.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Collect priority images for sync.
                    const syncImages = Array.from(syncContainer.querySelectorAll('img:not([loading="lazy"])'));
                    
                    // Failsafe: Ensure reveal state exists
                    syncImages.forEach(si => {
                        if (!si.classList.contains('u-img-reveal')) si.classList.add('u-img-reveal');
                    });

                    // Create loading promises
                    const promises = syncImages.map(syncImg => {
                        return new Promise(resolve => {
                            if (syncImg.complete) {
                                resolve();
                            } else {
                                syncImg.addEventListener('load', resolve, { once: true });
                                syncImg.addEventListener('error', resolve, { once: true }); 
                            }
                        });
                    });

                    // BRANCH A ENDSTATE: Reveal entire group simultaneously
                    Promise.all(promises).then(() => {
                        
                        // Critical reveal flow: wait for a fresh frame
                        requestAnimationFrame(() => {
                            // !!! SOLUTION !!!
                            // Force a forced reflow ON THE CONTAINER.
                            // This guarantees the hidden state of ALL images paints BEFORE we add 'is-loaded'.
                            forceReflow(syncContainer);
                            
                            // Next frame, apply 'is-loaded'. Transition starts for entire group.
                            requestAnimationFrame(() => {
                                syncImages.forEach(si => si.classList.add('is-loaded'));
                            });
                        });
                    });
                });
            });
        }
        // Do not continue to individual handling for sync images, 
        // otherwise they might trigger before the group Promise resolves.
        return;
    }

    // ==========================================================================
    // BRANCH B: INDIVIDUAL IMAGE REVEAL (Standard/Lazy handling)
    // ==========================================================================
    if (img.complete) {
        // If already complete (cached standard image), reveal safely
        handleStandardIndividualReveal(img);
    } else {
        // Otherwise, wait for standard events
        img.addEventListener('load', () => handleStandardIndividualReveal(img), { once: true });
        img.addEventListener('error', () => handleStandardIndividualReveal(img), { once: true });
    }
};

// ==========================================================================
// Initialization and Mutation Observer (Unchanged logic)
// ==========================================================================
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