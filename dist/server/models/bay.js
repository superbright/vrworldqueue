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
    instructionFile: {
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
    currentState: {
        state: {
            type: String,
            default: 'idle'
        },
        endTime: {
            type: Date
        }
    },
    playTime: {
        type: Number
    }
});
var Bay = mongoose.model('Bay', schema);
module.exports = {
    Bay: Bay
};