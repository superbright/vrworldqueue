'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    screenname: {
        type: String
    },
    usedVR: {
        type: Boolean
    },
    queue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Queue'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    signature: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signature'
    },
    rfid: {
        id: {
            type: String
        },
        expiresAt: {
            type: Date,
            default: new Date(new Date().setHours(0, 0, 0, 0))
        }
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});
var User = mongoose.model('User', schema);
module.exports = {
    User: User
};