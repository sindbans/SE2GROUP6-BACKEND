const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-03-31.basil'
});

async function createCheckoutSession({ customerEmail, items, successUrl, cancelUrl, promotionCode }) {
    // Map items to Stripe line_items.
    // With automatic_tax enabled, you don't need to pass explicit tax_rates.
    try {

        const line_items = items.map(item => {
            return {
                price_data: {
                    currency: item.currency || 'usd',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.amount * 100), // in cents
                },
                quantity: item.quantity || 1,
            };
        });
        const selectedSeats = items.map(item => item.name.split('- Seat')[1]).join(',');
        const eventTitle = items[0]?.name?.split(' - '[0] || 'Untitled Event')

        // Create the session data with automatic tax enabled.
        const sessionData = {
            payment_method_types: ['card'],
            customer_email: customerEmail,
            line_items,
            mode: 'payment',
            automatic_tax: {enabled: true},
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                selectedSeats,
                eventTitle,
            },
        };

        // If a promotion code is provided, add it via discounts.
        if (promotionCode) {
            sessionData.discounts = [{promotion_code: promotionCode}];
        }

        const session = await stripe.checkout.sessions.create(sessionData);
        return session;
    } catch (error) {
        console.log("Stripe error",error.message);
        throw new Error("Stripe Checkout Session Creation Failed");
    }
}

module.exports = { createCheckoutSession };
