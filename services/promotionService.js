// promotionService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil' // Use your preferred API version for listing if needed.
});

/**
 * Retrieves active promotion codes from Stripe.
 * If customerEmail is provided, filters to include promotions that are either site-wide
 * or specifically marked for that customer.
 *
 * @param {Object} options - Options for filtering promotions.
 * @param {string} [options.customerEmail] - The customer email to filter by.
 * @returns {Promise<Array>} List of active promotion codes.
 */
async function listPromotionCodes({ customerEmail } = {}) {
    const promotionCodes = await stripe.promotionCodes.list({
        active: true,
        limit: 100
    });

    let filteredCodes = promotionCodes.data;
    if (customerEmail) {
        filteredCodes = filteredCodes.filter(pc => {
            if (pc.metadata && pc.metadata.customerEmail) {
                return pc.metadata.customerEmail.toLowerCase() === customerEmail.toLowerCase();
            }
            return true;
        });
    }
    return filteredCodes;
}

module.exports = { listPromotionCodes };
