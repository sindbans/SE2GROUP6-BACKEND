const Concert = require('../models/ConcertSchema');
const ISearchStrategy = require('./ISearchStrategy');

class ConcertSearchStrategy extends ISearchStrategy {
    async search(searchTerm) {
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
