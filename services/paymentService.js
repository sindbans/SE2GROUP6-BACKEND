const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});

async function createCheckoutSession({ customerEmail, items, successUrl, cancelUrl, promotionCode }) {
    // Map items to Stripe line_items.
    // With automatic_tax enabled, you don't need to pass explicit tax_rates.
    const line_items = items.map(item => ({
        price_data: {
            currency: item.currency || 'usd',
            product_data: {
                name: item.name,
                description: item.description || '',
            },
            unit_amount: Math.round(item.amount * 100), // in cents
        },
        quantity: item.quantity || 1,
    }));

    // Create the session data with automatic tax enabled.
    const sessionData = {
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items,
        mode: 'payment',
        automatic_tax: { enabled: true },
        success_url: successUrl,
        cancel_url: cancelUrl,
    };

    // If a promotion code is provided, add it via discounts.
    if (promotionCode) {
        sessionData.discounts = [{ promotion_code: promotionCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    return session;
}

module.exports = { createCheckoutSession };
