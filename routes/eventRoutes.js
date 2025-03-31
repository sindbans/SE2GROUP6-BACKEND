const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Raw events list (no ranking)
router.get('/', eventController.getEventsList);

// Ranked events endpoint; supports query parameters ?strategy=rating (or startTime, genre, location) & eventType=...
router.get('/ranked', eventController.getRankedEvents);

// Event details
router.get('/:eventId', eventController.getEventDetails);

module.exports = router;
