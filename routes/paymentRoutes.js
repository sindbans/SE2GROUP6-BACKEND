const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST: Create payment session
router.post('/checkout', paymentController.createPaymentSession);

// ✅ NEW: GET session details by ID (for success page)
router.get('/session/:id', paymentController.getSessionDetails);

module.exports = router;
