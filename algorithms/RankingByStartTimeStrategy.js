// algorithms/RankingByStartTimeStrategy.js
const RankingStrategy = require('./RankingStrategy');

class RankingByStartTimeStrategy extends RankingStrategy {
    // Sort events based on startTime in ascending order.
    rank(events) {
        return events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    }
}

module.exports = RankingByStartTimeStrategy;
