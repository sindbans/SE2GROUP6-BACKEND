const mongoose = require('mongoose');
const Movie = require('./MovieSchema');
const Concert = require('./ConcertSchema');
const Theatre = require('./TheatreSchema');
const OtherEvent = require('./OtherEventSchema');

const PROCESSING_FEE_PERCENTAGE = 0.08; // 8%, changeable later

function generateTicketID(eventDate, eventName) {
  const dateFormatted = eventDate
      .toISOString()
      .slice(0, 10)
      .split('-')
      .reverse()
      .join('')
      .slice(0, 6); // DDMMYY
  const eventShortCode = eventName.substring(0, 3).toUpperCase();
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${dateFormatted}-${eventShortCode}-${randomCode}`;
}

const TicketSchema = new mongoose.Schema(
    {
      ticketId: { type: String, unique: true },
      eventName: { type: String, required: true },
      eventDate: { type: Date, required: true },
      price: { type: Number, required: true },
      processingFee: { type: Number },
      // For logged-in users or guest checkouts.
      customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
      guestName: { type: String },
      guestEmail: { type: String },

      // Dynamic Event References
      movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert' },
      theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
      otherEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'OtherEvent' },

      seatNumber: { type: String }, // Optional (for assigned seating events)
      seatTier: { type: String, default: "GA", required: true },
      isActive: { type: Boolean, default: true },
      isDeleted: { type: Boolean, default: false },
        // Inside the TicketSchema definition (after guestEmail):
      paymentToken: { type: String },

    },
    { timestamps: true }
);

// Declare indexes only once.
TicketSchema.index({ ticketId: 1 }, { unique: true });
TicketSchema.index({ customer: 1 });
TicketSchema.index({ eventDate: 1, eventName: 1 });
TicketSchema.index({ seatNumber: 1 });
TicketSchema.index({ holdExpiry: 1 }, { expireAfterSeconds: 600 });

TicketSchema.pre('save', async function (next) {
  // Generate ticketId if not present and calculate processing fee.
  if (!this.ticketId) {
    this.ticketId = generateTicketID(this.eventDate, this.eventName);
  }
  this.processingFee = this.price * PROCESSING_FEE_PERCENTAGE;

  // Basic validations for event reference and customer/guest info.
  const eventCount = [this.movie, this.concert, this.theatre, this.otherEvent].filter(e => e).length;
  if (eventCount > 1) {
    return next(new Error("A ticket can only be assigned to ONE event type."));
  }
  if (eventCount === 0) {
    return next(new Error("A ticket must be linked to an event."));
  }
  if (!this.customer && !this.guestEmail) {
    return next(new Error("A ticket must be linked to a customer or guest email."));
  }
  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
