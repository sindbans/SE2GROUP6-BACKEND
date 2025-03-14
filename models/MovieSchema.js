const mongoose = require('mongoose');
const Event = require('./models/EventSchema'); // Import EventSchema

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

MovieSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true }); // Ensure movie screening uniqueness
MovieSchema.index({ seats: 1 }); // Optimize seat searches


const MovieSchema = new mongoose.Schema({
 movieUID: { type: String, default: function() { return generateMovieUUID(this.screeningDate); }, unique: true },
  screeningDate: { type: Date, required: true },
  name: { type: String, required: true },             // Movie name
  genre: { type: String, required: true },              // Genre of the movie
  director: { type: String, required: true },           // Director of the movie
  cast: [{ type: String }],                             // List of cast members
  posterImage: { type: String },                        // URL of the movie poster image
  runtime: { type: Number, required: true },            // Runtime in minutes
  startTime: { type: Date, required: true },            // Start time of the screening
  hallNumber: { type: Number, required: true },         // Cinema hall number
  cinemaAddress: { type: String, required: true },      // Address of the cinema
  seats: [{
    seatNumber: { type: String, required: true },
    isBought: { type: Boolean, default: false },
    ticketNumber: { type: String, ref: 'Ticket' } // Reference to Ticket
  }],
  reviews: [{
    reviewer: { type: String, required: true },       // Name or identifier of the reviewer
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    reviewDate: { type: Date, default: Date.now }
  }],
  imdbRating: { type: Number, default: null },          // IMDB rating, can be null
  rottenTomatoesRating: { type: Number, default: null },   // Rotten Tomatoes rating, can be null
  isActive: { type: Boolean, default: true }, // Determines if the concert is active
  isDeleted: { type: Boolean, default: false }, // Determines if the concert is deleted
}, { timestamps: true });

// Pre-save middleware to create an Event entry when a Movie is added
MovieSchema.pre('save', async function (next) {
  if (!this.eventReference) {
    try {
      const event = await Event.create({
        name: this.name,
        type: "Movie",
        eventDate: this.screeningDate,
        linkedEvent: this._id
      });
      this.eventReference = event._id; // Link Movie to the newly created Event
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Movie', MovieSchema);
