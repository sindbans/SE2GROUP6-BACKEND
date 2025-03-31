// test/eventController.test.js
jest.setTimeout(10000);



const request = require('supertest');
const mongoose = require('mongoose');

// Assuming your Express app is exported from app.js
const app = require('../app');

// Import the Event model for test setup/lookup
const Event = require('../models/EventSchema');

describe('Event Controller', () => {
    describe('GET /api/events', () => {
        test('should return all events with standardized preview fields', async () => {
            const res = await request(app).get('/api/events');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('events');
            expect(Array.isArray(res.body.events)).toBe(true);
            // Expect 40 events (the original valid events only)
            expect(res.body.events).toHaveLength(40);

            // Check that each event preview has the expected keys
            res.body.events.forEach((event) => {
                expect(Object.keys(event)).toEqual(
                    expect.arrayContaining(['name', 'type', 'eventDate', 'posterImage', 'eventId'])
                );
            });
        });
    });

    describe('GET /api/events/:eventId', () => {
        test('should return detailed info for a valid Movie event', async () => {
            // Find one event of type MovieSchema
            const movieEvent = await Event.findOne({ type: 'MovieSchema' });
            expect(movieEvent).toBeTruthy();

            const res = await request(app).get(`/api/events/${movieEvent.eventUUID}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('eventDetails');
            const details = res.body.eventDetails;
            expect(details).toHaveProperty('eventId');
            expect(typeof details.eventId).toBe('string');
            expect(details).toHaveProperty('eventDate');
            expect(details).toHaveProperty('address');
            // Additional movie-specific checks
            expect(details).toHaveProperty('genre', 'Action');
            expect(details).toHaveProperty('director');
            expect(details.director).toEqual(expect.stringContaining('Director'));
        });

        test('should return detailed info for a valid Concert event', async () => {
            const concertEvent = await Event.findOne({ type: 'ConcertSchema' });
            expect(concertEvent).toBeTruthy();

            const res = await request(app).get(`/api/events/${concertEvent.eventUUID}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('eventDetails');
            const details = res.body.eventDetails;
            expect(details).toHaveProperty('eventId');
            expect(details).toHaveProperty('address'); // Concert's address
            expect(details).toHaveProperty('host');
            expect(details.host).toEqual(expect.stringContaining('Concert Host'));
        });

        test('should return detailed info for a valid Theatre event', async () => {
            const theatreEvent = await Event.findOne({
                $or: [{ type: 'TheatreSchema' }, { type: 'Theatre' }]
            });
            expect(theatreEvent).toBeTruthy();

            const res = await request(app).get(`/api/events/${theatreEvent.eventUUID}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('eventDetails');
            const details = res.body.eventDetails;
            expect(details).toHaveProperty('eventId');
            expect(details).toHaveProperty('address'); // Should be theatreAddress
            expect(details).toHaveProperty('genre');
            expect(details.genre).toEqual(expect.stringContaining('Drama'));
        });

        test('should return detailed info for a valid OtherEvent event', async () => {
            const otherEvent = await Event.findOne({ type: 'OtherEventSchema' });
            expect(otherEvent).toBeTruthy();

            const res = await request(app).get(`/api/events/${otherEvent.eventUUID}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('eventDetails');
            const details = res.body.eventDetails;
            expect(details).toHaveProperty('eventId');
            expect(details).toHaveProperty('address'); // Other Event's venue address
            expect(details).toHaveProperty('eventCategory', 'Expo');
        });

        test('should return 404 when event is not found', async () => {
            const res = await request(app).get('/api/events/NonExistingUUID');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toEqual(expect.stringContaining('Event not found'));
        });
    });
});
