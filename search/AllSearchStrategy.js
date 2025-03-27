const Event = require('../models/EventSchema');
const ISearchStrategy = require('./ISearchStrategy');

class AllSearchStrategy extends ISearchStrategy {
    async search(searchTerm, uid, companyId) {
        // uid and companyId are ignored for event search
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
