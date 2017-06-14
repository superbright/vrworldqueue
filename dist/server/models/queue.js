'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timeAdded: {
            type: Date,
            default: Date.now
        },
        _id: false
    }]
});
var Queue = mongoose.model('Queue', schema);
module.exports = {
    Queue: Queue
};