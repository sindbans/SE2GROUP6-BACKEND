// seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Import your models
const Movie = require('../models/MovieSchema');
const Theatre = require('../models/TheatreSchema');
const Concert = require('../models/ConcertSchema');
const OtherEvent = require('../models/OtherEventSchema');
const Event = require('../models/EventSchema');
const Management = require('../models/Management');
const Employee = require('../models/Employee');
const Company = require('../models/Company');

// Debug: Log the MongoDB URI to verify it's loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

async function seedData() {
    try {
        // Clean up previous data
        await Movie.deleteMany({});
        await Theatre.deleteMany({});
        await Concert.deleteMany({});
        await OtherEvent.deleteMany({});
        await Event.deleteMany({});
        await Management.deleteMany({});
        await Employee.deleteMany({});
        await Company.deleteMany({});

        const now = new Date();

        // 1. Seed Movies (10 entries)
        const movies = [];
        for (let i = 1; i <= 10; i++) {
            const screeningDate = new Date(now);
            screeningDate.setDate(now.getDate() + i);
            const startTime = new Date(screeningDate);
            startTime.setHours(18, 30, 0, 0);
            movies.push({
                screeningDate,
                name: `Movie ${i}`,
                genre: 'Action',
                director: `Director ${i}`,
                cast: [`Actor ${i}A`, `Actor ${i}B`],
                runtime: 120 + i,
                startTime,
                hallNumber: i,
                cinemaAddress: `Cinema Address ${i}`,
                seats: Array.from({ length: 20 }, (_, index) => ({
                    seatNumber: `M${i}-S${index + 1}`,
                    isBought: false,
                })),
                imdbRating: 7.5,
                rottenTomatoesRating: 80,
                address: {
                    type: 'Point',
                    coordinates: [ -73.9855 + i * 0.001, 40.7580 + i * 0.001 ]
                }
            });
        }
        for (const data of movies) {
            const movie = new Movie(data);
            await movie.save();
        }
        console.log(`Inserted 10 movies`);

        // 2. Seed Theatre Shows (10 entries)
        const theatres = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);
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
                address: {
                    type: 'Point',
                    coordinates: [ -73.9851 + i * 0.001, 40.7614 + i * 0.001 ]
                }
            });
        }
        for (const data of theatres) {
            const theatre = new Theatre(data);
            await theatre.save();
        }
        console.log(`Inserted 10 theatre shows`);

        // 3. Seed Concerts (10 entries)
        const concerts = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);
            const startTime = new Date(eventDate);
            startTime.setHours(20, 0, 0, 0);
            concerts.push({
                date: eventDate,
                name: `Concert ${i}`,
                address: {
                    type: 'Point',
                    coordinates: [ -73.9934 + i * 0.001, 40.7505 + i * 0.001 ]
                },
                startTime,
                host: `Concert Host ${i}`,
                performers: [`Band ${i}A`, `Band ${i}B`],
                sponsors: [`Sponsor ${i}`],
                ticketPricing: [
                    { tier: 'Standard', amountAvailable: 100, pricePerTicket: 50 },
                    { tier: 'VIP', amountAvailable: 20, pricePerTicket: 120 }
                ]
            });
        }
        for (const data of concerts) {
            const concert = new Concert(data);
            await concert.save();
        }
        console.log(`Inserted 10 concerts`);

        // 4. Seed Other Events (10 entries)
        const others = [];
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + i);
            const startTime = new Date(eventDate);
            startTime.setHours(17, 0, 0, 0);
            others.push({
                date: eventDate,
                name: `Other Event ${i}`,
                startTime,
                address: {
                    type: 'Point',
                    coordinates: [ -73.9712 + i * 0.001, 40.7831 + i * 0.001 ]
                },
                eventCategory: 'Expo',
                organizer: `Organizer ${i}`,
                sponsors: [`Sponsor ${i}`],
                ticketPricing: [
                    { tier: 'General', amountAvailable: 50, pricePerTicket: 30 }
                ]
            });
        }
        for (const data of others) {
            const otherEvent = new OtherEvent(data);
            await otherEvent.save();
        }
        console.log(`Inserted 10 other events`);

        const totalEvents = await Event.countDocuments({});
        console.log(`Total Event documents created (should be 40): ${totalEvents}`);

        // 5. Seed Companies, Management, and Employees
        const companies = [];
        for (let i = 1; i <= 3; i++) {
            const company = new Company({
                companyName: `Company ${i}`
            });
            const savedCompany = await company.save();
            companies.push(savedCompany);
        }
        console.log("Companies created:", companies);

        const adminManagement = new Management({
            firstName: "Admin",
            lastName: "User",
            companyName: companies[0].companyName,
            companyId: companies[0].companyId,
            password: "password123",
            isAdmin: true
        });
        const regularManagement = new Management({
            firstName: "Regular",
            lastName: "Manager",
            companyName: companies[1].companyName,
            companyId: companies[1].companyId,
            password: "password123",
            isAdmin: false
        });
        const employee = new Employee({
            firstName: "Employee",
            lastName: "User",
            email: "employee@company.com",
            password: "password123",
            companyId: companies[0].companyId
        });
        await adminManagement.save();
        await regularManagement.save();
        await employee.save();
        console.log("Users created.");

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('Disconnected from MongoDB. Seeding complete.');
    }
}

seedData();
