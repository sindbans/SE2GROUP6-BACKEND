// bookingStrategies/TheatreBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const Theatre = require('../models/TheatreSchema');
const Ticket = require('../models/TicketSchema');

class TheatreBookingStrategy extends BookingStrategy {
    /**
     * For theatre events, booking details should include:
     * - userId
     * - eventId (Theatre _id)
     * - seatNumbers: array of selected seat numbers
     * - price: price per ticket
     */
    async book({ userId, eventId, seatNumbers, price }) {
        if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            throw new Error('No seat numbers provided for theatre booking.');
        }
        const theatre = await Theatre.findById(eventId);
        if (!theatre) throw new Error('Theatre event not found.');

        for (const seatNumber of seatNumbers) {
            const seat = theatre.seats.find(s => s.seatNumber === seatNumber);
            if (!seat) throw new Error(`Seat ${seatNumber} not found.`);
            if (seat.isBought) throw new Error(`Seat ${seatNumber} is already booked.`);
        }

        const tickets = [];
        for (const seatNumber of seatNumbers) {
            const ticket = new Ticket({
                eventName: theatre.name,
                eventDate: theatre.date,
                price,
                customer: userId,
                theatre: theatre._id,
                seatNumber,
                seatTier: "Assigned"
            });
            const savedTicket = await ticket.save();
            tickets.push({ ticketId: savedTicket.ticketId, seatNumber: savedTicket.seatNumber });
        }
        return { tickets };
    }
}

module.exports = TheatreBookingStrategy;
