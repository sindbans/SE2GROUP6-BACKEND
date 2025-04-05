const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/checkout', paymentController.createPaymentSession);

module.exports = router;