require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const FormDataModel = require('./models/FormData');  // Manual users
const userdb = require("./models/userSchema"); // Google users

const app = express();
const PORT = 6005;

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://krisha:krisha@cluster0.gou06.mongodb.net/BookingMernGoogle?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

app.use(session({
    secret: "random_secret_key",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// **🔹 Google Authentication Strategy**
passport.use(
    new OAuth2Strategy({
        clientID: "651965553288-t2b38fd64bk79bi7iofgdmokmdgvtdiu.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            // ✅ Check if email is already registered manually
            const existingManualUser = await FormDataModel.findOne({ email });
            if (existingManualUser) {
                return done(null, false, { message: "Email already registered manually. Please log in using email & password." });
            }

            // ✅ Check if Google user already exists
            let googleUser = await userdb.findOne({ googleId: profile.id });
            if (!googleUser) {
                googleUser = new userdb({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: email,
                    image: profile.photos[0].value
                });
                await googleUser.save();
            }
            return done(null, googleUser);
        } catch (error) {
            return done(error, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

// **🔹 Google Authentication Routes**
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login"
}), (req, res) => {
    res.redirect("http://localhost:5173/home");
});

// **🔹 Manual Registration Route**
app.post('/register', async (req, res) => {
    try {
        console.log("🔹 Received registration request:", req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Check if email is already registered (either in Google or manually)
        const existingUser = await FormDataModel.findOne({ email });
        const existingGoogleUser = await userdb.findOne({ email });

        if (existingUser || existingGoogleUser) {
            console.log("❌ Email already exists:", email);
            return res.status(400).json({ message: "Email is already registered." });
        }

        // ✅ Save new manual user in `formdatas`
        const newUser = new FormDataModel({ name, email, password });
        await newUser.save();

        console.log("✅ New user registered:", email);
        res.status(201).json({ message: "Registration successful" });

    } catch (err) {
        console.error("🚨 Error in /register:", err);
        res.status(500).json({ message: err.message || "Server error" });
    }
});

// **🔹 Login Route**
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Check both databases for email
        const manualUser = await FormDataModel.findOne({ email });
        const googleUser = await userdb.findOne({ email });

        if (!manualUser && !googleUser) {
            return res.status(404).json({ message: "No records found!" });
        }

        // ✅ If it's a Google account, skip password check
        if (googleUser) {
            return res.json({ message: "Success (Google Account)" });
        }

        // ✅ If it's a manual account, verify password
        const isMatch = await manualUser.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        res.json({ message: "Success" });
    } catch (err) {
        console.error("🚨 Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// API Test Route
app.get('/', (req, res) => {
    res.send('🚀 API is running...');
});

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
