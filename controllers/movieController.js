const Movie = require('../models/MovieSchema');

exports.createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const savedMovie = await movie.save();
    res.status(201).json({ success: true, data: savedMovie });
  } catch (err) {
    console.error("Error saving movie:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
