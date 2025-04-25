// promotionGenerator.js
const stripe = require('stripe')(process.env.STRIPE_KEY, {
    apiVersion: '2025-03-31.basil'
});

/**
 * Creates a coupon and corresponding promotion code.
 *
 * @param {Object} options - Promotion options.
 * @param {number} options.percentOff - Discount percentage (e.g. 20 for 20% off).
 * @param {string} options.duration - One of "once", "repeating", or "forever".
 * @param {boolean} options.userSpecific - If true, the promotion is tied to a specific user.
 * @param {string} [options.customerEmail] - Required if userSpecific is true.
 * @param {string} [options.createdBy] - The management UID creating this coupon (for site‑wide promotions).
 * @returns {Promise<Object>} The created promotion code object.
 */
async function createPromotion({ percentOff, duration, userSpecific, customerEmail, createdBy }) {
    // Create a coupon in Stripe.
    const coupon = await stripe.coupons.create({
        percent_off: percentOff,
        duration
    });

    // Prepare promotion code parameters.
    const promoData = {
        coupon: coupon.id,
        active: true
    };

    // For user-specific promotions, require and attach the customer email in metadata.
    if (userSpecific) {
        if (!customerEmail) {
            throw new Error('customerEmail must be provided for user-specific promotions.');
        }
        promoData.metadata = { customerEmail: customerEmail.toLowerCase() };
    } else if (createdBy) {
        // For site-wide promotions created by management, include the creator.
        promoData.metadata = { createdBy };
    }

    // Create a promotion code.
    const promotionCode = await stripe.promotionCodes.create(promoData);
    return promotionCode;
}

module.exports = { createPromotion };
