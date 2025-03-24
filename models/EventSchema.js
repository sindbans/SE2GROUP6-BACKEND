const mongoose = require('mongoose');

const EVENT_TYPES = {
  MOVIES: "MovieSchema",
  CONCERT: "ConcertSchema",
  THEATRE: "TheatreSchema",
  OTHER: "OtherEventSchema"
};

function generateEventUUID(eventDate, type) {
  // Validate eventDate; fallback to now if missing or invalid.
  if (!eventDate || isNaN(new Date(eventDate))) {
    eventDate = new Date();
  }
  const dateFormatted = eventDate.toISOString().slice(0, 10)
      .split('-').reverse().join('').slice(0, 6); // DDMMYY
  const typeShortcode = {
    "MovieSchema": "MOV",
    "ConcertSchema": "CON",
    "TheatreSchema": "THE",
    "OtherEventSchema": "OTH"
  }[type] || "OTH";
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${dateFormatted}-${typeShortcode}-${randomCode}`;
}

const EventSchema = new mongoose.Schema({
  eventUUID: {
    type: String,
    unique: true,
    default: function() { return generateEventUUID(this.eventDate, this.type); } // << CHANGE >>
  },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(EVENT_TYPES), required: true },
  eventDate: { type: Date, required: true },
  linkedEvent: { type: mongoose.Schema.Types.ObjectId, refPath: 'type', required: false }
}, { timestamps: true });

EventSchema.index({ name: 1, eventDate: 1, startTime: 1 }, { unique: true });
EventSchema.index({ type: 1 });
EventSchema.index({ linkedEvent: 1 });

EventSchema.pre('save', function (next) {
  if (!this.eventUUID) {
    this.eventUUID = generateEventUUID(this.eventDate, this.type);
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
