const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

exports.filterEvents = async (req, res) => {
  try {
    const { date, start_time, location, genre, language } = req.query;

    let filterCriteria = {};

    // Handle date filter
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        filterCriteria.date = parsedDate;
      } else {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
    }

    // Handle start_time filter
    if (start_time) {
      const parsedStartTime = new Date(`1970-01-01T${start_time}:00Z`); // Parse as ISO time
      if (!isNaN(parsedStartTime)) {
        filterCriteria.startTime = parsedStartTime;
      } else {
        return res.status(400).json({ error: 'Invalid start_time format. Use HH:mm (e.g., 18:00).' });
      }
    }

    // Handle other filters
    if (location) filterCriteria.location = location;
    if (genre) filterCriteria.genre = genre;
    if (language) filterCriteria.language = language;

    // Debugging logs
    console.log('Received query parameters:', req.query); // Log raw query parameters
    console.log('Constructed filter criteria:', filterCriteria); // Log constructed criteria

    // Query database
    const movies = await Movie.find(filterCriteria);
    const concerts = await Concert.find(filterCriteria);
    const theatres = await Theatre.find(filterCriteria);
    const otherEvents = await OtherEvent.find(filterCriteria);

    // Debugging logs for results
    console.log('Movies found:', movies.length);
    console.log('Concerts found:', concerts.length);
    console.log('Theatres found:', theatres.length);
    console.log('Other events found:', otherEvents.length);

    res.status(200).json({ movies, concerts, theatres, otherEvents });
  } catch (error) {
    console.error('Filter error:', error.message); // Log errors
    res.status(500).json({ error: error.message });
  }
};
