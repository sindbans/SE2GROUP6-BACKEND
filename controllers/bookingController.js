// controllers/bookingController.js
const { bookTicket } = require('../services/bookingService');

/**
 * POST /api/bookings
 * Expected JSON body:
 * {
 *   "userId": "<logged in user's ObjectId>",  // optional; if not provided, guest checkout is assumed
 *   "guestName": "Guest Name",                // required if userId not provided
 *   "guestEmail": "guest@example.com",        // required if userId not provided
 *   "eventType": "MovieSchema" | "ConcertSchema" | "TheatreSchema" | "OtherEventSchema",
 *   "eventId": "<event document _id>",
 *   // For movies/theatre:
 *   "seatNumbers": ["M1-S5"],                 // array of selected seat numbers
 *   // For concerts/other events:
 *   "tier": "VIP",                            // chosen ticket tier
 *   "price": 50                               // price per ticket
 * }
 * Returns the generated ticket details.
 */
exports.createBooking = async (req, res) => {
    try {
        const bookingDetails = req.body;
        // Validate required fields.
        if (!bookingDetails.eventType || !bookingDetails.eventId || !bookingDetails.price) {
            return res.status(400).json({ message: 'Missing required booking details.' });
        }
        // For guest checkout, require guestName and guestEmail.
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
