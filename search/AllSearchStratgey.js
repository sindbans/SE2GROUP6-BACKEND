const Event = require('../models/EventSchema');
const ISearchStrategy = require('./ISearchStrategy');

class AllSearchStrategy extends ISearchStrategy {
    async search(searchTerm) {
        // Attempt to parse the searchTerm as a date
        let dateQuery = null;
        const parsedDate = new Date(searchTerm);
        if (!isNaN(parsedDate)) {
            dateQuery = parsedDate;
        }

        // Build the query: search in 'name' and, if applicable, 'eventDate'
        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                ...(dateQuery ? [{ eventDate: dateQuery }] : [])
            ]
        };

        // Sort by creation date descending as a simple proxy for relevance
        return await Event.find(query).sort({ createdAt: -1 });
    }
}

module.exports = AllSearchStrategy;
