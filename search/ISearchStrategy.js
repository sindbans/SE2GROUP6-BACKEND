class ISearchStrategy {
    async search(searchTerm, uid, companyId) {
        throw new Error('Search method not implemented');
    }
}

module.exports = ISearchStrategy;
