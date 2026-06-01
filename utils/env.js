/* ==========================================================================
   MODULE: APPLICATION ENVIRONMENT CONFIGURATION (utils/env.js)
   Architecture: Standard Browser ES Module Environment Interface
   Security Note: These are frontend variables. Do not store private master keys here!
   ========================================================================== */

// Core environment dictionary configuration
const ENV_CONFIG = {
    SUPABASE_URL: "https://pyruwoqnfmaoqrbrcyvz.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_XlQA7oq_Svz49kvWewTAxg_r6DLSRe6",
    
    // Change this flag to 'production' when your database goes live
    MODE: "development" 
};

// Freeze the environment config dictionary to prevent client-side runtime tampering
export const ENV = Object.freeze(ENV_CONFIG);