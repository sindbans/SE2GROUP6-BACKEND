const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET endpoint: Accepts search parameters as query string parameters
router.get('/', (req, res) => {
    // Map query parameters from the URL to the request body so that
    // the same controller logic can be used
    req.body = {
        type: req.query.type,
        query: req.query.query,
        uid: req.query.uid || "guest",
        userRole: req.query.userRole,
        companyId: req.query.companyId
    };
    searchController.search(req, res);
});

// POST endpoint: Accepts search parameters in the request body (e.g., JSON payload)
router.post('/', searchController.search);

module.exports = router;

