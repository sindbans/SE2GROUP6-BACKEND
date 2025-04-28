// services/bookingService.js
const BookingStrategyFactory = require('../BookingStrategies/BookingStrategyFactory');

/**
 * bookTicket selects the proper booking strategy based on eventType and delegates the booking.
 * @param {Object} bookingDetails - The booking details (see bookingController for structure)
 * @returns {Object} ticket details returned by the strategy
 */
async function bookTicket(bookingDetails) {
    const strategy = BookingStrategyFactory.getStrategy(bookingDetails.eventType);
    return await strategy.book(bookingDetails);
}

module.exports = { bookTicket };
