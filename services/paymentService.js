const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY,{
    apiVersion:"2025-03-31.basil",
});

async function createCheckoutSession({ customerEmail, items, successUrl, cancelUrl }) {
    // Map items to Stripe line_items
    const line_items = items.map(item => ({
        price_data: {
            currency: item.currency || 'usd',
            product_data: {
                name: item.name,
                description: item.description || '',
            },
            unit_amount: Math.round(item.amount * 100), // Stripe uses cents
        },
        quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: customerEmail,
        line_items,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
    return session;
}

module.exports = { createCheckoutSession };
