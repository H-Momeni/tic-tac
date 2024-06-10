const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const http = require('http');
const User = require('./models/User'); // Import the User model

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27017/tictactoe';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Serve static files from the 'graphic' directory
app.use(express.static(path.join(__dirname, 'graphic')));

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/signup.html'));
});

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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).send('Login successful');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // Handle socket events here
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Add more socket event handlers as needed
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
