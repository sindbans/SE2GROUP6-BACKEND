// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

// Models
const Customer = require('./models/Customer');

// App init
const app = express();

// Middleware
app.use(cors({
    origin: ["https://beamish-baklava-7a2363.netlify.app"],
    credentials: true
}));
app.use(express.json());

// Express-session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'hermes_secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy using CustomerSchema
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://se2group6-backend-1.onrender.com/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;

        let user = await Customer.findOne({ email });

        if (!user) {
            user = new Customer({
                firstName: profile.given_name || "Google",
                lastName: profile.family_name || "User",
                email: email,
                password: crypto.randomBytes(16).toString("hex"),
                profileImage: profile.photos[0].value,
            });
            await user.save();
        }

        // Return a custom object with fields your frontend expects
        return done(null, {
            displayName: `${user.firstName} ${user.lastName}`,
            googleId: user.uid, // you could save profile.id to db if needed
            email: user.email
        });

    } catch (err) {
        return done(err, null);
    }
}));


passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });


// Routes
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const filterRoutes = require('./routes/filterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const locationRoutes = require('./routes/locationRoutes');
const seatRoutes = require('./routes/seatRoutes');
const authRoutes = require('./routes/authRoutes');
const managementAuthRoutes = require('./routes/managementRoutes');
const employeeAuthRoutes = require('./routes/employeeRoutes');
const crypto = require('crypto');

app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/filter', filterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/auth', authRoutes); // now includes Google + manual auth
app.use('/api/management', managementAuthRoutes);
app.use('/api/employee', employeeAuthRoutes);


module.exports = app;
