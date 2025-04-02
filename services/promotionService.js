const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});

/**
 * Retrieves promotion codes from Stripe.
 * If a customerEmail is provided, it filters for promotion codes that are either
 * site‑wide (no user-specific metadata) or marked for that customer.
 *
 * @param {Object} options - Options for filtering promotions.
 * @param {string} [options.customerEmail] - If provided, filter for promotions applicable to that customer.
 * @returns {Object} List of promotion codes.
 */
async function listPromotionCodes({ customerEmail } = {}) {
    // Retrieve all active promotion codes from Stripe.
    // Note: Stripe’s API does not support direct filtering by metadata,
    // so you may need to filter manually after retrieval.
    const promotionCodes = await stripe.promotionCodes.list({
        active: true,
        limit: 100
    });

    // Filter for user-specific if customerEmail is provided.
    // We assume that promotions intended for a specific user are stored with metadata.customerEmail.
    let filteredCodes = promotionCodes.data;
    if (customerEmail) {
        filteredCodes = filteredCodes.filter(pc => {
            // If metadata exists and has a customerEmail value, then only include if it matches.
            // Otherwise, include the code as a site-wide promotion.
            if (pc.metadata && pc.metadata.customerEmail) {
                return pc.metadata.customerEmail.toLowerCase() === customerEmail.toLowerCase();
            }
            return true;
        });
    }

    return filteredCodes;
}

module.exports = { listPromotionCodes };
