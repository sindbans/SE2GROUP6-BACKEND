// searchStrategies/CompanyStrategy.js
class CompanyStrategy {
    async search(query) {
        const regex = new RegExp(query, 'i');
        return await Company.find({ companyName: regex });
    }
}

module.exports = CompanyStrategy;
