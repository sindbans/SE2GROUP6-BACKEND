// bookingStrategies/OtherEventBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const OtherEvent = require('../models/OtherEventSchema');
const Ticket = require('../models/TicketSchema');

class OtherEventBookingStrategy extends BookingStrategy {
    /**
     * For other events, booking details should include:
     * - userId
     * - eventId (OtherEvent _id)
     * - tier: chosen ticket tier
     * - price: price per ticket
     */
    async book({ userId, eventId, tier, price }) {
        if (!tier) {
            throw new Error('Ticket tier must be provided for booking.');
        }
        const otherEvent = await OtherEvent.findById(eventId);
        if (!otherEvent) throw new Error('Other event not found.');

        const pricing = otherEvent.ticketPricing.find(tp => tp.tier === tier);
        if (!pricing) throw new Error('Invalid ticket tier.');
        if (pricing.amountAvailable <= 0) throw new Error('No tickets available for this tier.');

        const ticket = new Ticket({
            eventName: otherEvent.name,
            eventDate: otherEvent.date,
            price,
            customer: userId,
            otherEvent: otherEvent._id,
            seatTier: tier
        });
        const savedTicket = await ticket.save();
        return { ticketNumber: savedTicket.ticketId, tier };
    }
}

module.exports = OtherEventBookingStrategy;
