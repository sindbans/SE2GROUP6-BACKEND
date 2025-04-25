// AllSearchStrategy.js
const Event = require('../models/EventSchema');
const ISearchStrategy = require('./ISearchStrategy');
const { parseCoordinates } = require('../utils/geoUtils');

class AllSearchStrategy extends ISearchStrategy {
    async search(searchTerm, uid, companyId) {
        const coordinates = parseCoordinates(searchTerm);
        if (coordinates) {
            // Use geospatial query if coordinates are provided
            const geoQuery = {
                address: {
                    $near: {
                        $geometry: { type: 'Point', coordinates },
                        $maxDistance: 5000 // e.g., within 5 km
                    }
                }
            };
            return await Event.find(geoQuery).sort({ createdAt: -1 });
        }
        let dateQuery = null;
        const parsedDate = new Date(searchTerm);
        if (!isNaN(parsedDate)) {
            dateQuery = parsedDate;
        }
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                ...(dateQuery ? [{ eventDate: dateQuery }] : [])
            ]
        };
        return await Event.find(query).sort({ createdAt: -1 });
    }
}

module.exports = AllSearchStrategy;
