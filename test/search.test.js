// test/search.test.js

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

describe('Search Strategies with Location (Manhattan NYC)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('AllSearchStrategy', () => {
        const strategy = new AllSearchStrategy();

        test('should search by name only when search term is not a valid date and not coordinates', async () => {
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

        test('should use geospatial query when search term is coordinates (Times Square area)', async () => {
            // Use Manhattan coordinate for Times Square
            const searchTerm = "40.7580,-73.9855";
            const fakeResults = [{ name: "Location Event" }];
            Event.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
                address: expect.objectContaining({
                    $near: expect.any(Object)
                })
            }));
            expect(results).toEqual(fakeResults);
        });
    });

    describe('MovieSearchStrategy', () => {
        const strategy = new MovieSearchStrategy();

        test('should build query without screeningDate when search term is not a valid date and not coordinates', async () => {
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

        test('should use geospatial query when search term is coordinates (Times Square area)', async () => {
            const searchTerm = "40.7580,-73.9855";
            const fakeResults = [{ name: "Local Comedy" }];
            Movie.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Movie.find).toHaveBeenCalledWith(expect.objectContaining({
                address: expect.objectContaining({
                    $near: expect.any(Object)
                })
            }));
            expect(results).toEqual(fakeResults);
        });
    });

    describe('ConcertSearchStrategy', () => {
        const strategy = new ConcertSearchStrategy();

        test('should search in name, performers, and sponsors when search term is not coordinates', async () => {
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

        test('should use geospatial query when search term is coordinates (Times Square area)', async () => {
            const searchTerm = "40.7580,-73.9855";
            const fakeResults = [{ name: "Rock Concert" }];
            Concert.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Concert.find).toHaveBeenCalledWith(expect.objectContaining({
                address: expect.objectContaining({
                    $near: expect.any(Object)
                })
            }));
            expect(results).toEqual(fakeResults);
        });
    });

    describe('TheatreSearchStrategy', () => {
        const strategy = new TheatreSearchStrategy();

        test('should search with valid date inclusion when search term is not coordinates', async () => {
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

        test('should use geospatial query when search term is coordinates (Times Square area)', async () => {
            const searchTerm = "40.7580,-73.9855";
            const fakeResults = [{ name: "Local Theatre" }];
            Theatre.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(Theatre.find).toHaveBeenCalledWith(expect.objectContaining({
                address: expect.objectContaining({
                    $near: expect.any(Object)
                })
            }));
            expect(results).toEqual(fakeResults);
        });
    });

    describe('OtherSearchStrategy', () => {
        const strategy = new OtherSearchStrategy();

        test('should search by name, eventCategory, organizer without date when search term is not coordinates', async () => {
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

        test('should use geospatial query when search term is coordinates (Times Square area)', async () => {
            const searchTerm = "40.7580,-73.9855";
            const fakeResults = [{ name: "Expo Event" }];
            OtherEvent.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeResults) });

            const results = await strategy.search(searchTerm);

            expect(OtherEvent.find).toHaveBeenCalledWith(expect.objectContaining({
                address: expect.objectContaining({
                    $near: expect.any(Object)
                })
            }));
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

// Additional tests for the Search Controller can be added as needed.
