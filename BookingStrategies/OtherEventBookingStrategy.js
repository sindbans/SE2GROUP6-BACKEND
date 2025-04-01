// bookingStrategies/OtherEventBookingStrategy.js
const BookingStrategy = require('./BookingStrategy');
const OtherEvent = require('../models/OtherEventSchema');
const Ticket = require('../models/TicketSchema');

class OtherEventBookingStrategy extends BookingStrategy {
    /**
     * For other events, booking details should include:
     * - userId (optional) OR guestName and guestEmail for guest checkout
     * - eventId (OtherEvent _id)
     * - tier: chosen ticket tier
     * - price: price per ticket
     */
    async book({ userId, guestName, guestEmail, eventId, tier, price }) {
        if (!tier) {
            throw new Error('Ticket tier must be provided for booking.');
        }
        if (!userId && (!guestName || !guestEmail)) {
            throw new Error('Guest checkout requires guestName and guestEmail.');
        }
        const otherEvent = await OtherEvent.findById(eventId);
        if (!otherEvent) throw new Error('Other event not found.');

        if (otherEvent.ticketPricing.every(tp => tp.amountAvailable <= 0)) {
            throw new Error('Event sold out');
        }

        const pricing = otherEvent.ticketPricing.find(tp => tp.tier === tier);
        if (!pricing) throw new Error('Invalid ticket tier.');
        if (pricing.amountAvailable <= 0) {
            throw new Error('No tickets available for this tier');
        }

        pricing.amountAvailable -= 1;
        await otherEvent.save();

        const ticketData = {
            eventName: otherEvent.name,
            eventDate: otherEvent.date,
            price,
            otherEvent: otherEvent._id,
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

module.exports = OtherEventBookingStrategy;
