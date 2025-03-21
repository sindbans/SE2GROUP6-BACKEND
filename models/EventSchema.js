const mongoose = require('mongoose');

// 1. Define the schema FIRST
const EventSchema = new mongoose.Schema({
  eventUUID: { 
    type: String, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["Movie", "Concert", "Theatre", "OtherEvent"], // Use model names instead of schema filenames
    required: true 
  },
  eventDate: { 
    type: Date, 
    required: true 
  },
  linkedEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'type',  // Dynamic reference based on type
    required: false 
  }
}, { timestamps: true });

// 2. Add indexes AFTER schema definition
EventSchema.index({ name: 1, eventDate: 1, startTime: 1 }, { unique: true });
EventSchema.index({ type: 1 });
EventSchema.index({ linkedEvent: 1 });

// 3. Add UUID generation functionality
const generateEventUUID = (eventDate, type) => {
  const dateFormatted = eventDate.toISOString()
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('')
    .slice(0, 6);
    
  const typeShortcode = {
    Movie: "MOV",
    Concert: "CON",
    Theatre: "THE",
    OtherEvent: "OTH"
  }[type] || "OTH";

  const randomCode = Math.random()
    .toString(36)
    .substring(2, 9)
    .toUpperCase();

  return `${dateFormatted}-${typeShortcode}-${randomCode}`;
};

// 4. Add pre-save hook
EventSchema.pre('save', function(next) {
  if (!this.eventUUID) {
    this.eventUUID = generateEventUUID(this.eventDate, this.type);
  }
  next();
});

// 5. Prevent model overwriting
module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
