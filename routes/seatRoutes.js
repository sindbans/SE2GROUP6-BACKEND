const express = require('express');
const router = express.Router();
const { getSeatMapByEventId } = require('../controllers/seatController');

router.get('/:eventId/seats', getSeatMapByEventId);

module.exports = router;