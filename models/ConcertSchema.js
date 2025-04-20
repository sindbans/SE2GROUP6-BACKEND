const mongoose = require('mongoose');
const Event = require('./EventSchema');

function generateConcertUUID(eventDate) {
  if (!eventDate || isNaN(new Date(eventDate))) eventDate = new Date();
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6);
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `C-${dateFormatted}-${randomCode}`;
}

const ConcertSchema = new mongoose.Schema({
  concertUUID: {
    type: String,
    unique: true,
    default: function() { return generateConcertUUID(this.date); }
  },
  eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  address: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  posterImage: { type: String },
  startTime: { type: Date, required: true },
  host: { type: String, required: true },
  performers: { type: [String], required: true, validate: v => v.length > 0 },
  sponsors: { type: [String], default: [] },
  ticketPricing: [{
    tier: { type: String, required: true },
    amountAvailable: { type: Number, required: true },
    pricePerTicket: { type: Number, required: true }
  }],
  seats: [{
    seatNumber: { type: String, required: true },
    zone: { type: String, required: true },
    isBought: { type: Boolean, default: false },
    ticketNumber: { type: String, ref: 'Ticket' }
  }],
  soldTickets: [{
    tier: { type: String, required: true },
    ticketNumber: { type: String, required: true, ref: 'Ticket' },
    pricePaid: { type: Number, required: true }
  }],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

ConcertSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true });
ConcertSchema.index({ eventReference: 1 });
ConcertSchema.index({ isActive: 1 });
ConcertSchema.index({ isDeleted: 1 });
ConcertSchema.index({ name: 'text', performers: 'text', sponsors: 'text' });
ConcertSchema.index({ address: '2dsphere' });

ConcertSchema.pre('save', async function (next) {
  if (!this.concertUUID) {
    this.concertUUID = generateConcertUUID(this.date);
  }
  if (this.isNew && !this.eventReference) {
    try {
      const event = await Event.create({
        name: this.name,
        type: "ConcertSchema",
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
