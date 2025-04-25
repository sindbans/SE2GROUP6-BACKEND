// bookingStrategies/BookingStrategy.js
class BookingStrategy {
    /**
     * book() must implement the booking logic.
     * @param {Object} bookingDetails - details needed for booking
     * @returns {Object} the created ticket details
     */
    async book(bookingDetails) {
        throw new Error('book() must be implemented by subclass');
    }
}

module.exports = BookingStrategy;
