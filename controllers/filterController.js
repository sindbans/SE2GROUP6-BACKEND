// controllers/filterController.js
const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

exports.filterEvents = async (req, res) => {
  try {
    const { date, start_time, location, genre, language } = req.query;
    
    // Common criteria for start_time, location, genre, language.
    let commonCriteria = {};
    if (start_time) {
      const parsedStartTime = new Date(`1970-01-01T${start_time}:00Z`);
      if (!isNaN(parsedStartTime)) {
        commonCriteria.startTime = parsedStartTime;
      } else {
        return res.status(400).json({ error: 'Invalid start_time format. Use HH:mm (e.g., 18:00).' });
      }
    }
    if (location) commonCriteria.location = location;
    if (genre) commonCriteria.genre = genre;
    if (language) commonCriteria.language = language;

    // Create a date range for the provided date
    let movieCriteria = { ...commonCriteria };
    let otherCriteria = { ...commonCriteria };

    if (date) {
      const startOfDay = new Date(date);
      // Adjust to UTC (or your desired timezone) if needed
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      
      movieCriteria.screeningDate = { $gte: startOfDay, $lt: endOfDay };
      otherCriteria.date = { $gte: startOfDay, $lt: endOfDay };
    }

    console.log('Movies criteria:', movieCriteria);
    console.log('Other criteria:', otherCriteria);

    const movies = await Movie.find(movieCriteria);
    const concerts = await Concert.find(otherCriteria);
    const theatres = await Theatre.find(otherCriteria);
    const otherEvents = await OtherEvent.find(otherCriteria);

    console.log('Movies found:', movies.length);
    console.log('Concerts found:', concerts.length);
    console.log('Theatres found:', theatres.length);
    console.log('Other events found:', otherEvents.length);

    res.status(200).json({ movies, concerts, theatres, otherEvents });
  } catch (error) {
    console.error('Filter error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
