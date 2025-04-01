// bookingStrategies/MovieBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const Movie = require('../models/MovieSchema');
const Ticket = require('../models/TicketSchema');

class MovieBookingStrategy extends BookingStrategy {
    /**
     * For movies, booking details should include:
     * - userId
     * - eventId (Movie _id)
     * - seatNumbers: array of selected seat numbers
     * - price: price per ticket
     */
    async book({ userId, eventId, seatNumbers, price }) {
        if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            throw new Error('No seat numbers provided for movie booking.');
        }
        const movie = await Movie.findById(eventId);
        if (!movie) throw new Error('Movie event not found.');

        // Validate each requested seat
        for (const seatNumber of seatNumbers) {
            const seat = movie.seats.find(s => s.seatNumber === seatNumber);
            if (!seat) throw new Error(`Seat ${seatNumber} not found.`);
            if (seat.isBought) throw new Error(`Seat ${seatNumber} is already booked.`);
        }

        // Create tickets for each seat
        const tickets = [];
        for (const seatNumber of seatNumbers) {
            const ticket = new Ticket({
                eventName: movie.name,
                eventDate: movie.screeningDate,
                price,
                customer: userId,
                movie: movie._id,
                seatNumber, // assigned seat
                seatTier: "Assigned"
            });
            const savedTicket = await ticket.save();
            tickets.push({ ticketId: savedTicket.ticketId, seatNumber: savedTicket.seatNumber });
        }
        return { tickets };
    }
}

module.exports = MovieBookingStrategy;
