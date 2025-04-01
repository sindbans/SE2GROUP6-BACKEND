// bookingStrategies/ConcertBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const Concert = require('../models/ConcertSchema');
const Ticket = require('../models/TicketSchema');

class ConcertBookingStrategy extends BookingStrategy {
    /**
     * For concerts, booking details should include:
     * - userId (optional) OR guestName and guestEmail for guest checkout
     * - eventId (Concert _id)
     * - tier: chosen ticket tier (e.g., "VIP" or "Standard")
     * - price: price per ticket
     */
    async book({ userId, guestName, guestEmail, eventId, tier, price }) {
        if (!tier) {
            throw new Error('Ticket tier must be provided for concert booking.');
        }
        if (!userId && (!guestName || !guestEmail)) {
            throw new Error('Guest checkout requires guestName and guestEmail.');
        }
        const concert = await Concert.findById(eventId);
        if (!concert) throw new Error('Concert event not found.');

        if (concert.ticketPricing.every(tp => tp.amountAvailable <= 0)) {
            throw new Error('Event sold out');
        }

        const pricing = concert.ticketPricing.find(tp => tp.tier === tier);
        if (!pricing) throw new Error('Invalid ticket tier.');
        if (pricing.amountAvailable <= 0) {
            throw new Error('No tickets available for this tier');
        }

        pricing.amountAvailable -= 1;
        await concert.save();

        const ticketData = {
            eventName: concert.name,
            eventDate: concert.date,
            price,
            concert: concert._id,
            seatTier: tier
        };
        if (userId) {
            ticketData.customer = userId;
        } else {
            ticketData.guestName = guestName;
            ticketData.guestEmail = guestEmail;
        }
        const ticket = new Ticket(ticketData);
        const savedTicket = await ticket.save();

        return { ticketNumber: savedTicket.ticketId, tier };
    }
}

module.exports = ConcertBookingStrategy;
