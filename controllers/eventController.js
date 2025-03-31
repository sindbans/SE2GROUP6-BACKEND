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
                address: details.cinemaAddress,
                genre: details.genre,
                director: details.director,
                cast: details.cast,
                runtime: details.runtime,
                // Additional movie-specific fields can be added here.
            };
        case 'ConcertSchema':
            return {
                eventId: details.concertUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                posterImage: details.posterImage,
                address: details.address,
                host: details.host,
                performers: details.performers,
                sponsors: details.sponsors,
                // Additional concert-specific fields.
            };
        case 'TheatreSchema':
        case 'Theatre':
            return {
                eventId: details.theatreUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                posterImage: details.posterImage,
                address: details.theatreAddress,
                genre: details.genre,
                director: details.director,
                cast: details.cast,
                runtime: details.runtime,
                // Additional theatre-specific fields.
            };
        case 'OtherEventSchema':
            return {
                eventId: details.otherEventUUID,
                name: details.name,
                eventDate: details.date,
                startTime: details.startTime,
                // Ensure posterImage is set to null if not provided.
                posterImage: details.posterImage || null,
                address: details.address,
                eventCategory: details.eventCategory,
                organizer: details.organizer,
                sponsors: details.sponsors,
                // Additional other event fields.
            };
        default:
            return details;
    }
};

// GET /api/events
exports.getEventsList = async (req, res) => {
    try {
        // Fetch all Event documents without automatic population
        const events = await Event.find({});
        // For each event, perform a manual lookup for the linked event to retrieve posterImage
        const eventPreviews = await Promise.all(events.map(async (event) => {
            let posterImage = null;
            switch (event.type) {
                case 'MovieSchema': {
                    const linked = await Movie.findById(event.linkedEvent);
                    if (linked) {
                        posterImage = linked.posterImage;
                    }
                    break;
                }
                case 'ConcertSchema': {
                    const linked = await Concert.findById(event.linkedEvent);
                    if (linked) {
                        posterImage = linked.posterImage;
                    }
                    break;
                }
                case 'TheatreSchema':
                case 'Theatre': {
                    const linked = await Theatre.findById(event.linkedEvent);
                    if (linked) {
                        posterImage = linked.posterImage;
                    }
                    break;
                }
                case 'OtherEventSchema': {
                    const linked = await OtherEvent.findById(event.linkedEvent);
                    if (linked) {
                        posterImage = linked.posterImage;
                    }
                    break;
                }
                default:
                    break;
            }
            // Ensure the posterImage key exists even if undefined.
            posterImage = posterImage === undefined ? null : posterImage;
            return {
                name: event.name,
                type: event.type,
                eventDate: event.eventDate,
                posterImage, // This key will now always be present
                eventId: event.eventUUID,
            };
        }));
        return res.status(200).json({ events: eventPreviews });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/events/:eventId
exports.getEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;
        // Look up the Event document by its unique eventUUID.
        const event = await Event.findOne({ eventUUID: eventId });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        let eventDetails;
        // Manually fetch details from the correct model based on event.type
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
        // Standardize the details using our mapping function.
        const formattedDetails = formatEventDetails(event.type, eventDetails);
        return res.status(200).json({ eventDetails: formattedDetails });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
