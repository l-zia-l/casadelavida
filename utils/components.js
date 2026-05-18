/* ==========================================================================
   COMPONENT REGISTRY (utils/components.js)
   Architecture: Dynamic ES Module Importer & Fragment Injector
   Purpose: Scans the DOM for elements with `data-module` attributes and 
   dynamically imports the corresponding JavaScript logic.
   Security: Utilizes strict path mapping to prevent arbitrary file inclusion.
   ========================================================================== */

import { buildPath } from './path.js';

const MODULE_PATH = buildPath('modules/');

/**
 * Initializes all modules found within a specific DOM node.
 * @param {HTMLElement|Document} rootNode - The node to scan (defaults to document)
 */
export async function initializeComponents(rootNode = document) {
    // 1. Convert the NodeList to an Array so we can use .map()
    const moduleNodes = Array.from(rootNode.querySelectorAll('[data-module]'));

    // 2. Map over the nodes to create an array of independent Promises
    const initPromises = moduleNodes.map(async (node) => {
        const moduleName = node.getAttribute('data-module');
        
        if (!/^[a-z0-9-]+$/.test(moduleName)) {
            console.warn(`Invalid module name detected: ${moduleName}`);
            return; // Skip this specific module without breaking the others
        }

        try {
            // Because this is inside .map(), all these imports trigger simultaneously!
            const module = await import(`${MODULE_PATH}${moduleName}.js`);
            
            const rawConfig = node.getAttribute('data-config');
            let customConfig = {};
            
            if (rawConfig) {
                try {
                    customConfig = JSON.parse(rawConfig);
                } catch (jsonError) {
                    console.error(`Invalid JSON configuration in data-config for module ${moduleName}:`, jsonError);
                }
            }

            if (module.init && typeof module.init === 'function') {
                module.init(node, customConfig);
            } else {
                console.warn(`Module ${moduleName} does not export an init function.`);
            }
        } catch (error) {
            console.error(`Failed to load JS module: ${moduleName}`, error);
        }
    });

    // 3. Wait for all modules to finish loading concurrently
    await Promise.all(initPromises);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeComponents(document));
} else {
    initializeComponents(document);
}