// search.test.js

const AllSearchStrategy = require('../search/AllSearchStratgey');
const MovieSearchStrategy = require('../search/MovieSearchStrategy');
const ConcertSearchStrategy = require('../search/ConcertSearchStrategy');
const TheatreSearchStrategy = require('../search/TheatreSearchStrategy');
const OtherSearchStrategy = require('../search/OtherSearchStrategy');
const SearchContext = require('../search/SearchContext');
const searchController = require('../controllers/searchController');

// Mocks for our models
// (Assume that each model's 'find' method is stubbed to return a resolved promise with a predictable value.)
const Event = require('../models/EventSchema');
const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

// Jest mocks for the model methods
jest.mock('../models/EventSchema');
jest.mock('../models/MovieSchema');
jest.mock('../models/ConcertSchema');
jest.mock('../models/TheatreSchema');
jest.mock('../models/OtherEventSchema');

describe('Search Strategies', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('AllSearchStrategy', () => {
        const strategy = new AllSearchStrategy();

        test('should search by name only when search term is not a valid date', async () => {
            const searchTerm = "Music Festival";
            const fakeResults = [{ name: "Music Festival" }];

            // Setup the mock to return fake results
            Event.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            // Expect Event.find to be called with a query that only includes a regex on name
            expect(Event.find).toHaveBeenCalledWith({
                $or: [{ name: { $regex: searchTerm, $options: 'i' } }]
            });
            expect(results).toEqual(fakeResults);
        });

        test('should search by name and eventDate when search term is a valid date', async () => {
            // Use a valid date string
            const searchTerm = "2025-03-24";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "Some Event", eventDate: parsedDate }];

            Event.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(Event.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { eventDate: parsedDate }
                ]
            });
            expect(results).toEqual(fakeResults);
        });
    });

    describe('MovieSearchStrategy', () => {
        const strategy = new MovieSearchStrategy();

        test('should build query without screeningDate when search term is not a valid date', async () => {
            const searchTerm = "Comedy";
            const fakeResults = [{ name: "Funny Movie", genre: "Comedy" }];

            Movie.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(Movie.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { genre: { $regex: searchTerm, $options: 'i' } },
                    { director: { $regex: searchTerm, $options: 'i' } },
                    { cast: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
                ]
            });
            expect(results).toEqual(fakeResults);
        });

        test('should build query including screeningDate when search term is a valid date', async () => {
            const searchTerm = "2025-12-31";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "New Year Special", screeningDate: parsedDate }];

            Movie.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(Movie.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { genre: { $regex: searchTerm, $options: 'i' } },
                    { director: { $regex: searchTerm, $options: 'i' } },
                    { cast: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                    { screeningDate: parsedDate }
                ]
            });
            expect(results).toEqual(fakeResults);
        });
    });

    describe('ConcertSearchStrategy', () => {
        const strategy = new ConcertSearchStrategy();

        test('should search in name, performers, and sponsors', async () => {
            const searchTerm = "Rock";
            const fakeResults = [{ name: "Rock Night", performers: ["Band A"], sponsors: ["Brand X"] }];

            Concert.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(Concert.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { performers: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                    { sponsors: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
                ]
            });
            expect(results).toEqual(fakeResults);
        });
    });

    describe('TheatreSearchStrategy', () => {
        const strategy = new TheatreSearchStrategy();

        test('should search with valid date inclusion', async () => {
            const searchTerm = "2025-01-01";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "The Big Play", date: parsedDate }];

            Theatre.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(Theatre.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { genre: { $regex: searchTerm, $options: 'i' } },
                    { director: { $regex: searchTerm, $options: 'i' } },
                    { cast: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                    { date: parsedDate }
                ]
            });
            expect(results).toEqual(fakeResults);
        });
    });

    describe('OtherSearchStrategy', () => {
        const strategy = new OtherSearchStrategy();

        test('should search by name, eventCategory, organizer without date', async () => {
            const searchTerm = "Expo";
            const fakeResults = [{ name: "Tech Expo", eventCategory: "Exhibition", organizer: "Organizer X" }];

            OtherEvent.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(OtherEvent.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { eventCategory: { $regex: searchTerm, $options: 'i' } },
                    { organizer: { $regex: searchTerm, $options: 'i' } }
                ]
            });
            expect(results).toEqual(fakeResults);
        });

        test('should search including date when search term is a valid date', async () => {
            const searchTerm = "2025-07-04";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "Independence Day", date: parsedDate }];

            OtherEvent.find.mockResolvedValue(fakeResults);

            const results = await strategy.search(searchTerm);

            expect(OtherEvent.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { eventCategory: { $regex: searchTerm, $options: 'i' } },
                    { organizer: { $regex: searchTerm, $options: 'i' } },
                    { date: parsedDate }
                ]
            });
            expect(results).toEqual(fakeResults);
        });
    });
});

describe('SearchContext', () => {
    test('getStrategyByType returns the correct strategy instance', () => {
        expect(SearchContext.getStrategyByType('All')).toBeInstanceOf(AllSearchStrategy);
        expect(SearchContext.getStrategyByType('Movies')).toBeInstanceOf(MovieSearchStrategy);
        expect(SearchContext.getStrategyByType('Concerts')).toBeInstanceOf(ConcertSearchStrategy);
        expect(SearchContext.getStrategyByType('Theatre')).toBeInstanceOf(TheatreSearchStrategy);
        expect(SearchContext.getStrategyByType('Other')).toBeInstanceOf(OtherSearchStrategy);
    });

    test('getStrategyByType throws an error on invalid type', () => {
        expect(() => SearchContext.getStrategyByType('InvalidType')).toThrow('Invalid search type provided');
    });
});

describe('Search Controller', () => {
    // We use plain objects to simulate req and res
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('should return 400 if missing type or query', async () => {
        req.body = { query: 'Test' };
        await searchController.search(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing search type or query' });

        // Now missing query
        req.body = { type: 'Movies' };
        await searchController.search(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing search type or query' });
    });

    test('should return 500 if an invalid search type is provided', async () => {
        req.body = { type: 'Invalid', query: 'Anything' };
        await searchController.search(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid search type provided' });
    });

    test('should return results for valid request', async () => {
        // Here we simulate a successful search by stubbing the strategy
        const fakeResults = [{ name: "Test Event" }];
        // Stub the strategy to return fakeResults
        const strategyMock = { search: jest.fn().mockResolvedValue(fakeResults) };
        const originalGetStrategyByType = SearchContext.getStrategyByType;
        SearchContext.getStrategyByType = jest.fn().mockReturnValue(strategyMock);

        req.body = { type: 'All', query: 'Test Event' };
        await searchController.search(req, res);
        expect(strategyMock.search).toHaveBeenCalledWith('Test Event');
        expect(res.json).toHaveBeenCalledWith({ results: fakeResults });

        // Restore the original function
        SearchContext.getStrategyByType = originalGetStrategyByType;
    });
});
