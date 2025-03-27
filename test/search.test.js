// search.test.js

const AllSearchStrategy = require('../search/AllSearchStrategy');
const MovieSearchStrategy = require('../search/MovieSearchStrategy');
const ConcertSearchStrategy = require('../search/ConcertSearchStrategy');
const TheatreSearchStrategy = require('../search/TheatreSearchStrategy');
const OtherSearchStrategy = require('../search/OtherSearchStrategy');
const SearchContext = require('../search/SearchContext');
const searchController = require('../controllers/searchController');
const Management = require('../models/Management');
const Employee = require('../models/Employee');

// Mocks for our models (assume chainable .sort())
const Event = require('../models/EventSchema');
const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

jest.mock('../models/EventSchema');
jest.mock('../models/MovieSchema');
jest.mock('../models/ConcertSchema');
jest.mock('../models/TheatreSchema');
jest.mock('../models/OtherEventSchema');
jest.mock('../models/Management');
jest.mock('../models/Employee');

describe('Search Strategies', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('AllSearchStrategy', () => {
        const strategy = new AllSearchStrategy();

        test('should search by name only when search term is not a valid date', async () => {
            const searchTerm = "Music Festival";
            const fakeResults = [{ name: "Music Festival" }];
            Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Event.find).toHaveBeenCalledWith({
                $or: [{ name: { $regex: searchTerm, $options: 'i' } }]
            });
            expect(results).toEqual(fakeResults);
        });

        test('should search by name and eventDate when search term is a valid date', async () => {
            const searchTerm = "2025-03-24";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "Some Event", eventDate: parsedDate }];
            Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Event.find).toHaveBeenCalledWith({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { eventDate: parsedDate }
                ]
            });
            expect(results).toEqual(fakeResults);
        });

        test('should return multiple results when more than one event matches', async () => {
            const searchTerm = "Festival";
            const fakeResults = [
                { name: "Music Festival" },
                { name: "Food Festival" }
            ];
            Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(results).toHaveLength(2);
            expect(results).toEqual(fakeResults);
        });
    });

    describe('MovieSearchStrategy', () => {
        const strategy = new MovieSearchStrategy();

        test('should build query without screeningDate when search term is not a valid date', async () => {
            const searchTerm = "Comedy";
            const fakeResults = [{ name: "Funny Movie", genre: "Comedy" }];
            Movie.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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
            Movie.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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

        test('should return multiple movies when several match the criteria', async () => {
            const searchTerm = "Action";
            const fakeResults = [
                { name: "Action Movie 1", genre: "Action" },
                { name: "Action Movie 2", genre: "Action" }
            ];
            Movie.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);
            expect(results).toHaveLength(2);
            expect(results).toEqual(fakeResults);
        });
    });

    describe('ConcertSearchStrategy', () => {
        const strategy = new ConcertSearchStrategy();

        test('should search in name, performers, and sponsors', async () => {
            const searchTerm = "Rock";
            const fakeResults = [{ name: "Rock Night", performers: ["Band A"], sponsors: ["Brand X"] }];
            Concert.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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

        test('should return multiple concerts when several match', async () => {
            const searchTerm = "Rock";
            const fakeResults = [
                { name: "Rock Night", performers: ["Band A"], sponsors: ["Brand X"] },
                { name: "Rock Fest", performers: ["Band B"], sponsors: ["Brand Y"] }
            ];
            Concert.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });
            const results = await strategy.search(searchTerm);
            expect(results).toHaveLength(2);
        });
    });

    describe('TheatreSearchStrategy', () => {
        const strategy = new TheatreSearchStrategy();

        test('should search with valid date inclusion', async () => {
            const searchTerm = "2025-01-01";
            const parsedDate = new Date(searchTerm);
            const fakeResults = [{ name: "The Big Play", date: parsedDate }];
            Theatre.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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

        test('should return multiple theatre shows when several match', async () => {
            const searchTerm = "Play";
            const fakeResults = [
                { name: "The Big Play", date: new Date() },
                { name: "Little Play", date: new Date() }
            ];
            Theatre.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });
            const results = await strategy.search(searchTerm);
            expect(results).toHaveLength(2);
        });
    });

    describe('OtherSearchStrategy', () => {
        const strategy = new OtherSearchStrategy();

        test('should search by name, eventCategory, organizer without date', async () => {
            const searchTerm = "Expo";
            const fakeResults = [{ name: "Tech Expo", eventCategory: "Exhibition", organizer: "Organizer X" }];
            OtherEvent.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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
            OtherEvent.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

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

        test('should return multiple other events when several match', async () => {
            const searchTerm = "Event";
            const fakeResults = [
                { name: "Other Event 1", eventCategory: "Expo" },
                { name: "Other Event 2", eventCategory: "Expo" }
            ];
            OtherEvent.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });
            const results = await strategy.search(searchTerm);
            expect(results).toHaveLength(2);
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

    test('should return results for valid request with multiple items', async () => {
        const fakeResults = [
            { name: "Test Event 1" },
            { name: "Test Event 2" }
        ];
        const strategyMock = { search: jest.fn().mockResolvedValue(fakeResults) };
        const originalGetStrategyByType = SearchContext.getStrategyByType;
        SearchContext.getStrategyByType = jest.fn().mockReturnValue(strategyMock);

        req.body = { type: 'All', query: 'Test Event' };
        await searchController.search(req, res);
        expect(strategyMock.search).toHaveBeenCalledWith('Test Event');
        expect(res.json).toHaveBeenCalledWith({ results: fakeResults });

        SearchContext.getStrategyByType = originalGetStrategyByType;
    });
});
