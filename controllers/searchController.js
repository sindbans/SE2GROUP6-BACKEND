const SearchContext = require('../search/SearchContext');
const Management = require('../models/Management');
const Employee = require('../models/Employee');

exports.search = async (req, res) => {
    try {
        let { type, query, userRole, companyId, uid } = req.body;

        // Default uid to "guest" if not provided
        if (!uid) {
            uid = "guest";
        }

        // Basic validation for type and query
        if (!type || !query) {
            return res.status(400).json({ message: 'Missing search type or query' });
        }

        // For user-specific searches (only 'employee' and 'management' require non-guest uid)
        if (['employee', 'management'].includes(type)) {
            if (uid === "guest") {
                return res.status(403).json({ message: 'Access denied: guest users cannot perform this search.' });
            }
            if (!userRole || companyId === undefined) {
                return res.status(400).json({ message: 'Missing userRole or companyId for user search' });
            }
        }

        let strategy;
        if (['employee', 'management'].includes(type)) {
            // Look up the management record for the requesting user by uid
            const managementUser = await Management.findOne({ uid: uid });
            if (!managementUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (managementUser.isAdmin) {
                // If the management user is an admin, ignore companyId
                strategy = SearchContext.getStrategyByType(type, uid, null);
            } else {
                strategy = SearchContext.getStrategyByType(type, uid, companyId);
            }
        } else {
            // For consumer searches (e.g., events, companies), allow guest access.
            strategy = SearchContext.getStrategyByType(type);
        }

        const searchContext = new SearchContext(strategy);

        let results;
        // For user-specific searches, pass additional parameters.
        if (['employee', 'management'].includes(type)) {
            results = await searchContext.executeSearch(query, uid, companyId);
        } else {
            results = await searchContext.executeSearch(query);
        }

        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
};
