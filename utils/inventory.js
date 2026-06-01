/* ==========================================================================
   SOURCE OF TRUTH: CENTRAL PRODUCT REGISTER (utils/inventory.js)
   Architecture: Zero-Trust Immutable Reference Dictionary
   Security: Frozen at runtime to eliminate structural parameter tampering.
   ========================================================================== */

export const INVENTORY = Object.freeze({
    "prod_fertility_pkg": Object.freeze({
        id: "prod_fertility_pkg",
        title: "The Fertility Wellness Box",
        subtitle: "Curated holistic self-care routines for intentional feminine wellness.",
        image: "assets/images/products/box_3.webp",
        link: "shop/packages/fertility-wellness-box.html",
        images: Object.freeze([
            "assets/images/products/box_1.webp",
            "assets/images/products/box_2.webp",
            "assets/images/products/box_3.webp",
            "assets/images/products/box_4.webp"
        ]),
        composition: "Each premium box is crafted from durable, high-quality materials and includes an artisanal selection of: our signature loose-leaf herbal infusions, raw honey, pure black seed oil, a heat-resistant glass tea infuser, and a hand-poured ritual candle.",
        bestFor: "Creating a dedicated space for “soft life” rituals, fertility support, gentle body detoxification, and nurturing your mind during busy days.",
        funFact: "Every box arrives with exclusive, beautifully designed instruction cards that guide you step-by-step through the intention and preparation of each ritual item, ensuring a deeply mindful experience.",
        proTip: "Set the tone for your ritual by lighting your candle first, then use your instruction card to reflect on your intention before you begin brewing your tea.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 30, // Percentage value evaluated securely server-side
        isOutOfStock: false,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Grand", desc: "60 Servings", price: 800.00, popular: false, default: false },
            { id: "s2", name: "Deluxe", desc: "40 Servings", price: 700.00, popular: true, default: true },
            { id: "s3", name: "Original", desc: "20 Servings", price: 600.00, popular: false, default: false }
        ]),
        colors: Object.freeze([
            { id: "c1", name: "Baby Pink", img: "assets/images/products/box_1.webp", default: true },
            { id: "c2", name: "Crimson red", img: "assets/images/products/box_2.webp", default: false },
            { id: "c3", name: "Navy Blue", img: "assets/images/products/box_3.webp", default: false },
            { id: "c4", name: "Cream", img: "assets/images/products/box_4.webp", default: false }
        ]),
        subscription: Object.freeze({
            priceText: "GH₵ 1300 + free shipping",
            desc: "Best Value: Up to 30% off. Skip or cancel anytime."
        })
    }),

    "prod_premium_herbal": Object.freeze({
        id: "prod_premium_herbal",
        title: "Premium Herbal Infusion",
        subtitle: "Handpicked premium loose-leaf blends for body restoration.",
        image: "assets/images/products/item_2.2.1.webp",
        link: "shop/products/premium-herbal-infusion.html",
        composition: "Artisanal blend of organic restorative herbs, leaves, and select floral stems.",
        bestFor: "Daily hydration, systemic detoxification, and easing internal inflammation.",
        funFact: "Loose-leaf teas preserve more natural volatile oils than conventional machine-ground tea bags.",
        proTip: "Steep covered for 7-10 minutes to capture all therapeutic botanical compounds.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 10,
        isOutOfStock: false,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Standard", desc: "250g Pack", price: 100.00, popular: true, default: true }
        ]),
        colors: Object.freeze([]), // Explicitly empty attribute array
        subscription: Object.freeze({
            priceText: "Up to 30% Off + Free Shipping",
            desc: "Best Value: Skip or cancel anytime."
        })
    }),

    "prod_honey_turmeric": Object.freeze({
        id: "prod_honey_turmeric",
        title: "Honey Infused Tumeric",
        subtitle: "Golden spice compound mixed with pure raw wildflower honey.",
        image: "assets/images/products/item_1.webp",
        link: "shop/products/honey-infused-tumeric.html",
        composition: "Raw, unpasteurized honey expertly whipped with organic pulverized turmeric root.",
        bestFor: "Post-workout recovery, metabolic warmth, and natural joint support.",
        funFact: "Turmeric's active compound curcumin is highly fat-soluble and pairs beautifully with natural honey matrix components.",
        proTip: "Stir into a warm cup of milk or plant milk to form an instant golden elixir.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 0,
        isOutOfStock: true,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Standard", desc: "250g Glass Jar", price: 100.00, popular: true, default: true }
        ]),
        colors: Object.freeze([]),
        subscription: Object.freeze({
            priceText: "Available for one-time standard order",
            desc: "Wiped clean upon inventory exhaustion."
        })
    }),

    "prod_saffron_honey": Object.freeze({
        id: "prod_saffron_honey",
        title: "Saffron Infused Honey",
        subtitle: "Luxury culinary grade saffron strands suspended in premium honey.",
        image: "assets/images/products/item_4.webp",
        link: "shop/products/saffron-infused-honey.html",
        composition: "Premium raw honey cold-steeped with hand-harvested red saffron threads.",
        bestFor: "Elevating sweet-savory pairings, mood enhancement, and antioxidant supply.",
        funFact: "Saffron requires over 75,000 hand-picked blossoms to cultivate just a single pound of spice.",
        proTip: "Drizzle over fresh cheeses or sourdough toast during quiet afternoon reflections.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 10,
        isOutOfStock: false,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Standard", desc: "250g Jar", price: 80.00, popular: true, default: true }
        ]),
        colors: Object.freeze([]),
        subscription: Object.freeze({
            priceText: "Up to 10% Off on regular monthly delivery",
            desc: "Skip or cancel your subscription whenever needed."
        })
    }),

    "prod_blackseed_honey": Object.freeze({
        id: "prod_blackseed_honey",
        title: "Blackseed-Infused Honey",
        subtitle: "Potent black seed essence blended into pure gold.",
        image: "assets/images/products/item_4.2.webp",
        link: "shop/products/blackseed-infused-honey.html",
        composition: "A premium, expertly crafted blend of raw, unpasteurized wildflower honey infused with high-quality, cold-pressed black seed oil.",
        bestFor: "Supporting a robust immune system, promoting optimal respiratory health, and aiding gentle, natural digestion during your daily wellness rituals.",
        funFact: "Black seed oil has been revered for centuries as a comprehensive holistic remedy, while the raw honey acts as a perfect, nutrient-dense vehicle for its intense, earthy therapeutic properties.",
        proTip: "For the most effective absorption, enjoy one teaspoon of this infused honey on its own or stirred into warm (not boiling) tea during your morning self-care routine.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 10,
        isOutOfStock: true,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Grand", desc: "40 Servings", price: 240.00, popular: false, default: false },
            { id: "s2", name: "Deluxe", desc: "25 Servings", price: 180.00, popular: true, default: true },
            { id: "s3", name: "Original", desc: "10 Servings", price: 100.00, popular: false, default: false }
        ]),
        colors: Object.freeze([]),
        subscription: Object.freeze({
            priceText: "GH₵ 540 + free shipping",
            desc: "Best Value: Up to 30% off. Skip or cancel anytime."
        })
    }),

    "prod_tea_infuser": Object.freeze({
        id: "prod_tea_infuser",
        title: "Tea Infuser",
        subtitle: "High-grade heat-resistant micro-mesh infuser.",
        image: "assets/images/products/item_7.webp",
        link: "shop/accessories/tea-infuser.html",
        composition: "Premium 304 food-grade stainless steel framing alongside an ergonomic lid.",
        bestFor: "Flawless, leaf-free brewing of finer loose herbal blends.",
        funFact: "Micro-mesh filtration maximizes warm water convection without particle leaching.",
        proTip: "Rinse under warm run water immediately post-brew to clear organic solids without soaps.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 10,
        isOutOfStock: false,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Standard", desc: "Stainless Steel", price: 90.00, popular: true, default: true }
        ]),
        colors: Object.freeze([]),
        subscription: Object.freeze({
            priceText: "Add accessory replenishment updates",
            desc: "Billed on cycle terms cleanly."
        })
    }),

    "prod_vanilla_candle": Object.freeze({
        id: "prod_vanilla_candle",
        title: "Vanilla Candle",
        subtitle: "Hand-poured aromatic ritual candles for spatial serenity.",
        image: "assets/images/products/item_6.3.webp",
        link: "shop/accessories/vanilla-candle.html",
        images: Object.freeze([
            "assets/images/products/item_6.1.webp",
            "assets/images/products/item_6.2.webp",
            "assets/images/products/item_6.3.webp",
            "assets/images/products/item_6.4.webp"
        ]),
        composition: "100% natural soy wax core paired with essential vanilla oil extracts.",
        bestFor: "Establishing an anchor point for mindfulness and grounding routines.",
        funFact: "Natural soy wax burns cleanly with up to 50% longer lifespans than petroleum paraffin.",
        proTip: "Trim the fiber wick to 1/4 inch before lighting to guarantee clean soot-free burning.",
        deliveryCountryMsg: "Available for same-day local delivery in Accra and Tamale.",
        subscriptionDiscount: 0,
        isOutOfStock: true,
        hideActions: false,
        inAccra: true,
        inTamale: false,
        sizes: Object.freeze([
            { id: "s1", name: "Standard", desc: "8oz Glass tumbler", price: 100.00, popular: true, default: true }
        ]),
        colors: Object.freeze([]),
        subscription: Object.freeze({
            priceText: "One-time luxury accessory allocation",
            desc: "Subject to seasonal sourcing window ceilings."
        })
    })
});

/**
 * Accessor validation layer. 
 * Prevents system errors by returning structural fallbacks for unmapped items.
 */
export function getProductFromRegistry(id) {
    if (Object.prototype.hasOwnProperty.call(INVENTORY, id)) {
        return INVENTORY[id];
    }
    console.error(`Security Alert: Request received for unregistered item identification token: "${id}". Providing baseline fallback schema wrapper.`);
    return Object.freeze({
        id: "invalid_fallback",
        title: "Unknown Wellness Resource",
        subtitle: "",
        price: 0.00,
        sizes: Object.freeze([]),
        colors: Object.freeze([]),
        isOutOfStock: true,
        hideActions: true
    });
}