const mongoose = require('mongoose');

const EVENT_TYPES = {
  MOVIES: "MovieSchema",
  CONCERT: "ConcertSchema",
  THEATRE: "TheatreSchema",
  OTHER: "OtherEventSchema"
};

// Function to generate the event UUID
function generateEventUUID(eventDate, type) {
  const dateFormatted = eventDate.toISOString().slice(0, 10).split('-').reverse().join('').slice(0, 6); // DDMMYY
  const typeShortcode = {
    [EVENT_TYPES.MOVIES]: "MOV",
    [EVENT_TYPES.CONCERT]: "CON",
    [EVENT_TYPES.THEATRE]: "THE",
    [EVENT_TYPES.OTHER]: "OTH"
  }[type] || "OTH"; // Default to "OTH" if type is invalid
  
  const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase(); // 7-character UID

  return `${dateFormatted}-${typeShortcode}-${randomCode}`;
}

EventSchema.index({ name: 1, eventDate: 1, startTime: 1 }, { unique: true }); // Ensure uniqueness of an event
EventSchema.index({ type: 1 }); // Speed up queries filtering events by type
EventSchema.index({ linkedEvent: 1 }); // Quick reference to related event schema (Movie, Concert, etc.)


const EventSchema = new mongoose.Schema({
  eventUUID: { type: String, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(EVENT_TYPES), required: true },
  eventDate: { type: Date, required: true },
  linkedEvent: { type: mongoose.Schema.Types.ObjectId, refPath: 'type', required: false } // Dynamic reference
}, { timestamps: true });

// Pre-save hook to generate eventUUID before saving
EventSchema.pre('save', function (next) {
  if (!this.eventUUID) {
    this.eventUUID = generateEventUUID(this.eventDate, this.type);
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
