// algorithms/RankingStrategyFactory.js
const RankingByGenreStrategy = require('./RankingByGenreStrategy');
const RankingByLocationStrategy = require('./RankingByLocationStrategy');
const RankingByRatingStrategy = require('./RankingByRatingStrategy');
const RankingByStartTimeStrategy = require('./RankingByStartTimeStrategy');

class RankingStrategyFactory {
    /**
     * Returns an instance of the appropriate RankingStrategy based on strategyType.
     * For 'location', options.referenceCoordinates must be provided as [lng, lat].
     *
     * @param {string} strategyType - The strategy type ('genre', 'location', 'rating', 'startTime').
     * @param {Object} options - Additional options (e.g. referenceCoordinates for location ranking).
     * @returns {RankingStrategy}
     */
    static getStrategy(strategyType, options = {}) {
        switch (strategyType) {
            case 'genre':
                return new RankingByGenreStrategy();
            case 'location':
                if (!options.referenceCoordinates) {
                    throw new Error('Location ranking requires referenceCoordinates.');
                }
                return new RankingByLocationStrategy(options.referenceCoordinates);
            case 'rating':
                return new RankingByRatingStrategy();
            case 'startTime':
                return new RankingByStartTimeStrategy();
            default:
                throw new Error(`Unknown ranking strategy: ${strategyType}`);
        }
    }
}

module.exports = RankingStrategyFactory;
