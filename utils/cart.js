/* ==========================================================================
   MODULE: CART LOCAL STORAGE MANAGER (utils/cart.js)
   Purpose: Handles all persistent browser storage for the shopping cart.
   Security: Enforces Zero Trust payload generation for the backend.
   ========================================================================== */

const CART_STORAGE_KEY = 'cdlv_cart';

/**
 * Safely retrieves and parses the cart from LocalStorage.
 * @returns {Array} The current cart items.
 */
export const getCart = () => {
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
        console.error('Failed to parse cart data from LocalStorage:', error);
        return []; // Return empty cart if JSON is corrupted
    }
};

/**
 * Safely saves the cart array to LocalStorage.
 * @param {Array} cart - The cart array to save.
 */
const saveCart = (cart) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Failed to save cart to LocalStorage:', error);
    }
};

/**
 * Adds a new item to the cart or increases the quantity if it already exists.
 * @param {Object} item - Must contain at least { id, quantity }.
 */
export const addToCart = (item) => {
    const cart = getCart();
    // Check if the exact product (and variant, if applicable) is already in the cart
    const existingItemIndex = cart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.variant === item.variant
    );

    if (existingItemIndex > -1) {
        // Increment quantity, ensuring we don't exceed maxStock if provided
        const newQty = cart[existingItemIndex].quantity + item.quantity;
        const maxStock = cart[existingItemIndex].maxStock || Infinity;
        cart[existingItemIndex].quantity = Math.min(newQty, maxStock);
    } else {
        // Add fresh item
        cart.push(item);
    }

    saveCart(cart);
};

/**
 * Updates the quantity of a specific item.
 * @param {string} id - The product ID.
 * @param {number} newQuantity - The new quantity value.
 */
export const updateItemQuantity = (id, newQuantity) => {
    const cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
            // Remove item entirely if quantity drops to 0 or below
            cart.splice(itemIndex, 1);
        } else {
            const maxStock = cart[itemIndex].maxStock || Infinity;
            cart[itemIndex].quantity = Math.min(newQuantity, maxStock);
        }
        saveCart(cart);
    }
};

/**
 * Completely removes an item from the cart.
 * @param {string} id - The product ID.
 */
export const removeFromCart = (id) => {
    const cart = getCart();
    const updatedCart = cart.filter((item) => item.id !== id);
    saveCart(updatedCart);
};

/**
 * Empties the entire cart (used after successful checkout).
 */
export const clearCart = () => {
    localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * ZERO TRUST PAYLOAD GENERATOR
 * Strips out local prices, names, and images. Returns only the pure
 * mathematical requirements for the database checkout transaction.
 * @returns {Array} [{ product_id: string, quantity: number }]
 */
export const getCheckoutPayload = () => {
    const cart = getCart();
    return cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
    }));
};