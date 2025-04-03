const NodeGeocoder = require('node-geocoder');

// Configure node-geocoder using OpenStreetMap (or another provider as desired)
const options = {
    provider: 'openstreetmap'
    // For providers that require an API key, include: apiKey: process.env.GEOCODER_API_KEY
};

const geocoder = NodeGeocoder(options);

async function geocodeAddress(address) {
    const res = await geocoder.geocode(address);
    if (!res || res.length === 0) {
        throw new Error('Unable to geocode the provided address.');
    }
    // Return the first result.
    return { latitude: res[0].latitude, longitude: res[0].longitude };
}

module.exports = { geocodeAddress };
