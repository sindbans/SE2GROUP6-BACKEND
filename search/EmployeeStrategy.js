const Employee = require('../models/Employee');

class EmployeeStrategy {
    async search(query, uid, companyId) {
        const regex = new RegExp(query, 'i');
        return await Employee.find({ companyId, $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = EmployeeStrategy;
