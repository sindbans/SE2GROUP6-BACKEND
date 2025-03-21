const mongoose = require('mongoose');
const Event = require('./EventSchema');

function generateConcertUUID(eventDate) {
  const dateFormatted = eventDate.toISOString()
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('')
    .slice(0, 6);
  const randomCode = Math.random()
    .toString(36)
    .substring(2, 9)
    .toUpperCase();
  return `C-${dateFormatted}-${randomCode}`;
}

const ConcertSchema = new mongoose.Schema({
  concertUUID: { 
    type: String, 
    unique: true,
    default: function() { return generateConcertUUID(this.date); }
  },
  eventReference: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  },
  name: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  posterImage: { 
    type: String 
  },
  startTime: { 
    type: Date, 
    required: true 
  },
  host: { 
    type: String, 
    required: true 
  },
  performers: { 
    type: [String], 
    required: true,
    validate: v => v.length > 0 
  },
  sponsors: { 
    type: [String], 
    default: [] 
  },
  ticketPricing: [{
    tier: { type: String, required: true },
    amountAvailable: { type: Number, required: true },
    pricePerTicket: { type: Number, required: true }
  }],
  soldTickets: [{
    tier: { type: String, required: true },
    ticketNumber: { 
      type: String, 
      required: true, 
      ref: 'Ticket' 
    },
    pricePaid: { type: Number, required: true }
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Add indexes AFTER schema definition
ConcertSchema.index({ name: 1, date: 1 }, { unique: true });

// Pre-save hook
ConcertSchema.pre('save', async function(next) {
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

module.exports = mongoose.models.Concert || mongoose.model('Concert', ConcertSchema);
