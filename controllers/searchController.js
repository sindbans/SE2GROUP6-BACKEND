const SearchContext = require('../search/SearchContext');

exports.search = async (req, res) => {
    try {
        const { type, query } = req.body;
        if (!type || !query) {
            return res.status(400).json({ message: 'Missing search type or query' });
        }

        // Retrieve the appropriate strategy based on the dropdown selection
        const strategy = SearchContext.getStrategyByType(type);
        const searchContext = new SearchContext(strategy);

        const results = await searchContext.executeSearch(query);
        res.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
};
