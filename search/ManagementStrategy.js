const Management = require('../models/Management');

class ManagementStrategy {
    async search(query, uid, companyId) {
        const regex = new RegExp(query, 'i');
        let results;
        if (companyId === null) {
            // If companyId is null, search across all companies
            results = await Management.find({ $or: [{ firstName: regex }, { lastName: regex }] });
        } else {
            results = await Management.find({ companyId, $or: [{ firstName: regex }, { lastName: regex }] });
        }
        return results || [];
    }
}

module.exports = ManagementStrategy;
