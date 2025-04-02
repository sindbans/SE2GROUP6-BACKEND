const { bookTicket } = require('../services/bookingService');

exports.createBooking = async (req, res) => {
    try {
        const bookingDetails = req.body;
        // Validate required fields.
        if (!bookingDetails.eventType || !bookingDetails.eventId || !bookingDetails.price || !bookingDetails.paymentToken) {
            return res.status(400).json({ message: 'Missing required booking details including paymentToken.' });
        }
        if (!bookingDetails.userId) {
            if (!bookingDetails.guestName || !bookingDetails.guestEmail) {
                return res.status(400).json({ message: 'Guest checkout requires guestName and guestEmail.' });
            }
        }
        const ticket = await bookTicket(bookingDetails);
        return res.status(201).json({ ticket });
    } catch (error) {
        console.error('Error in createBooking:', error);
        return res.status(400).json({ message: error.message });
    }
};
