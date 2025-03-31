const RankingStrategyFactory = require('../algorithms/RankingStrategyFactory');

function applyRanking(events, strategyType, options = {}) {
    if (!strategyType) {
        return events;
    }
    const rankingStrategy = RankingStrategyFactory.getStrategy(strategyType, options);
    return rankingStrategy.rank(events);
}

module.exports = {
    applyRanking,
};
