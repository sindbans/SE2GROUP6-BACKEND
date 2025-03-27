const mongoose = require('mongoose');
const Movie = require('./MovieSchema');
const Concert = require('./ConcertSchema');
const Theatre = require('./TheatreSchema'); // To be created next
const OtherEvent = require('./OtherEventSchema'); // To be created after Theatre

const PROCESSING_FEE_PERCENTAGE = 0.08; // 8%, changeable later

function generateTicketID(eventDate, eventName) {
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6); // DDMMYY
  const eventShortCode = eventName.substring(0, 3).toUpperCase(); // First 3 letters of event name
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char alphanumeric

  return `${dateFormatted}-${eventShortCode}-${randomCode}`;
}




const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  price: { type: Number, required: true },
  processingFee: { type: Number },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

  // Dynamic Event References
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert' },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
  otherEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'OtherEvent' },

  seatNumber: { type: String }, // Optional (for assigned seating events)
  seatTier: { type: String, default: "GA", required: true }, // Acts as either seat number or tier name
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

TicketSchema.index({ ticketId: 1 }, { unique: true }); // Ensure ticket uniqueness
TicketSchema.index({ customer: 1 }); // Speed up ticket lookup by customer
TicketSchema.index({ eventDate: 1, eventName: 1 }); // Optimize searching for tickets by event
TicketSchema.index({ seatNumber: 1 }); // Fast seat lookup
TicketSchema.index({ holdExpiry: 1 }, { expireAfterSeconds: 600 }); // Automatically remove expired ticket holds

// **Pre-Save Hook to Handle Ticket Sales for All Event Types**
TicketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    this.ticketId = generateTicketID(this.eventDate, this.eventName);
  }
  this.processingFee = this.price * PROCESSING_FEE_PERCENTAGE;

  try {
    // 🚨 **Validation: Ensure the ticket belongs to only ONE event type**
    const eventCount = [this.movie, this.concert, this.theatre, this.otherEvent].filter(e => e).length;
    if (eventCount > 1) {
      return next(new Error("A ticket can only be assigned to ONE event type."));
    }
    if (eventCount === 0) {
      return next(new Error("A ticket must be linked to an event."));
    }

    // 🎥 **Handling Movie Tickets**
    if (this.movie) {
      const movie = await Movie.findById(this.movie);
      if (!movie) return next(new Error("Movie not found"));

      const seat = movie.seats.find(seat => seat.seatNumber === this.seatNumber);
      if (!seat) return next(new Error("Seat not found"));
      if (seat.isBought) return next(new Error("Seat is already booked"));

      // Update seat status
      seat.isBought = true;
      seat.ticketNumber = this.ticketId;
      seat.seatTier = this.seatTier;
      
      await movie.save();
    }

    // 🎵 **Handling Concert Tickets**
    if (this.concert) {
      const concert = await Concert.findById(this.concert);
      if (!concert) return next(new Error("Concert not found"));

      const tier = concert.ticketPricing.find(tp => tp.tier === this.seatTier);
      if (!tier) return next(new Error("Invalid ticket tier"));
      if (tier.amountAvailable <= 0) return next(new Error("No tickets available for this tier"));

      // Update ticket availability
      tier.amountAvailable -= 1;

      // Add sold ticket details
      concert.soldTickets.push({
        tier: this.seatTier,
        ticketNumber: this.ticketId,
        pricePaid: this.price
      });

      await concert.save();
    }

    // 🎭 **Handling Theatre Tickets**
    if (this.theatre) {
      const theatre = await Theatre.findById(this.theatre);
      if (!theatre) return next(new Error("Theatre event not found"));

      const seat = theatre.seats.find(seat => seat.seatNumber === this.seatNumber);
      if (!seat) return next(new Error("Seat not found"));
      if (seat.isBought) return next(new Error("Seat is already booked"));

      // Update seat status
      seat.isBought = true;
      seat.ticketNumber = this.ticketId;
      seat.seatTier = this.seatTier;

      await theatre.save();
    }

    // 🎟️ **Handling Other Events**
    if (this.otherEvent) {
      const otherEvent = await OtherEvent.findById(this.otherEvent);
      if (!otherEvent) return next(new Error("Event not found"));

      const tier = otherEvent.ticketPricing.find(tp => tp.tier === this.seatTier);
      if (!tier) return next(new Error("Invalid ticket tier"));
      if (tier.amountAvailable <= 0) return next(new Error("No tickets available for this tier"));

      // Update ticket availability
      tier.amountAvailable -= 1;

      // Add sold ticket details
      otherEvent.soldTickets.push({
        tier: this.seatTier,
        ticketNumber: this.ticketId,
        pricePaid: this.price
      });

      await otherEvent.save();
    }
  } catch (error) {
    return next(error);
  }

  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
