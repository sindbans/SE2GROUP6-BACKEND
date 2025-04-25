// OtherSearchStrategy.js
const OtherEvent = require('../models/OtherEventSchema');
const ISearchStrategy = require('./ISearchStrategy');
const { parseCoordinates } = require('../utils/geoUtils');

class OtherSearchStrategy extends ISearchStrategy {
    async search(searchTerm, uid, companyId) {
        const coordinates = parseCoordinates(searchTerm);
        if (coordinates) {
            const geoQuery = {
                address: {
                    $near: {
                        $geometry: { type: 'Point', coordinates },
                        $maxDistance: 5000
                    }
                }
            };
            return await OtherEvent.find(geoQuery).sort({ createdAt: -1 });
        }
        let dateQuery = null;
        const parsedDate = new Date(searchTerm);
        if (!isNaN(parsedDate)) {
            dateQuery = parsedDate;
        }
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { eventCategory: { $regex: searchTerm, $options: 'i' } },
                { organizer: { $regex: searchTerm, $options: 'i' } },
                ...(dateQuery ? [{ date: dateQuery }] : [])
            ]
        };
        return await OtherEvent.find(query).sort({ createdAt: -1 });
    }
}

module.exports = OtherSearchStrategy;
