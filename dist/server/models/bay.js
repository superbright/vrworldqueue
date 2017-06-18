'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String
    },
    game: {
        type: String
    },
    timeouts: {
        user: {
            type: Date
        },
        game: {
            type: Date
        }
    },
    state: {
        type: String,
        enum: ['Idle', 'Waiting', 'Playing'],
        default: 'Idle'
    },
    playTime: {
        type: Number
    }
});
var Bay = mongoose.model('Bay', schema);
module.exports = {
    Bay: Bay
};