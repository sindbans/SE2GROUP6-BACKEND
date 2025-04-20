const Event = require('../models/EventSchema');
const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

// Helper function to standardize event details naming across different event types
const formatEventDetails = (type, details) => {
    switch (type) {
        case 'MovieSchema':
            return {
                eventId: details.movieUID,
                name: details.name,
                eventDate: details.screeningDate,
                startTime: details.startTime,
                posterImage: details.posterImage,
                // For display, you may show the cinemaAddress.
                address: details.cinemaAddress || details.address || 'Address not provided',
                genre: details.genre,
                director: details.director,
                cast: details.cast,
                runtime: details.runtime,
            };
        case 'ConcertSchema':
            return {
                eventId: details.concertUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                posterImage: details.posterImage,
                address: details.address, // Concert uses "address"
                host: details.host,
                performers: details.performers,
                sponsors: details.sponsors,
            };
        case 'TheatreSchema':
        case 'Theatre':
            return {
                eventId: details.theatreUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                posterImage: details.posterImage,
                // For display, you may show the theatreAddress.
                address: details.theatreAddress || details.address || 'Address not provided',
                genre: details.genre,
                director: details.director,
                cast: details.cast,
                runtime: details.runtime,
            };
        case 'OtherEventSchema':
            return {
                eventId: details.otherEventUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                posterImage: details.posterImage || null,
                address: details.address || 'Address not provided',
                eventCategory: details.eventCategory,
                organizer: details.organizer,
                sponsors: details.sponsors,
            };
        default:
            return details;
    }
};

// INTERNAL HELPER: Fetch raw event previews without ranking.
const fetchEventsList = async () => {
    const events = await Event.find({});
    const eventPreviews = await Promise.all(
        events.map(async (event) => {
            let posterImage = null;
            switch (event.type) {
                case 'MovieSchema': {
                    const linked = await Movie.findById(event.linkedEvent);
                    if (linked) posterImage = linked.posterImage;
                    break;
                }
                case 'ConcertSchema': {
                    const linked = await Concert.findById(event.linkedEvent);
                    if (linked) posterImage = linked.posterImage;
                    break;
                }
                case 'TheatreSchema':
                case 'Theatre': {
                    const linked = await Theatre.findById(event.linkedEvent);
                    if (linked) posterImage = linked.posterImage;
                    break;
                }
                case 'OtherEventSchema': {
                    const linked = await OtherEvent.findById(event.linkedEvent);
                    if (linked) posterImage = linked.posterImage;
                    break;
                }
                default:
                    break;
            }
            posterImage = posterImage === undefined ? null : posterImage;
            return {
                name: event.name,
                type: event.type,
                eventDate: event.eventDate,
                posterImage,
                eventId: event.eventUUID,
            };
        })
    );
    return eventPreviews;
};

// GET /api/events
exports.getEventsList = async (req, res) => {
    try {
        const eventPreviews = await fetchEventsList();
        return res.status(200).json({ events: eventPreviews });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/events/:eventId
exports.getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event.findOne({ eventUUID: eventId });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        let eventDetails;
        switch (event.type) {
            case 'MovieSchema':
                eventDetails = await Movie.findById(event.linkedEvent);
                break;
            case 'ConcertSchema':
                eventDetails = await Concert.findById(event.linkedEvent);
                break;
            case 'TheatreSchema':
            case 'Theatre':
                eventDetails = await Theatre.findById(event.linkedEvent);
                break;
            case 'OtherEventSchema':
                eventDetails = await OtherEvent.findById(event.linkedEvent);
                break;
            default:
                return res.status(400).json({ message: 'Unknown event type' });
        }
        if (!eventDetails) {
            return res.status(404).json({ message: 'Linked event details not found' });
        }
        const formattedDetails = formatEventDetails(event.type, eventDetails);
        return res.status(200).json({ eventDetails: { ...formattedDetails, type: event.type } });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// NEW ENDPOINT: GET /api/events/ranked?strategy=<strategy>&eventType=<optional>&lat=<optional>&lng=<optional>
// NEW ENDPOINT: GET /api/events/ranked?strategy=<strategy>&eventType=<optional>&lat=<optional>&lng=<optional>
// NEW ENDPOINT: GET /api/events/ranked?strategy=<strategy>&eventType=<optional>&lat=<optional>&lng=<optional>
exports.getRankedEvents = async (req, res) => {
    try {
        const { strategy, eventType, lat, lng } = req.query;
        let query = {};
        if (eventType) {
            query.type = eventType;
        }
        const events = await Event.find(query);
        const detailedEvents = await Promise.all(
            events.map(async (event) => {
                let details = null;
                switch (event.type) {
                    case 'MovieSchema':
                        details = await Movie.findById(event.linkedEvent);
                        break;
                    case 'ConcertSchema':
                        details = await Concert.findById(event.linkedEvent);
                        break;
                    case 'TheatreSchema':
                    case 'Theatre':
                        details = await Theatre.findById(event.linkedEvent);
                        break;
                    case 'OtherEventSchema':
                        details = await OtherEvent.findById(event.linkedEvent);
                        break;
                    default:
                        break;
                }
                // If no linked details found, assign default fallback values.
                if (!details) {
                    details = {
                        posterImage: null,
                        startTime: new Date(), // Use current time as a fallback
                        imdbRating: 0,
                        rating: 0,
                        genre: '',
                        // Default GeoJSON address for testing (Times Square coordinates)
                        address: { type: "Point", coordinates: [-73.9855, 40.7580] }
                    };
                }
                return {
                    name: event.name,
                    type: event.type,
                    eventDate: event.eventDate,
                    eventId: event.eventUUID,
                    posterImage: details.posterImage || null,
                    startTime: details.startTime || null,
                    rating: details.imdbRating || details.rating || 0,
                    genre: details.genre || '',
                    // Use the GeoJSON "address" field for ranking purposes.
                    address: details.address || { type: "Point", coordinates: [-73.9855, 40.7580] }
                };
            })
        );
        // Optionally filter out events with no details; with fallback, validEvents should equal detailedEvents.
        const validEvents = detailedEvents.filter(item => item !== null);

        const rankingService = require('../services/rankingService');
        const options = {};
        if (strategy === 'location') {
            if (!lat || !lng) {
                return res.status(400).json({ message: 'Location ranking requires lat and lng query parameters.' });
            }
            options.referenceCoordinates = [Number(lng), Number(lat)];
        }
        const sortedEvents = strategy
            ? rankingService.applyRanking(validEvents, strategy, options)
            : validEvents;
        return res.status(200).json({ events: sortedEvents });
    } catch (err) {
        console.error('Error in getRankedEvents:', err);
        return res.status(500).json({ message: err.message });
    }
};
