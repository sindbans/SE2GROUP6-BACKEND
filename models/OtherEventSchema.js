const mongoose = require('mongoose');
const Event = require('./EventSchema'); // Connect to EventSchema

function generateOtherEventUUID(eventDate) {
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6); // DDMMYY
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase(); // 7-character UID
  return `O-${dateFormatted}-${randomCode}`;
}




const OtherEventSchema = new mongoose.Schema({
  otherEventUUID: { type: String, unique: true },
  eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Connect to EventSchema
  name: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true }, // Added startTime to ensure uniqueness
  address: { type: String, required: true },
  eventCategory: { type: String, required: true }, // E.g., Expo, Fair, Workshop, Sports
  organizer: { type: String, required: true }, // Who's organizing the event
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
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

OtherEventSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true }); // Prevent duplicate events
OtherEventSchema.index({ ticketPricing.tier: 1 }); // Optimize ticket pricing lookups

// **Pre-Save Hook to Ensure Unique Event Entries**
OtherEventSchema.pre('save', async function (next) {
  if (!this.otherEventUUID) {
    this.otherEventUUID = generateOtherEventUUID(this.date);
  }

  if (!this.eventReference) {
    try {
      const existingEvent = await Event.findOne({
        name: this.name,
        type: "Other",
        eventDate: this.date,
        startTime: this.startTime
      });

      if (existingEvent) {
        this.eventReference = existingEvent._id;
      } else {
        const event = await Event.create({
          name: this.name,
          type: "Other",
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
