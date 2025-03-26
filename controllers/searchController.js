const SearchContext = require('../search/SearchContext');

exports.search = async (req, res) => {
    try {
        const { type, query, userRole, companyId } = req.body;
        if (!type || !query || !userRole) {
            return res.status(400).json({ message: 'Missing search type, query, or user role' });
        }

        // Retrieve the appropriate strategy based on the dropdown selection
        const strategy = SearchContext.getStrategyByType(type, userRole, companyId);
        const searchContext = new SearchContext(strategy);

        const results = await searchContext.executeSearch(query, userRole, companyId);
        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
};
