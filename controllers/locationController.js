const Location = require('../models/LocationSchema');
const { geocodeAddress } = require('../services/locationService');

/**
 * GET /api/locations
 * Returns all stored locations.
 */
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find({});
        res.status(200).json({ locations });
    } catch (error) {
        console.error('Error in getLocations:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * POST /api/locations
 * Adds a new location.
 * Expected JSON body: { "name": "New York", "address": "New York, NY, USA", "country": "USA" }
 */
exports.createLocation = async (req, res) => {
    try {
        const { name, address, country } = req.body;
        if (!name || !address || !country) {
            return res.status(400).json({ message: 'Missing required fields: name, address, country.' });
        }
        // Automatically geocode the address.
        const { latitude, longitude } = await geocodeAddress(address);
        const location = new Location({ name, address, country, latitude, longitude });
        const savedLocation = await location.save();
        res.status(201).json({ location: savedLocation });
    } catch (error) {
        console.error('Error in createLocation:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * PUT /api/locations/:id
 * Updates an existing location.
 * Accepts the same fields as createLocation. If address is updated, re-geocode.
 */
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, country } = req.body;
        if (!name && !address && !country) {
            return res.status(400).json({ message: 'At least one field must be provided for update.' });
        }
        const updateData = {};
        if (name) updateData.name = name;
        if (country) updateData.country = country;
        if (address) {
            updateData.address = address;
            const { latitude, longitude } = await geocodeAddress(address);
            updateData.latitude = latitude;
            updateData.longitude = longitude;
        }
        const updatedLocation = await Location.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedLocation) {
            return res.status(404).json({ message: 'Location not found.' });
        }
        res.status(200).json({ location: updatedLocation });
    } catch (error) {
        console.error('Error in updateLocation:', error);
        res.status(400).json({ message: error.message });
    }
};

/**
 * DELETE /api/locations/:id
 * Deletes a location by its id.
 */
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLocation = await Location.findByIdAndDelete(id);
        if (!deletedLocation) {
            return res.status(404).json({ message: 'Location not found.' });
        }
        res.status(200).json({ message: 'Location deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteLocation:', error);
        res.status(400).json({ message: error.message });
    }
};
