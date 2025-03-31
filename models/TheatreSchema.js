const mongoose = require('mongoose');
const Event = require('./EventSchema'); // Connect to EventSchema

function generateTheatreUUID(eventDate) {
  // Validate eventDate and fallback to current date if needed.
  if (!eventDate || isNaN(new Date(eventDate))) {
    eventDate = new Date();
  }
  const dateFormatted = eventDate.toISOString().slice(0, 10)
      .split('-').reverse().join('').slice(0, 6);
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `T-${dateFormatted}-${randomCode}`;
}

const TheatreSchema = new mongoose.Schema({
  theatreUUID: {
    type: String,
    unique: true,
    default: function () {
      return generateTheatreUUID(this.date);
    }
  },
  eventReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: Date, required: true },
  genre: { type: String, required: true },
  director: { type: String, required: true },
  cast: [{ type: String, required: true }],
  posterImage: { type: String },
  runtime: { type: Number, required: true },
  theatreAddress: {
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

  seats: [{
    seatNumber: { type: String, required: true },
    isBought: { type: Boolean, default: false },
    ticketNumber: { type: String, ref: 'Ticket' }
  }],

  reviews: [{
    reviewer: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
    reviewDate: { type: Date, default: Date.now }
  }],

  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

TheatreSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true });
TheatreSchema.index({ 'seats.seatNumber': 1 });
TheatreSchema.index({ theatreAddress: '2dsphere' });


// Pre-save hook to link with an Event document
TheatreSchema.pre('save', async function (next) {
  if (!this.eventReference) {
    try {
      // Use "TheatreSchema" consistently for querying and creating the Event.
      const existingEvent = await Event.findOne({
        name: this.name,
        type: "TheatreSchema",
        eventDate: this.date,
        startTime: this.startTime
      });
      if (existingEvent) {
        this.eventReference = existingEvent._id;
      } else {
        const event = await Event.create({
          name: this.name,
          type: "TheatreSchema",
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

module.exports = mongoose.model('Theatre', TheatreSchema);
