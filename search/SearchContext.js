const AllSearchStrategy = require('./AllSearchStrategy');
const MovieSearchStrategy = require('./MovieSearchStrategy');
const ConcertSearchStrategy = require('./ConcertSearchStrategy');
const TheatreSearchStrategy = require('./TheatreSearchStrategy');
const OtherSearchStrategy = require('./OtherSearchStrategy');

const CompanySearchStrategy = require('./CompanyStrategy');
const EmployeeSearchStrategy = require('./EmployeeStrategy');
const ManagementSearchStrategy = require('./ManagementStrategy');
const CustomerSearchStrategy = require('./CustomerStrategy');
const TicketSearchStrategy = require('./TicketStrategy');

class SearchContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    async executeSearch(searchTerm, uid, companyId) {
        // If uid and companyId are undefined, we're in consumer search mode.
        if (uid === undefined && companyId === undefined) {
            return await this.strategy.search(searchTerm);
        } else {
            return await this.strategy.search(searchTerm, uid, companyId);
        }
    }

    static getStrategyByType(type, uid, companyId) {
        // Normalize type to lower-case so that 'employee' or 'Employee' both work.
        const normalizedType = type.toLowerCase();
        switch (normalizedType) {
            case 'company':
                return new CompanySearchStrategy();
            case 'employee':
                return new EmployeeSearchStrategy(companyId);
            case 'management':
                return new ManagementSearchStrategy(companyId);
            case 'customer':
                return new CustomerSearchStrategy();
            case 'ticket':
                return new TicketSearchStrategy();
            case 'all':
                return new AllSearchStrategy();
            case 'movies':
                return new MovieSearchStrategy();
            case 'concerts':
                return new ConcertSearchStrategy();
            case 'theatre':
                return new TheatreSearchStrategy();
            case 'other':
                return new OtherSearchStrategy();
            default:
                throw new Error('Invalid search type provided');
        }
    }
}

module.exports = SearchContext;
