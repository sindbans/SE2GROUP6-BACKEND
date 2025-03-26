// searchStrategies/AdminStrategy.js
class AdminStrategy {
    async search(query) {
        const regex = new RegExp(query, 'i'); // Case-insensitive search
        return await Admin.find({ $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = AdminStrategy;
