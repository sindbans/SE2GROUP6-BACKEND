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
            expect(details).toHaveProperty('address'); // Should be theatreAddress / address
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

    describe('GET /api/events/ranked', () => {
        test('should return ranked events by startTime in ascending order', async () => {
            // Call ranked endpoint with strategy=startTime
            const res = await request(app).get('/api/events/ranked?strategy=startTime');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('events');
            const events = res.body.events;
            // Check that the events are sorted by startTime ascending
            for (let i = 1; i < events.length; i++) {
                const t1 = new Date(events[i - 1].startTime);
                const t2 = new Date(events[i].startTime);
                expect(t1.getTime()).toBeLessThanOrEqual(t2.getTime());
            }
        });

        test('should return ranked events by rating in descending order', async () => {
            // Call ranked endpoint with strategy=rating
            const res = await request(app).get('/api/events/ranked?strategy=rating');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('events');
            const events = res.body.events;
            // Check that the events are sorted by rating descending
            for (let i = 1; i < events.length; i++) {
                const r1 = events[i - 1].rating || 0;
                const r2 = events[i].rating || 0;
                expect(r1).toBeGreaterThanOrEqual(r2);
            }
        });

        test('should return ranked events by location in ascending order', async () => {
            // Call ranked endpoint with strategy=location and reference coordinate in Times Square area.
            const lat = 40.7580;
            const lng = -73.9855;
            const res = await request(app).get(`/api/events/ranked?strategy=location&lat=${lat}&lng=${lng}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('events');
            const events = res.body.events;

            // Helper functions to calculate Haversine distance
            function deg2rad(deg) {
                return deg * (Math.PI / 180);
            }
            function haversineDistance(coords1, coords2) {
                // coords: [lng, lat]
                const [lng1, lat1] = coords1;
                const [lng2, lat2] = coords2;
                const R = 6371; // Earth's radius in kilometers
                const dLat = deg2rad(lat2 - lat1);
                const dLng = deg2rad(lng2 - lng1);
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }
            // Reference coordinate as [lng, lat]
            const refCoords = [lng, lat];
            // Compute distances for each event using its address.coordinates
            const distances = events.map(event => {
                const addr = event.address;
                if (!addr || !addr.coordinates) return Infinity;
                return haversineDistance(addr.coordinates, refCoords);
            });
            // Ensure distances are in ascending order (closest first)
            for (let i = 1; i < distances.length; i++) {
                expect(distances[i - 1]).toBeLessThanOrEqual(distances[i]);
            }
        });
    });
});
