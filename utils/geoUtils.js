// utils/geoUtils.js
function parseCoordinates(searchTerm) {
    // Expecting a comma-separated pair: "latitude,longitude"
    const parts = searchTerm.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            // GeoJSON expects [longitude, latitude]
            return [lng, lat];
        }
    }
    return null;
}

module.exports = { parseCoordinates };
