const AllSearchStrategy = require('./AllSearchStrategy');
const MovieSearchStrategy = require('./MovieSearchStrategy');
const ConcertSearchStrategy = require('./ConcertSearchStrategy');
const TheatreSearchStrategy = require('./TheatreSearchStrategy');
const OtherSearchStrategy = require('./OtherSearchStrategy');

const AdminSearchStrategy = require('./AdminStrategy');
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

    async executeSearch(searchTerm, userRole, companyId) {
        // Only pass userRole and companyId when needed (for user-based searches)
        if (userRole && companyId !== undefined) {
            return await this.strategy.search(searchTerm, userRole, companyId);
        } else {
            return await this.strategy.search(searchTerm);  // For event searches, only searchTerm is passed
        }
    }

    static getStrategyByType(type, userRole, companyId) {
        // Add new strategies for Admin, Company, Employee, Management, Customer, and Ticket
        switch (type) {
            case 'admin':
                return new AdminSearchStrategy();
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
