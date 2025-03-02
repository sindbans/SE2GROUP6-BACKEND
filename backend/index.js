require('dotenv').config(); // Load environment variables
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/FormData');

const app = express();
app.use(express.json());
app.use(cors());

// Securely store MongoDB URI in an environment variable (.env file)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://tarashbudhrani:kusumsunil@cluster0.7aqpb.mongodb.net/BookingSystem?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Handle successful/failed connection
mongoose.connection.once('open', () => console.log("🎉 MongoDB connection established"));
mongoose.connection.on('error', (err) => console.error("🚨 MongoDB Error:", err));

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await FormDataModel.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "Already registered" });
        }

        // Hashing is handled inside the model (FormData.js)
        const newUser = await FormDataModel.create(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        console.error("Error in /register:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await FormDataModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No records found!" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        res.json({ message: "Success" });
    } catch (err) {
        console.error("Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/', (req, res) => {
    res.send('🚀 API is running...');
});

app.listen(3001, () => {
    console.log("🚀 Server listening on http://127.0.0.1:3001");
});
