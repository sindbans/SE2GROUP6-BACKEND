// bookingStrategies/ConcertBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const Concert = require('../models/ConcertSchema');
const Ticket = require('../models/TicketSchema');

class ConcertBookingStrategy extends BookingStrategy {
    /**
     * For concerts, booking details should include:
     * - userId
     * - eventId (Concert _id)
     * - tier: chosen ticket tier (e.g., "VIP" or "Standard")
     * - price: price per ticket
     */
    async book({ userId, eventId, tier, price }) {
        if (!tier) {
            throw new Error('Ticket tier must be provided for concert booking.');
        }
        const concert = await Concert.findById(eventId);
        if (!concert) throw new Error('Concert event not found.');

        const pricing = concert.ticketPricing.find(tp => tp.tier === tier);
        if (!pricing) throw new Error('Invalid ticket tier.');
        if (pricing.amountAvailable <= 0) throw new Error('No tickets available for this tier.');

        const ticket = new Ticket({
            eventName: concert.name,
            eventDate: concert.date,
            price,
            customer: userId,
            concert: concert._id,
            seatTier: tier
        });
        const savedTicket = await ticket.save();
        return { ticketNumber: savedTicket.ticketId, tier };
    }
}

module.exports = ConcertBookingStrategy;
