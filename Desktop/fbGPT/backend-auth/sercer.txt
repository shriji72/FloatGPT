require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const User = require('./models/user.js'); 


const app = express();
app.use(express.json());
app.use(cors());

connectDB(); // Connect to MongoDB

// Register User
app.post('/api/signup', async (req, res) => {
    console.log("Received Request Body:", req.body);

    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log("User already exists:", user);  // <-- Log existing user
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        console.log("Generated Salt:", salt);  // <-- Log the salt
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed Password:", hashedPassword);  // <-- Log the hashed password

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
        console.error("Error in signup:", err);  // <-- Log errors
        res.status(500).json({ message: "Server error" });
    }
});




// Login User
// Login User
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials (User not found)" });

        console.log("Entered Password:", password);
        console.log("Stored Hashed Password:", user.password);

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isMatch); // Debugging log

        if (!isMatch) return res.status(400).json({ message: "Invalid credentials (Password mismatch)" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token, userId: user._id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});





// Protected Route Example
app.get('/api/protected', (req, res) => {
    const token = req.header("Authorization");



    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Extract token after "Bearer "
        const extractedToken = token.split(" ")[1];

     

        // Verify Token
        const decoded = jwt.verify(extractedToken, process.env.JWT_SECRET);
        req.user = decoded;

        res.json({ message: "Protected route accessed" });
    } catch (err) {
        console.log("JWT Verification Error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

