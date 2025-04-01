// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings - Create a new booking/ticket
router.post('/', bookingController.createBooking);

module.exports = router;
