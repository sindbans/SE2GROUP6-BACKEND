const SearchContext = require('../search/SearchContext');

exports.search = async (req, res) => {
    try {
        const { type, query, userRole, companyId } = req.body;

        // Basic validation for type and query, which are always required
        if (!type || !query) {
            return res.status(400).json({ message: 'Missing search type or query' });
        }

        // For user-based searches (admin, employee, management, company)
        if (['admin', 'employee', 'management', 'company'].includes(type)) {
            // Check for userRole and companyId for user-based search types
            if (!userRole || companyId === undefined) {
                return res.status(400).json({
                    message: 'Missing userRole or companyId for user search'
                });
            }
        }

        // Set the appropriate search strategy based on type
        let strategy;
        if (['admin', 'employee', 'management', 'company'].includes(type)) {
            // For user searches, we need userRole and companyId
            strategy = SearchContext.getStrategyByType(type, userRole, companyId);
        } else {
            // For event searches (All, Movies, Concerts, etc.), we do not need userRole and companyId
            strategy = SearchContext.getStrategyByType(type);
        }

        // Perform the search using the selected strategy
        const searchContext = new SearchContext(strategy);
        const results = await searchContext.executeSearch(query);

        // Return the search results
        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
};
