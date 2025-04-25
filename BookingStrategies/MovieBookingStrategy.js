const BookingStrategy = require('./BookingStrategy');
const Movie = require('../models/MovieSchema');
const Ticket = require('../models/TicketSchema');

class MovieBookingStrategy extends BookingStrategy {
    /**
     * For movies, booking details should include:
     * - userId (optional) OR guestName and guestEmail for guest checkout
     * - eventId (Movie _id)
     * - seatNumbers: array of selected seat numbers
     * - price: price per ticket
     * - paymentToken: token from Stripe Checkout
     */
    async book({ userId, guestName, guestEmail, eventId, seatNumbers, price, paymentToken }) {
        if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            throw new Error('No seat numbers provided for movie booking.');
        }
        if (!paymentToken) {
            throw new Error('Payment token is required to confirm booking.');
        }
        if (!userId && (!guestName || !guestEmail)) {
            throw new Error('Guest checkout requires guestName and guestEmail.');
        }

        const movie = await Movie.findById(eventId);
        if (!movie) throw new Error('Movie event not found.');

        if (movie.seats.every(seat => seat.isBought)) {
            throw new Error('Event sold out');
        }

        for (const seatNumber of seatNumbers) {
            const seat = movie.seats.find(s => s.seatNumber === seatNumber);
            if (!seat) throw new Error(`Seat ${seatNumber} not found.`);
            if (seat.isBought) throw new Error(`Seat ${seatNumber} is already booked.`);
        }

        // Mark seats as booked.
        for (const seatNumber of seatNumbers) {
            const seat = movie.seats.find(s => s.seatNumber === seatNumber);
            seat.isBought = true;
        }
        await movie.save();

        // Create tickets for each seat.
        const tickets = [];
        for (const seatNumber of seatNumbers) {
            const ticketData = {
                eventName: movie.name,
                eventDate: movie.screeningDate,
                price,
                movie: movie._id,
                seatNumber,
                seatTier: "Assigned",
                paymentToken
            };
            if (userId) {
                ticketData.customer = userId;
            } else {
                ticketData.guestName = guestName;
                ticketData.guestEmail = guestEmail;
            }
            const ticket = new Ticket(ticketData);
            const savedTicket = await ticket.save();
            // Update seat with ticket number.
            const seat = movie.seats.find(s => s.seatNumber === seatNumber);
            seat.ticketNumber = savedTicket.ticketId;
            tickets.push({ ticketId: savedTicket.ticketId, seatNumber: savedTicket.seatNumber });
        }
        await movie.save();
        return { tickets };
    }
}

module.exports = MovieBookingStrategy;
