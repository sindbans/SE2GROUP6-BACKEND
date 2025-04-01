// algorithms/RankingByLocationStrategy.js
const RankingStrategy = require('./RankingStrategy');

class RankingByLocationStrategy extends RankingStrategy {
    /**
     * @param {Array<number>} referenceCoordinates - An array in the form [longitude, latitude]
     */
    constructor(referenceCoordinates) {
        super();
        this.referenceCoordinates = referenceCoordinates;
    }

    /**
     * Sorts events by distance from the reference coordinates.
     * Each event is expected to have an "address" field in GeoJSON format:
     * { type: "Point", coordinates: [lng, lat] }
     * @param {Array<Object>} events - Array of event objects.
     * @returns {Array<Object>} Sorted array of events.
     */
    rank(events) {
        if (!this.referenceCoordinates) {
            // If no reference is provided, return events unsorted.
            return events;
        }
        return events.sort((a, b) => {
            const dA = this._calculateDistance(a.address, this.referenceCoordinates);
            const dB = this._calculateDistance(b.address, this.referenceCoordinates);
            return dA - dB;
        });
    }

    /**
     * Calculates the Haversine distance (in kilometers) between a GeoJSON point and the reference.
     * @param {Object} geoPoint - GeoJSON point: { type: "Point", coordinates: [lng, lat] }.
     * @param {Array<number>} refCoordinates - Reference coordinates [lng, lat].
     * @returns {number} Distance in kilometers.
     */
    _calculateDistance(geoPoint, refCoordinates) {
        if (!geoPoint || !geoPoint.coordinates) return Infinity;
        const [lng1, lat1] = geoPoint.coordinates;
        const [lng2, lat2] = refCoordinates;
        const R = 6371; // Earth's radius in kilometers
        const dLat = this._deg2rad(lat2 - lat1);
        const dLng = this._deg2rad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this._deg2rad(lat1)) *
            Math.cos(this._deg2rad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    _deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}

module.exports = RankingByLocationStrategy;
