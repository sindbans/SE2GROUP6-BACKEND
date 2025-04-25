// bookingStrategies/BookingStrategyFactory.js
const MovieBookingStrategy = require('./MovieBookingStrategy');
const ConcertBookingStrategy = require('./ConcertBookingStrategy');
const TheatreBookingStrategy = require('./TheatreBookingStrategy');
const OtherEventBookingStrategy = require('./OtherEventBookingStrategy');

class BookingStrategyFactory {
    /**
     * Returns an instance of the appropriate booking strategy based on eventType.
     * @param {string} eventType - One of "MovieSchema", "ConcertSchema", "TheatreSchema", or "OtherEventSchema"
     */
    static getStrategy(eventType) {
        switch (eventType) {
            case 'MovieSchema':
                return new MovieBookingStrategy();
            case 'ConcertSchema':
                return new ConcertBookingStrategy();
            case 'TheatreSchema':
            case 'Theatre':
                return new TheatreBookingStrategy();
            case 'OtherEventSchema':
                return new OtherEventBookingStrategy();
            default:
                throw new Error('Unsupported event type for booking');
        }
    }
}

module.exports = BookingStrategyFactory;
