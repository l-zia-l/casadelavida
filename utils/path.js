/* ==========================================================================
   MODULE: PATH RESOLVER (utils/paths.js)
   Purpose: Dynamically generates absolute URLs for assets and links, ensuring
   they work across local environments, GitHub Pages, and custom domains.
   ========================================================================== */

export const getBaseUrl = () => {
    const { origin, pathname } = window.location;
    
    // GitHub Pages logic: It typically hosts in a subfolder (username.github.io/repo-name)
    if (origin.includes('github.io')) {
        // Extracts the repo name from the path
        const repoName = pathname.split('/')[1]; 
        return `${origin}/${repoName}`;
    }
    
    // Localhost or Custom Domain (No subfolder)
    return origin;
};

// Helper function to wrap any path
export const buildPath = (relativePath) => {
    // Strip leading slash if accidentally provided
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    return `${getBaseUrl()}/${cleanPath}`;
};