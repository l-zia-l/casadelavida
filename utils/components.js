/* ==========================================================================
   COMPONENT REGISTRY (utils/components.js)
   Architecture: Dynamic ES Module Importer
   Purpose: Scans the DOM for elements with `data-module` attributes and 
   dynamically imports the corresponding JavaScript logic.
   Security: Utilizes strict path mapping to prevent arbitrary file inclusion 
   or execution vulnerabilities.
   ========================================================================== */

const MODULE_PATH = '/modules/';

/**
 * Initializes all modules found in the current DOM.
 */
export async function initializeComponents() {
    const moduleNodes = document.querySelectorAll('[data-module]');

    for (const node of moduleNodes) {
        const moduleName = node.getAttribute('data-module');
        
        // Strict validation: Allow only alphanumeric characters and hyphens
        if (!/^[a-z0-9-]+$/.test(moduleName)) {
            console.warn(`Invalid module name detected: ${moduleName}`);
            continue;
        }

        try {
            // Dynamically import the module based on the sanitized name
            const module = await import(`${MODULE_PATH}${moduleName}.js`);
            
            // Check if the module exports an 'init' function
            if (module.init && typeof module.init === 'function') {
                module.init(node);
            } else {
                console.warn(`Module ${moduleName} does not export an init function.`);
            }
        } catch (error) {
            console.error(`Failed to load module: ${moduleName}`, error);
        }
    }
}

// Auto-initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}