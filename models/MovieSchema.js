const mongoose = require('mongoose');
const Event = require('./EventSchema');

// Helper function to generate a 7-character alphanumeric UID
function generateMovieUUID(eventDate) {
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6);
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `M-${dateFormatted}-${randomCode}`;
}

// Helper function to format a date as DD-MM-YYYY
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

const MovieSchema = new mongoose.Schema({
  movieUID: { 
    type: String, 
    default: function() { 
      return generateMovieUUID(this.screeningDate); 
    }, 
    unique: true 
  },
  screeningDate: { type: Date, required: true },
  name: { type: String, required: true },
  genre: { type: String, required: true },
  director: { type: String, required: true },
  cast: [{ type: String }],
  posterImage: { type: String },
  runtime: { type: Number, required: true },
  startTime: { type: Date, required: true },
  hallNumber: { type: Number, required: true },
  cinemaAddress: { type: String, required: true },
  seats: [{
    seatNumber: { type: String, required: true },
    isBought: { type: Boolean, default: false },
    ticketNumber: { type: String, ref: 'Ticket' }
  }],
  reviews: [{
    reviewer: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    reviewDate: { type: Date, default: Date.now }
  }],
  imdbRating: { type: Number, default: null },
  rottenTomatoesRating: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Add indexes AFTER schema definition
MovieSchema.index({ name: 1, screeningDate: 1, startTime: 1 }, { unique: true });
MovieSchema.index({ seats: 1 });

// Pre-save middleware
MovieSchema.pre('save', async function(next) {
  if (!this.eventReference) {
    try {
      const event = await Event.create({
        name: this.name,
        type: "Movie",
        eventDate: this.screeningDate,
        linkedEvent: this._id
      });
      this.eventReference = event._id;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Prevent model overwriting
module.exports = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
