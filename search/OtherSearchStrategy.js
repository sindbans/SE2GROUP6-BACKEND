const OtherEvent = require('../models/OtherEventSchema');
const ISearchStrategy = require('./ISearchStrategy');

class OtherSearchStrategy extends ISearchStrategy {
    async search(searchTerm) {
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
