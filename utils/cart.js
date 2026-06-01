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
        return [];
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
    
    // ARCHITECTURE UPDATE: We now rely purely on our composite ID 
    // (which securely bakes in size, color, and subscription flags)
    const existingItemIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

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
 * @param {string} id - The composite product ID.
 * @param {number} newQuantity - The new quantity value.
 */
export const updateItemQuantity = (id, newQuantity) => {
    const cart = getCart();
    const itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex > -1) {
        if (newQuantity <= 0) {
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
 * @param {string} id - The composite product ID.
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
 * structural requirements for the database checkout transaction.
 * @returns {Array} Clean checkout payload mapped to database expectations.
 */
export const getCheckoutPayload = () => {
    const cart = getCart();
    return cart.map(item => ({
        product_id: item.product_id, // The immutable base ID for database lookup
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        is_subscription: Boolean(item.isSubscription)
    }));
};