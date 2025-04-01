jest.setTimeout(15000);

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Ticket = require('../models/TicketSchema');
const Movie = require('../models/MovieSchema');
const Concert = require('../models/ConcertSchema');
const Theatre = require('../models/TheatreSchema');
const OtherEvent = require('../models/OtherEventSchema');

describe('Booking Functionality', () => {
    let movieEvent, theatreEvent, concertEvent, otherEvent;
    // For logged-in bookings, simulate a customer ID.
    const customerId = new mongoose.Types.ObjectId();
    // For guest checkouts.
    const guestName = "Guest User";
    const guestEmail = "guest@example.com";

    beforeAll(async () => {
        // Use distinct event names for resetting.
        movieEvent = await Movie.findOne({ name: "Movie 1" });
        theatreEvent = await Theatre.findOne({ name: "Theatre Show 1" });
        concertEvent = await Concert.findOne({ name: "Concert 1" });
        otherEvent = await OtherEvent.findOne({ name: "Other Event 1" });

        if (!movieEvent || !theatreEvent || !concertEvent || !otherEvent) {
            throw new Error('Seed data missing: ensure events are seeded properly.');
        }
    });

    beforeEach(async () => {
        // Re-fetch and reset the movie and theatre documents.
        movieEvent = await Movie.findOne({ name: "Movie 1" });
        movieEvent.seats = movieEvent.seats.map(seat => ({
            ...seat.toObject(),
            isBought: false,
            ticketNumber: null,
        }));
        await movieEvent.save();

        theatreEvent = await Theatre.findOne({ name: "Theatre Show 1" });
        theatreEvent.seats = theatreEvent.seats.map(seat => ({
            ...seat.toObject(),
            isBought: false,
            ticketNumber: null,
        }));
        await theatreEvent.save();
    });

    afterEach(async () => {
        await Ticket.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Logged-in Movie Booking', () => {
        test('should successfully book available seats for a movie with a customer ID', async () => {
            const freshMovie = await Movie.findOne({ name: "Movie 1" });
            const availableSeats = freshMovie.seats.filter(s => !s.isBought);
            expect(availableSeats.length).toBeGreaterThanOrEqual(2);
            const seatNumbers = [availableSeats[0].seatNumber, availableSeats[1].seatNumber];
            const bookingDetails = {
                userId: customerId,
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers,
                price: 15
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket).toHaveProperty('tickets');
            expect(res.body.ticket.tickets.length).toEqual(seatNumbers.length);
            const updatedMovie = await Movie.findOne({ name: "Movie 1" });
            for (const seatNumber of seatNumbers) {
                const seat = updatedMovie.seats.find(s => s.seatNumber === seatNumber);
                expect(seat.isBought).toBe(true);
            }
        });
    });

    describe('Guest Movie Booking', () => {
        test('should successfully book available seats for a movie with guest checkout', async () => {
            const freshMovie = await Movie.findOne({ name: "Movie 1" });
            const availableSeats = freshMovie.seats.filter(s => !s.isBought);
            expect(availableSeats.length).toBeGreaterThanOrEqual(2);
            const seatNumbers = [availableSeats[0].seatNumber, availableSeats[1].seatNumber];
            const bookingDetails = {
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers,
                price: 15,
                guestName,
                guestEmail
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket).toHaveProperty('tickets');
            expect(res.body.ticket.tickets.length).toEqual(seatNumbers.length);
            const updatedMovie = await Movie.findOne({ name: "Movie 1" });
            for (const seatNumber of seatNumbers) {
                const seat = updatedMovie.seats.find(s => s.seatNumber === seatNumber);
                expect(seat.isBought).toBe(true);
            }
        });

        test('should fail guest booking if guest details are missing', async () => {
            const freshMovie = await Movie.findOne({ name: "Movie 1" });
            const bookingDetails = {
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers: [freshMovie.seats[0].seatNumber],
                price: 15
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Guest checkout requires guestName and guestEmail/);
        });
    });

    describe('Theatre Booking', () => {
        test('should successfully book available seats for a theatre event', async () => {
            const freshTheatre = await Theatre.findOne({ name: "Theatre Show 1" });
            const availableSeats = freshTheatre.seats.filter(s => !s.isBought);
            expect(availableSeats.length).toBeGreaterThanOrEqual(1);
            const seatNumbers = [availableSeats[0].seatNumber];
            const bookingDetails = {
                userId: customerId,
                eventType: 'TheatreSchema',
                eventId: freshTheatre._id,
                seatNumbers,
                price: 20
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket.tickets[0]).toHaveProperty('ticketId');
            expect(res.body.ticket.tickets[0]).toHaveProperty('seatNumber');
        });
    });

    describe('Concert Booking', () => {
        test('should successfully book a concert ticket for a valid tier', async () => {
            const bookingDetails = {
                userId: customerId,
                eventType: 'ConcertSchema',
                eventId: concertEvent._id,
                tier: 'VIP',
                price: 120
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket).toHaveProperty('ticketNumber');
            expect(res.body.ticket).toHaveProperty('tier', 'VIP');
        });

        test('should fail booking for concert if tier is missing', async () => {
            const bookingDetails = {
                userId: customerId,
                eventType: 'ConcertSchema',
                eventId: concertEvent._id,
                price: 50
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/Ticket tier must be provided/);
        });
    });

    describe('Other Event Booking', () => {
        test('should successfully book a ticket for other events with valid tier', async () => {
            const bookingDetails = {
                userId: customerId,
                eventType: 'OtherEventSchema',
                eventId: otherEvent._id,
                tier: 'General',
                price: 30
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket).toHaveProperty('ticketNumber');
            expect(res.body.ticket).toHaveProperty('tier', 'General');
        });
    });

    describe('High Demand Booking', () => {
        test('should successfully book a large number of seats for a movie (simulate high demand)', async () => {
            const freshMovie = await Movie.findOne({ name: "Movie 1" });
            const availableSeats = freshMovie.seats.filter(s => !s.isBought);
            expect(availableSeats.length).toBeGreaterThanOrEqual(10);
            const seatNumbers = availableSeats.slice(0, 10).map(s => s.seatNumber);
            const bookingDetails = {
                userId: customerId,
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers,
                price: 15
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(201);
            expect(res.body.ticket.tickets).toHaveLength(seatNumbers.length);
        });
    });
});
