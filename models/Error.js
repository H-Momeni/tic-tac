// models/User.js
const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
   
    username: {
        type: String,
        required: true,

    },
    socketID: {
        type: String,
        required: true
    }
});

const Error = mongoose.model('Error', errorSchema);

module.exports = Error;
