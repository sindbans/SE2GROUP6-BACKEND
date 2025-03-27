const Customer = require('../models/Customer');

class CustomerStrategy {
    async search(query, uid, companyId) {
        const regex = new RegExp(query, 'i');
        return await Customer.find({ $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = CustomerStrategy;
