const Company = require('../models/Company');

class CompanyStrategy {
    async search(query, uid, companyId) {
        const regex = new RegExp(query, 'i');
        const results = await Company.find({ companyName: regex });
        return results || [];
    }
}

module.exports = CompanyStrategy;
