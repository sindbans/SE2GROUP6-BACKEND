const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

async function createCheckoutSession({ customerEmail, items, successUrl, cancelUrl, promotionCode }) {
  try {
    const line_items = items.map(item => {
      const amountInPaisa = Number(item.amount); // ✅ Must already be in paisa (15000 = ₹150)
      return {
        price_data: {
          currency: item.currency || 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: amountInPaisa,
        },
        quantity: item.quantity || 1,
      };
    });

    const selectedSeats = items.map(item => item.name.split(' - Seat ')[1]).join(', ');
    const eventTitle = items[0]?.name?.split(' - ')[0] || 'Untitled Event';

    const sessionData = {
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items,
      mode: 'payment',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: {
        selectedSeats,
        eventTitle,
      },
    };

    if (promotionCode) {
      sessionData.discounts = [{ promotion_code: promotionCode }];
    }

    console.log("✅ Stripe session payload:\n", JSON.stringify(sessionData, null, 2));

    const session = await stripe.checkout.sessions.create(sessionData);
    return session;

  } catch (error) {
    console.error("❌ Stripe error:", error.message);
    throw new Error('Stripe checkout session creation failed.');
  }
}

module.exports = { createCheckoutSession };
