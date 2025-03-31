const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Route to get list of all events (basic info like name, type, date)
router.get('/', eventController.getEventsList);

// Route to get details of a specific event based on eventId (more detailed data)
router.get('/:eventId', eventController.getEventDetails);

module.exports = router;
