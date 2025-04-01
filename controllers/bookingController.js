// controllers/bookingController.js
const { bookTicket } = require('../services/bookingService');

/**
 * POST /api/bookings
 * Expected JSON body:
 * {
 *   "userId": "<user's ObjectId>",
 *   "userType": "customer" | "employee" | "management", // if needed
 *   "eventType": "MovieSchema" | "ConcertSchema" | "TheatreSchema" | "OtherEventSchema",
 *   "eventId": "<event document _id>",  // e.g., Movie _id
 *   // For movies/theatre:
 *   "seatNumbers": ["M1-S5"],         // array of selected seat numbers
 *   // For concerts/other events:
 *   "tier": "VIP",                    // chosen ticket tier (e.g., "Standard" or "VIP")
 *   "price": 50                       // price per ticket
 * }
 * Returns the generated ticket details stored in TicketSchema.
 */
exports.createBooking = async (req, res) => {
    try {
        const bookingDetails = req.body;
        if (!bookingDetails.userId || !bookingDetails.eventType || !bookingDetails.eventId || !bookingDetails.price) {
            return res.status(400).json({ message: 'Missing required booking details.' });
        }
        const ticket = await bookTicket(bookingDetails);
        return res.status(201).json({ ticket });
    } catch (error) {
        console.error('Error in createBooking:', error);
        return res.status(400).json({ message: error.message });
    }
};
