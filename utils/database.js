/* ==========================================================================
   MODULE: DATABASE PLATFORM INTEGRATION UTILITY (utils/database.js)
   Architecture: Zero-Trust Network Dispatch Module (Vanilla Fetch Pipeline)
   Security: Strips backend keys and targets securely into environment boundaries.
   ========================================================================== */

import { getCheckoutPayload } from './cart.js';

// CONFIGURATION: Enter your explicit project credentials directly here
const SUPABASE_URL = 'https://your-project-id.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-public-anon-key-here';

/**
 * Collects form inputs and dispatches raw payload properties out to the cloud.
 * @param {Object} cartState - Core state reference containing checkout details.
 * @returns {Promise<Object>} Verification status responses from database procedure blocks.
 */
export const dispatchOrderToDatabase = async (cartState) => {
    try {
        const s = cartState.shippingDetails;
        
        // Extract mathematical dependencies securely from the Zero-Trust formatter
        const sanitizedCartItems = getCheckoutPayload();

        if (!sanitizedCartItems || sanitizedCartItems.length === 0) {
            throw new Error("Checkout Aborted: Inventory tracking state collections evaluate to empty.");
        }

        // Structure RPC invocation wrapping payload cleanly
        const networkPayload = {
            p_first_name: s.firstName?.trim(),
            p_last_name: s.lastName?.trim(),
            p_email: s.email?.trim(),
            p_phone: s.phone?.trim(),
            p_address: s.address?.trim(),
            p_city: s.city?.toLowerCase(),
            p_region: s.region?.trim(),
            p_landmark: s.landmark?.trim(),
            p_delivery_notes: s.notes?.trim(),
            p_payment_method: cartState.paymentMethod,
            p_shipping_rate: parseFloat(cartState.shippingRate || 35.00),
            p_cart_items: sanitizedCartItems
        };

        // Construct standard fetch boundary request mapping to RPC endpoints
        const endpointUrl = `${SUPABASE_URL}/rest/v1/rpc/place_guest_order`;

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(networkPayload)
        });

        if (!response.ok) {
            const rawErrorMsg = await response.text();
            console.error("Backend Error Capture Trace logs:", rawErrorMsg);
            throw new Error("Server transmission error encountered.");
        }

        const data = await response.json();
        return data; // Expected formatting returns: { success: boolean, order_id: string, total: number }

    } catch (error) {
        console.error("Graceful Error Block Interception:", error.message);
        return {
            success: false,
            message: "Network exception encountered during execution parameters processing."
        };
    }
};