class ISearchStrategy {
    async search(searchTerm) {
        throw new Error('Search method not implemented');
    }
}

module.exports = ISearchStrategy;
