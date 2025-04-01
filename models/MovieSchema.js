const mongoose = require('mongoose');
const Event = require('./EventSchema'); // Import EventSchema

function generateMovieUUID(eventDate) {
    // Validate eventDate; use current date if necessary.
    if (!eventDate || isNaN(new Date(eventDate))) {
        eventDate = new Date();
    }
    const dateFormatted = eventDate.toISOString().slice(0, 10)
        .split('-').reverse().join('').slice(0, 6);
    const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `M-${dateFormatted}-${randomCode}`;
}

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
        unique: true,
        default: function() { return generateMovieUUID(this.screeningDate); } // << CHANGE >>
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

MovieSchema.index({ name: 1, date: 1, startTime: 1 }, { unique: true });
MovieSchema.index({ seats: 1 });
MovieSchema.index({ cinemaAddress: '2dsphere' });


MovieSchema.pre('save', async function (next) {
    if (!this.eventReference) {
        try {
            const event = await Event.create({
                name: this.name,
                type: "MovieSchema",
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

module.exports = mongoose.model('Movie', MovieSchema);
