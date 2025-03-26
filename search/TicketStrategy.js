// searchStrategies/TicketStrategy.js
class TicketStrategy {
    async search(query, userId, userRole) {
        const regex = new RegExp(query, 'i');
        let filter = {};

        if (userRole === 'admin') {
            filter = { ticketId: regex }; // Admin can search all tickets
        } else if (userRole === 'management' || userRole === 'employee') {
            const tickets = await Ticket.find({ customer: userId });
            filter = { ticketId: { $in: tickets.map(ticket => ticket.ticketId) }, eventName: regex };
        }

        return await Ticket.find(filter);
    }
}

module.exports = TicketStrategy;
