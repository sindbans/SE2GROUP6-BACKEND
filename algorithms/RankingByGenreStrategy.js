// algorithms/RankingByGenreStrategy.js
const RankingStrategy = require('./RankingStrategy');

class RankingByGenreStrategy extends RankingStrategy {
    // Sort events alphabetically by genre.
    rank(events) {
        return events.sort((a, b) => {
            const genreA = a.genre || '';
            const genreB = b.genre || '';
            if (genreA < genreB) return -1;
            if (genreA > genreB) return 1;
            return 0;
        });
    }
}

module.exports = RankingByGenreStrategy;
