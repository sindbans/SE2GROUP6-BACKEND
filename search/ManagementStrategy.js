// searchStrategies/ManagementStrategy.js
class ManagementStrategy {
    async search(query, companyId) {
        const regex = new RegExp(query, 'i');
        return await Management.find({ companyId, $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = ManagementStrategy;
