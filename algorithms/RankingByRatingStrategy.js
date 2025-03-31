// algorithms/RankingByRatingStrategy.js
const RankingStrategy = require('./RankingStrategy');

class RankingByRatingStrategy extends RankingStrategy {
    // Sort events based on a numeric rating in descending order.
    // Assumes each event object has a 'rating' property.
    rank(events) {
        return events.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return ratingB - ratingA;
        });
    }
}

module.exports = RankingByRatingStrategy;
