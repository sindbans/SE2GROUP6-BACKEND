const AllSearchStrategy = require('./AllSearchStrategy');
const MovieSearchStrategy = require('./MovieSearchStrategy');
const ConcertSearchStrategy = require('./ConcertSearchStrategy');
const TheatreSearchStrategy = require('./TheatreSearchStrategy');
const OtherSearchStrategy = require('./OtherSearchStrategy');

class SearchContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    async executeSearch(searchTerm) {
        return await this.strategy.search(searchTerm);
    }

    static getStrategyByType(type) {
        // The type is expected to be one of: All, Movies, Concerts, Theatre, Other
        switch (type) {
            case 'All':
                return new AllSearchStrategy();
            case 'Movies':
                return new MovieSearchStrategy();
            case 'Concerts':
                return new ConcertSearchStrategy();
            case 'Theatre':
                return new TheatreSearchStrategy();
            case 'Other':
                return new OtherSearchStrategy();
            default:
                throw new Error('Invalid search type provided');
        }
    }
}

module.exports = SearchContext;
