const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/tictactoe';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Serve static files from the 'graphic' directory
app.use(express.static(path.join(__dirname, 'graphic')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/signup.html'));
});

// Handle signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (err) {
        console.error(err);
        res.status(400).send('Error creating user');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
