// test/booking.test.js
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
    const customerId = new mongoose.Types.ObjectId();

    beforeAll(async () => {
        // Retrieve one event per type from the seeded data.
        movieEvent = await Movie.findOne({});
        theatreEvent = await Theatre.findOne({});
        concertEvent = await Concert.findOne({});
        otherEvent = await OtherEvent.findOne({});

        if (!movieEvent || !theatreEvent || !concertEvent || !otherEvent) {
            throw new Error('Seed data missing: ensure events are seeded properly.');
        }
    });

    // Reset state for movie and theatre events before each test.
    beforeEach(async () => {
        // Reset movie seats: mark all as not bought and clear ticketNumber.
        await Movie.updateOne(
            { _id: movieEvent._id },
            { $set: { "seats.$[].isBought": false, "seats.$[].ticketNumber": null } }
        );
        // Reset theatre seats similarly.
        await Theatre.updateOne(
            { _id: theatreEvent._id },
            { $set: { "seats.$[].isBought": false, "seats.$[].ticketNumber": null } }
        );
    });

    afterEach(async () => {
        // Clean up any created tickets between tests.
        await Ticket.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Movie Booking', () => {
        test('should successfully book available seats for a movie', async () => {
            // Get fresh movie data.
            const freshMovie = await Movie.findById(movieEvent._id);
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
            expect(res.body).toHaveProperty('ticket');
            expect(res.body.ticket).toHaveProperty('tickets');
            expect(Array.isArray(res.body.ticket.tickets)).toBe(true);
            expect(res.body.ticket.tickets.length).toEqual(seatNumbers.length);

            // Verify that the seats are marked as booked.
            const updatedMovie = await Movie.findById(freshMovie._id);
            for (const seatNumber of seatNumbers) {
                const seat = updatedMovie.seats.find(s => s.seatNumber === seatNumber);
                expect(seat.isBought).toBe(true);
            }
        });

        test('should fail booking if seat numbers are missing', async () => {
            const bookingDetails = {
                userId: customerId,
                eventType: 'MovieSchema',
                eventId: movieEvent._id,
                price: 15
            };
            const res = await request(app)
                .post('/api/bookings')
                .send(bookingDetails);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toMatch(/No seat numbers provided/);
        });

        test('should fail booking if a seat is already booked', async () => {
            const freshMovie = await Movie.findById(movieEvent._id);
            const availableSeats = freshMovie.seats.filter(s => !s.isBought);
            expect(availableSeats.length).toBeGreaterThan(0);
            const seatNumber = availableSeats[0].seatNumber;
            const bookingDetails1 = {
                userId: customerId,
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers: [seatNumber],
                price: 15
            };
            const res1 = await request(app)
                .post('/api/bookings')
                .send(bookingDetails1);
            expect(res1.status).toBe(201);

            // Attempt to book the same seat again.
            const bookingDetails2 = {
                userId: customerId,
                eventType: 'MovieSchema',
                eventId: freshMovie._id,
                seatNumbers: [seatNumber],
                price: 15
            };
            const res2 = await request(app)
                .post('/api/bookings')
                .send(bookingDetails2);
            expect(res2.status).toBe(400);
            expect(res2.body).toHaveProperty('message');
            expect(res2.body.message).toMatch(/already booked/);
        });
    });

    describe('Theatre Booking', () => {
        test('should successfully book available seats for a theatre event', async () => {
            const freshTheatre = await Theatre.findById(theatreEvent._id);
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
            expect(res.body.ticket).toHaveProperty('tickets');
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
            const freshMovie = await Movie.findById(movieEvent._id);
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
