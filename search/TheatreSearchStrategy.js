const Theatre = require('../models/TheatreSchema');
const ISearchStrategy = require('./ISearchStrategy');

class TheatreSearchStrategy extends ISearchStrategy {
    async search(searchTerm) {
        let dateQuery = null;
        const parsedDate = new Date(searchTerm);
        if (!isNaN(parsedDate)) {
            dateQuery = parsedDate;
        }

        const query = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { genre: { $regex: searchTerm, $options: 'i' } },
                { director: { $regex: searchTerm, $options: 'i' } },
                { cast: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
                ...(dateQuery ? [{ date: dateQuery }] : [])
            ]
        };

        return await Theatre.find(query).sort({ createdAt: -1 });
    }
}

module.exports = TheatreSearchStrategy;
