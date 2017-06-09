'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: String,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});
var Queue = mongoose.model('Queue', schema);
module.exports = {
    Queue: Queue
};