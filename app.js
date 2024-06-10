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

const server = http.createServer(app);
const io = socketIO(server);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Serve static files from the 'graphic' directory
app.use(express.static(path.join(__dirname, 'graphic')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/signup.html'));
});

app.get('/list', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/list.html'));
});

// Store online users
let onlineUsers = {};


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user login
    socket.on('user login', () => {
        onlineUsers[socket.id] = username1;
        io.emit('online users', Object.values(onlineUsers));
        console.log(`${username1} has logged in.`);
    });

    // Handle user signup
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

    // Handle user login
    let username1;
    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        username1=username;
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

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete onlineUsers[socket.id];
        io.emit('online users', Object.values(onlineUsers));
    });

    // Request online users
    socket.on('request online users', () => {
        socket.emit('online users', Object.values(onlineUsers));
    });

    // Handle game invitation
    socket.on('send invite', (toUsername) => {
        const fromUsername = onlineUsers[socket.id];
        const toSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === toUsername);
        if (toSocketId) {
            io.to(toSocketId).emit('game invite', { fromUsername, fromSocketId: socket.id });
        }
    });

    // Handle invite acceptance
    socket.on('accept invite', (fromSocketId) => {
        const toUsername = onlineUsers[socket.id];
        io.to(fromSocketId).emit('invite accepted', { toUsername, toSocketId: socket.id });
    });

    // Handle invite rejection
    socket.on('reject invite', (fromSocketId) => {
        const toUsername = onlineUsers[socket.id];
        io.to(fromSocketId).emit('invite rejected', { toUsername });
    });

   
});
