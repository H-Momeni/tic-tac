const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
var p2p = require('socket.io-p2p-server').Server;
const http = require('http');
const User = require('./models/User'); // Import the User model
const History = require('./models/History'); // Import the History model
const Error = require('./models/Error');



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

app.get('/tic', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/tic.html'));
});

app.get('/toe', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/toe.html'));
});


// Store online users
let onlineUsers = {};
let usergame = {};
const groups = {};


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);



    // Handle user login
    socket.on('user login', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('online users', Object.values(onlineUsers));
        console.log(`${username} has logged in.`);

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

    // Handle disconnection
    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        let finduser = null;
        let findgroupidd = null;


        for (const groupId in groups) {
            // Check if the group exists
            if (groups.hasOwnProperty(groupId)) {
                // Iterate through the members in the group
                for (let i = 0; i < groups[groupId].members.length; i++) {
                    // Check if the current member's socket ID matches the target socket ID
                    if (groups[groupId].members[i].socketId === socket.id) {
                        // If a match is found, return the group ID
                        findgroupidd = groupId;
                        finduser = groups[groupId].members[i].username;
                    }
                }
            }
        }

        if (findgroupidd) {
            try {
                // Find the document in the History collection with the same group ID
                const historyEntry = await History.findOne({ groupid: findgroupidd });

                if (historyEntry) {
                    // Check if the winner field is still unknown
                    if (historyEntry.winner === 'unknown') {
                        // Save the username and socket ID in the Error collection
                        const errorEntry = new Error({
                            username: finduser,
                            socketID: socket.id
                        });
                        await errorEntry.save();
                        console.log(`Error entry saved successfully for user: ${finduser}, Socket ID: ${socket.id}`);
                    } else {
                        console.log(`Winner already decided for group ID ${findgroupidd}`);
                    }
                } else {
                    console.log(`No document found for group ID ${findgroupidd}`);
                }
            } catch (error) {
                console.error('Error processing disconnection:', error);
            }
        } else {
            console.log('Group ID not found for the current socket ID.');
        }



        setTimeout(() => {
            // Emit the username to the client before deleting the user
            if (finduser) {
                console.log(`${finduser} is this!!!`);
                socket.emit('save username', { username: finduser });
            }
        }, 2000);


        delete onlineUsers[socket.id];
        delete usergame[socket.id];
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
        console.log(`${fromUsername} ,${toSocketId} invite is send!! `);

        if (toSocketId) {
            console.log('hey correct');
            io.to(toSocketId).emit('game invite', { fromUsername, fromSocketId: socket.id });
        }
    });

    let findgroupid;

    // Handle box change
    socket.on('box change', ({ boxId, value }) => {
        // Broadcast the change to all other members of the group

        for (const groupId in groups) {
            // Check if the group exists
            if (groups.hasOwnProperty(groupId)) {
                // Iterate through the members in the group
                for (let i = 0; i < groups[groupId].members.length; i++) {
                    // Check if the current member's socket ID matches the target socket ID
                    if (groups[groupId].members[i].socketId === socket.id) {
                        // If a match is found, return the group ID
                        findgroupid = groupId;
                    }
                }
            }
        }

        const group = groups[findgroupid];


        if (group) {
            group.members.forEach(member => {
                if (member.socketId !== socket.id) {
                    io.to(member.socketId).emit('box update', { boxId, value });
                }
            });
        }
    });



    // Handle user login for game page
    socket.on('user login game page', ({ username, groupId }) => {
        usergame[socket.id] = { username, groupId };

        const memberIndex = groups[groupId]?.members.findIndex(
            (member) => member.username === username
        );

        // Update the socketId of the member
        if (memberIndex !== -1) {
            groups[groupId].members[memberIndex].socketId = socket.id;
        }
        console.log(`${username} has logged in game page with group ${groupId}. and socket id is ${socket.id}`);

    });




    // Handle invite acceptance
    socket.on('accept invite', async (fromSocketId) => {
        const toUsername = onlineUsers[socket.id];
        const toSocketId = socket.id;
        const fromUsername = onlineUsers[fromSocketId];

        // Create a unique group ID
        const groupId = `group_${fromUsername}_${toUsername}`;
        groups[groupId] = {
            members: [
                { username: toUsername, socketId: 1 },
                { username: fromUsername, socketId: 2 }
            ]
        };

        console.log(`${toUsername} ,${toSocketId} ,${fromSocketId} ,${fromUsername} `);
        io.to(fromSocketId).emit('invite accepted', { toUsername, toSocketId });
        io.to(toSocketId).emit('redirect to game', { username: toUsername, groupId });
        setTimeout(() => {
            io.to(fromSocketId).emit('redirect to gamee', { username: fromUsername, groupId });
        }, 1000);

        // Save the information in history
        try {
            let historyEntry = await History.findOne({ groupid: groupId });
            if (historyEntry) {
                console.log('History entry already exists');
                historyEntry.winner = 'unknown'; // Set the winner to unknown
                await historyEntry.save();
                console.log('Winner updated to unknown');
            } else {
                historyEntry = new History({
                    groupid: groupId,
                    player1: toUsername,
                    player2: fromUsername,
                    winner: 'unknown', // Initially, set the winner as unknown
                });
                await historyEntry.save();
                console.log('History entry saved successfully');
            }
        } catch (error) {
            console.error('Error checking or saving history entry:', error);
        }

    });

    socket.on('save winner', async (data) => {

        for (const groupId in groups) {
            // Check if the group exists
            if (groups.hasOwnProperty(groupId)) {
                // Iterate through the members in the group
                for (let i = 0; i < groups[groupId].members.length; i++) {
                    // Check if the current member's socket ID matches the target socket ID
                    if (groups[groupId].members[i].socketId === socket.id) {
                        // If a match is found, return the group ID
                        findgroupid = groupId;
                    }
                }
            }
        }

        if (findgroupid) {
            try {
                console.log(`Updating winner for group ID ${findgroupid} with winner ${data.winner}`);

                const updatedDocument = await History.findOneAndUpdate(
                    { groupid: findgroupid },
                    { winner: data.winner },
                    { new: true } // Return the updated document
                );

                if (updatedDocument) {
                    console.log(`Winner updated successfully for group ID ${findgroupid}`);
                    console.log('Updated Document:', updatedDocument);
                } else {
                    console.log(`No document found for group ID ${findgroupid}`);
                }
            } catch (error) {
                console.error('Error updating winner:', error);
            }
        } else {
            console.log('Group ID not found for the current socket ID.');
        }




    });



    // Handle invite rejection
    socket.on('reject invite', (fromSocketId) => {
        const toUsername = onlineUsers[socket.id];
        io.to(fromSocketId).emit('invite rejected', { toUsername });
    });

    socket.on('go to list page', () => {



        for (const groupId in groups) {
            // Check if the group exists
            if (groups.hasOwnProperty(groupId)) {
                // Iterate through the members in the group
                for (let i = 0; i < groups[groupId].members.length; i++) {
                    // Check if the current member's socket ID matches the target socket ID
                    if (groups[groupId].members[i].socketId === socket.id) {
                        // If a match is found, return the group ID
                        finduser = groups[groupId].members[i].username;
                    }
                }
            }
        }

        console.log(`in the go to list page my name is ${finduser}`);


        io.to(socket.id).emit('list page', { username: finduser });


    });

    socket.on('go to list page2', () => {


        setTimeout(() => {
            for (const groupId in groups) {
                // Check if the group exists
                if (groups.hasOwnProperty(groupId)) {
                    // Iterate through the members in the group
                    for (let i = 0; i < groups[groupId].members.length; i++) {
                        // Check if the current member's socket ID matches the target socket ID
                        if (groups[groupId].members[i].socketId === socket.id) {
                            // If a match is found, return the group ID
                            finduser = groups[groupId].members[i].username;
                        }
                    }
                }
            }

            console.log(`in the go to list page my name is ${finduser}`);


            io.to(socket.id).emit('list page', { username: finduser });
        }, 3000);



    });


});
