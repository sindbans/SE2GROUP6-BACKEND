// ConcertSearchStrategy.js
const Concert = require('../models/ConcertSchema');
const ISearchStrategy = require('./ISearchStrategy');
const { parseCoordinates } = require('../utils/geoUtils');

class ConcertSearchStrategy extends ISearchStrategy {
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
            return await Concert.find(geoQuery).sort({ createdAt: -1 });
        }
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { performers: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                { sponsors: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
            ]
        };
        return await Concert.find(query).sort({ createdAt: -1 });
    }
}

module.exports = ConcertSearchStrategy;
