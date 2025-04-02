const { createCheckoutSession } = require('../services/paymentService');

exports.createPaymentSession = async (req, res) => {
    try {
        const { customerEmail, items } = req.body;
        if (!customerEmail || !items) {
            return res.status(400).json({ message: 'Missing customer email or items for checkout.' });
        }
        // Use environment variables or defaults for URLs.
        const successUrl = process.env.SUCCESS_URL || 'https://yourfrontend.com/success?session_id={CHECKOUT_SESSION_ID}';
        const cancelUrl = process.env.CANCEL_URL || 'https://yourfrontend.com/cancel';

        const session = await createCheckoutSession({ customerEmail, items, successUrl, cancelUrl });
        return res.status(201).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error in createPaymentSession:', error);
        return res.status(400).json({ message: error.message });
    }
};
