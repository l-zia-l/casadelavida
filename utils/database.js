/* ==========================================================================
   MODULE: DATABASE PLATFORM INTEGRATION UTILITY (utils/database.js)
   Architecture: Zero-Trust Network Dispatch Module (Vanilla Fetch Pipeline)
   Security: Sources network credentials out of isolated ENV configurations.
   ========================================================================== */

import { getCheckoutPayload } from './cart.js';
import { ENV } from './env.js'; // <-- INGEST IMMUTABLE ENVIRONMENT CONFIGS

/**
 * Collects form inputs and dispatches raw payload properties out to the cloud.
 * @param {Object} cartState - Core state reference containing checkout details.
 * @returns {Promise<Object>} Verification status responses from database procedure blocks.
 */
export const dispatchOrderToDatabase = async (cartState) => {
    try {
        const s = cartState.shippingDetails;
        const sanitizedCartItems = getCheckoutPayload();

        if (!sanitizedCartItems || sanitizedCartItems.length === 0) {
            throw new Error("Checkout Aborted: Inventory tracking state collections evaluate to empty.");
        }

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

        // SECURE CONTEXT SOURCE: Pulling values directly out of our module interface wrapper
        const endpointUrl = `${ENV.SUPABASE_URL}/rest/v1/rpc/place_guest_order`;

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': ENV.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(networkPayload)
        });

        if (!response.ok) {
            const rawErrorMsg = await response.text();
            console.error("CRITICAL DATABASE REJECTION RESPONSE:", rawErrorMsg);
            
            // Temporary Triage Hack: Bubble the real error message to your UI popup!
            try {
                const parsedError = JSON.parse(rawErrorMsg);
                return { success: false, triageMessage: parsedError.message || rawErrorMsg };
            } catch {
                return { success: false, triageMessage: rawErrorMsg };
            }
        }

        return await response.json();

    } catch (error) {
        console.error("Graceful Error Block Interception:", error.message);
        return {
            success: false,
            message: "Network exception encountered during execution parameters processing."
        };
    }
};