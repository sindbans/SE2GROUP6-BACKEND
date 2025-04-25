const request = require('supertest');
const app = require('../app'); // Your Express app
const mongoose = require('mongoose');
const Movie = require('../models/MovieSchema'); // adjust if needed

describe('POST /api/movies/add', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up duplicate test data if present
    await Movie.deleteMany({ name: "Interstellar" });
  });

  it('should create a new movie', async () => {
    const res = await request(app)
      .post('/api/movies/add')
      .send({
        name: "Interstellar",
        screeningDate: "2025-05-10",
        genre: "Adventure",
        director: "Christopher Nolan",
        runtime: 169,
        startTime: "2025-05-10T18:00:00.000Z",
        hallNumber: 1,
        address: {
          type: "Point",
          coordinates: [77.5946, 12.9716]
        }
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Interstellar");
  });
});
