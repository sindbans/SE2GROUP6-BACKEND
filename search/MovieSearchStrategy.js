const Movie = require('../models/MovieSchema');
const ISearchStrategy = require('./ISearchStrategy');

class MovieSearchStrategy extends ISearchStrategy {
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
                ...(dateQuery ? [{ screeningDate: dateQuery }] : [])
            ]
        };

        return await Movie.find(query).sort({ createdAt: -1 });
    }
}

module.exports = MovieSearchStrategy;
