const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const Other = require('../models/OtherEventSchema');

exports.getSeatMapByEventId = async (req, res) => {
  const { eventId } = req.params;

  try {
    const movie = await Movie.findById(eventId);
    if (movie) return res.json({ type: 'movie', seats: movie.seats });

    const concert = await Concert.findById(eventId);
    if (concert) return res.json({ type: 'concert', seats: concert.seats });

    const theatre = await Theatre.findById(eventId);
    if (theatre) return res.json({ type: 'theatre', seats: theatre.seats });

    const other = await Other.findById(eventId);
    if (other) return res.json({ type: 'other', seats: other.ticketPricing });

    return res.status(404).json({ message: 'Event not found.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
