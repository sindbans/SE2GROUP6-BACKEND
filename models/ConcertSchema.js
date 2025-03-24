const mongoose = require('mongoose');
const Event = require('./EventSchema'); // Connect to EventSchema

function generateConcertUUID(eventDate) {
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6); // DDMMYY
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase(); // 7-character UID
  return `C-${dateFormatted}-${randomCode}`;
}

CustomerSchema.index({ email: 1 }, { unique: true }); // Ensure email uniqueness
CustomerSchema.index({ uid: 1 }, { unique: true }); // Ensure each customer has a unique UID
CustomerSchema.index({ tickets: 1 }); // Optimize ticket lookups for a customer


const ConcertSchema = new mongoose.Schema({
  concertUUID: { type: String, unique: true },
  eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Connect to EventSchema
  name: { type: String, required: true },
  date: { type: Date, required: true },
  address: { type: String, required: true },
  posterImage: { type: String },  
  startTime: { type: Date, required: true },
  host: { type: String, required: true }, // Hosting company
  performers: { type: [String], required: true, validate: v => v.length > 0 }, // Performers (cannot be empty)
  sponsors: { type: [String], default: [] }, // Sponsors (can be empty)

  ticketPricing: [{
    tier: { type: String, required: true },
    amountAvailable: { type: Number, required: true },
    pricePerTicket: { type: Number, required: true }
  }],

  soldTickets: [{
    tier: { type: String, required: true },
    ticketNumber: { type: String, required: true, ref: 'Ticket' },
    pricePaid: { type: Number, required: true }
  }],

  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// **Pre-Save Hook to Generate UUID & Link to EventSchema**
ConcertSchema.pre('save', async function (next) {
  if (!this.concertUUID) {
    this.concertUUID = generateConcertUUID(this.date);
  }

  if (!this.eventReference) {
    try {
      const event = await Event.create({
        name: this.name,
        type: "Concert",
        eventDate: this.date,
        linkedEvent: this._id
      });
      this.eventReference = event._id;
    } catch (error) {
      return next(error);
    }
  }

  next();
});

module.exports = mongoose.model('Concert', ConcertSchema);
