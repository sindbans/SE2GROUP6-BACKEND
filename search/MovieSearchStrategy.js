// MovieSearchStrategy.js
const Movie = require('../models/MovieSchema');
const ISearchStrategy = require('./ISearchStrategy');
const { parseCoordinates } = require('../utils/geoUtils');

class MovieSearchStrategy extends ISearchStrategy {
    async search(searchTerm, uid, companyId) {
        const coordinates = parseCoordinates(searchTerm);
        if (coordinates) {
            // Assumes that MovieSchema now contains an "address" field with GeoJSON data.
            const geoQuery = {
                address: {
                    $near: {
                        $geometry: { type: 'Point', coordinates },
                        $maxDistance: 5000
                    }
                }
            };
            return await Movie.find(geoQuery).sort({ createdAt: -1 });
        }
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
