const BookingStrategy = require('./BookingStrategy');
const Theatre = require('../models/TheatreSchema');
const Ticket = require('../models/TicketSchema');

class TheatreBookingStrategy extends BookingStrategy {
    /**
     * For theatre events, booking details should include:
     * - userId (optional) OR guestName and guestEmail for guest checkout
     * - eventId (Theatre _id)
     * - seatNumbers: array of selected seat numbers
     * - price: price per ticket
     * - paymentToken: token from Stripe Checkout
     */
    async book({ userId, guestName, guestEmail, eventId, seatNumbers, price, paymentToken }) {
        if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
            throw new Error('No seat numbers provided for theatre booking.');
        }
        if (!paymentToken) {
            throw new Error('Payment token is required to confirm booking.');
        }
        if (!userId && (!guestName || !guestEmail)) {
            throw new Error('Guest checkout requires guestName and guestEmail.');
        }

        const theatre = await Theatre.findById(eventId);
        if (!theatre) throw new Error('Theatre event not found.');

        if (theatre.seats.every(seat => seat.isBought)) {
            throw new Error('Event sold out');
        }

        for (const seatNumber of seatNumbers) {
            const seat = theatre.seats.find(s => s.seatNumber === seatNumber);
            if (!seat) throw new Error(`Seat ${seatNumber} not found.`);
            if (seat.isBought) throw new Error(`Seat ${seatNumber} is already booked.`);
        }

        for (const seatNumber of seatNumbers) {
            const seat = theatre.seats.find(s => s.seatNumber === seatNumber);
            seat.isBought = true;
        }
        await theatre.save();

        const tickets = [];
        for (const seatNumber of seatNumbers) {
            const ticketData = {
                eventName: theatre.name,
                eventDate: theatre.date,
                price,
                theatre: theatre._id,
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
            const seat = theatre.seats.find(s => s.seatNumber === seatNumber);
            seat.ticketNumber = savedTicket.ticketId;
            tickets.push({ ticketId: savedTicket.ticketId, seatNumber: savedTicket.seatNumber });
        }
        await theatre.save();
        return { tickets };
    }
}

module.exports = TheatreBookingStrategy;
