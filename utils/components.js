/* ==========================================================================
   COMPONENT REGISTRY (utils/components.js)
   Architecture: Dynamic ES Module Importer & Fragment Injector
   Purpose: Scans the DOM for elements with `data-module` attributes and 
   dynamically imports the corresponding JavaScript logic.
   Security: Utilizes strict path mapping to prevent arbitrary file inclusion.
   ========================================================================== */

const MODULE_PATH = '../modules/'; 

/**
 * Initializes all modules found within a specific DOM node.
 * @param {HTMLElement|Document} rootNode - The node to scan (defaults to document)
 */
export async function initializeComponents(rootNode = document) {
    // Scan only within the provided root node
    const moduleNodes = rootNode.querySelectorAll('[data-module]');

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
            
            // Extract and parse custom configuration if it exists
            const rawConfig = node.getAttribute('data-config');
            let customConfig = {};
            
            if (rawConfig) {
                try {
                    customConfig = JSON.parse(rawConfig);
                } catch (jsonError) {
                    console.error(`Invalid JSON configuration in data-config for module ${moduleName}:`, jsonError);
                }
            }

            // Check if the module exports an 'init' function
            if (module.init && typeof module.init === 'function') {
                // Pass the specific node and the parsed configuration
                module.init(node, customConfig);
            } else {
                console.warn(`Module ${moduleName} does not export an init function.`);
            }
        } catch (error) {
            console.error(`Failed to load JS module: ${moduleName}`, error);
        }
    }
}

// Auto-initialize on DOMContentLoaded for static HTML elements
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeComponents(document));
} else {
    initializeComponents(document);
}