// seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import your models (adjust the paths if necessary)
const Movie = require('./models/MovieSchema');
const Theatre = require('./models/TheatreSchema');
const Concert = require('./models/ConcertSchema');
const OtherEvent = require('./models/OtherEventSchema');
const Event = require('./models/EventSchema'); // For checking the total count

// Connect to MongoDB (update connection string as needed)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

// Main seeding function
async function seedData() {
    try {
        // Clean up previous data
        await Movie.deleteMany({});
        await Theatre.deleteMany({});
        await Concert.deleteMany({});
        await OtherEvent.deleteMany({});
        await Event.deleteMany({});

        const now = new Date();

        // 1. Seed Movies (10 entries)
        const movies = [];
        for (let i = 1; i <= 10; i++) {
            // Offset screening date by i days
            const screeningDate = new Date(now);
            screeningDate.setDate(now.getDate() + i);

            // Set start time at 6:30 PM on screening day
            const startTime = new Date(screeningDate);
            startTime.setHours(18, 30, 0, 0);

            movies.push({
                screeningDate,
                name: `Movie ${i}`,
                genre: 'Action',
                director: `Director ${i}`,
                cast: [`Actor ${i}A`, `Actor ${i}B`],
                runtime: 120 + i, // Runtime in minutes
                startTime,
                hallNumber: i,
                cinemaAddress: `Cinema Address ${i}`,
                seats: Array.from({ length: 20 }, (_, index) => ({
                    seatNumber: `M${i}-S${index + 1}`,
                    isBought: false,
                })),
                imdbRating: 7.5,
                rottenTomatoesRating: 80,
            });
        }
        // << CHANGE >>: Instead of insertMany, we loop and save each document to trigger pre-save hooks.
        const movieDocs = [];
        for (const data of movies) {
            const movie = new Movie(data);
            const saved = await movie.save();
            movieDocs.push(saved);
        }
        console.log(`Inserted ${movieDocs.length} movies`);

        // 2. Seed Theatre Shows (10 entries)
        const theatres = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);

            // Theatre shows start at 7:00 PM
            const startTime = new Date(eventDate);
            startTime.setHours(19, 0, 0, 0);

            theatres.push({
                date: eventDate,
                name: `Theatre Show ${i}`,
                startTime,
                genre: 'Drama',
                director: `Theatre Director ${i}`,
                cast: [`Performer ${i}A`, `Performer ${i}B`, `Performer ${i}C`],
                runtime: 90 + i,
                theatreAddress: `Theatre Address ${i}`,
                seats: Array.from({ length: 30 }, (_, index) => ({
                    seatNumber: `T${i}-S${index + 1}`,
                    isBought: false,
                })),
                reviews: [],
            });
        }
        const theatreDocs = [];
        for (const data of theatres) {
            const theatre = new Theatre(data);
            const saved = await theatre.save();
            theatreDocs.push(saved);
        }
        console.log(`Inserted ${theatreDocs.length} theatre shows`);

        // 3. Seed Concerts (10 entries)
        const concerts = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);

            // Concert start time at 8:00 PM
            const startTime = new Date(eventDate);
            startTime.setHours(20, 0, 0, 0);

            concerts.push({
                date: eventDate,
                name: `Concert ${i}`,
                address: `Concert Venue ${i}`,
                startTime,
                host: `Concert Host ${i}`,
                performers: [`Band ${i}A`, `Band ${i}B`],
                sponsors: [`Sponsor ${i}`],
                ticketPricing: [
                    { tier: 'Standard', amountAvailable: 100, pricePerTicket: 50 },
                    { tier: 'VIP', amountAvailable: 20, pricePerTicket: 120 }
                ],
            });
        }
        const concertDocs = [];
        for (const data of concerts) {
            const concert = new Concert(data);
            const saved = await concert.save();
            concertDocs.push(saved);
        }
        console.log(`Inserted ${concertDocs.length} concerts`);

        // 4. Seed Other Events (10 entries)
        const others = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);

            // Other events start at 5:00 PM
            const startTime = new Date(eventDate);
            startTime.setHours(17, 0, 0, 0);

            others.push({
                date: eventDate,
                name: `Other Event ${i}`,
                startTime,
                address: `Other Event Venue ${i}`,
                eventCategory: 'Expo',
                organizer: `Organizer ${i}`,
                sponsors: [`Sponsor ${i}`],
                ticketPricing: [
                    { tier: 'General', amountAvailable: 50, pricePerTicket: 30 }
                ],
            });
        }
        const otherDocs = [];
        for (const data of others) {
            const otherEvent = new OtherEvent(data);
            const saved = await otherEvent.save();
            otherDocs.push(saved);
        }
        console.log(`Inserted ${otherDocs.length} other events`);

        // Verify total events in EventSchema (should be 40)
        const totalEvents = await Event.countDocuments({});
        console.log(`Total Event documents created (should be 40): ${totalEvents}`);

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('Disconnected from MongoDB. Seeding complete.');
    }
}

seedData();
