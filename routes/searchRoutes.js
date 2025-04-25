const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Remove or comment out the GET endpoint if not required.
// router.get('/', (req, res) => {
//     req.body = {
//         type: req.query.type,
//         query: req.query.query,
//         uid: req.query.uid || "guest",
//         userRole: req.query.userRole,
//         companyId: req.query.companyId
//     };
//     searchController.search(req, res);
// });

// POST endpoint: Accepts search parameters in the request body (JSON payload)
router.post('/', searchController.search);

module.exports = router;
