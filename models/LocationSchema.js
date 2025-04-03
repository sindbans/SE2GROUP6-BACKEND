const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: { type: String, required: true },          // e.g., city name or custom location name
    address: { type: String, required: true },       // full address as entered by user
    country: { type: String, required: true },
    // The following fields will be auto-populated by the geocoding service.
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Location', LocationSchema);
