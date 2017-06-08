'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: String
});
var Queue = mongoose.model('Queue', schema);
module.exports = {
    Queue: Queue
};