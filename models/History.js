// models/User.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    groupid: {
        type: String,
        required: true,

    },
    player1: {
        type: String,
        required: false,

    },
    player2: {
        type: String,
        required: false,
    },
    winner: {
        type: String,
        required: false,
        default: 'unknown'
    }
});

const History = mongoose.model('History', historySchema);

module.exports = History;
