// searchStrategies/CustomerStrategy.js
class CustomerStrategy {
    async search(query) {
        const regex = new RegExp(query, 'i');
        return await Customer.find({ $or: [{ firstName: regex }, { lastName: regex }] });
    }
}

module.exports = CustomerStrategy;
