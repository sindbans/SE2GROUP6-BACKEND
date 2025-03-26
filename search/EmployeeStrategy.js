// searchStrategies/EmployeeStrategy.js
class EmployeeStrategy {
    async search(query, companyId) {
        const regex = new RegExp(query, 'i');
        return await Employee.find({ companyId, $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = EmployeeStrategy;
