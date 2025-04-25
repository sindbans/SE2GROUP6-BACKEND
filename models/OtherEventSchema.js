const mongoose = require('mongoose');
const Event = require('./EventSchema'); // Connect to EventSchema

function generateOtherEventUUID(eventDate) {
  // Check eventDate validity; default to now if invalid.
  if (!eventDate || isNaN(new Date(eventDate))) {
    eventDate = new Date();
  }
  const dateFormatted = eventDate.toISOString().slice(0, 10)
      .split('-').reverse().join('').slice(0, 6);
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `O-${dateFormatted}-${randomCode}`;
}

const OtherEventSchema = new mongoose.Schema({
  otherEventUUID: {
    type: String,
    unique: true,
    default: function() { return generateOtherEventUUID(this.date); } // << CHANGE >>
  },
  eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  posterImage: { type: String },
  address: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Format: [longitude, latitude]
      required: true,
    }
  },
  eventCategory: { type: String, required: true },
  organizer: { type: String, required: true },
  sponsors: { type: [String], default: [] },
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
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

OtherEventSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true });
OtherEventSchema.index({ 'ticketPricing.tier': 1 });
OtherEventSchema.index({ address: '2dsphere' });


OtherEventSchema.pre('save', async function (next) {
  if (!this.otherEventUUID) {
    this.otherEventUUID = generateOtherEventUUID(this.date);
  }
  // Only create and link an Event for new OtherEvent documents
  if (this.isNew && !this.eventReference) {
    try {
      const existingEvent = await Event.findOne({
        name: this.name,
        type: "OtherEventSchema",
        eventDate: this.date,
        startTime: this.startTime
      });
      if (existingEvent) {
        this.eventReference = existingEvent._id;
      } else {
        const event = await Event.create({
          name: this.name,
          type: "OtherEventSchema",
          eventDate: this.date,
          startTime: this.startTime,
          linkedEvent: this._id
        });
        this.eventReference = event._id;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});


module.exports = mongoose.model('OtherEvent', OtherEventSchema);
