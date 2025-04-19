const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/checkout', paymentController.createPaymentSession);
router.get('/session/:id', paymentController.getSessionDetails);

module.exports = router;
