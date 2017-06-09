'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    image: {
        data: Buffer,
        contentType: String
    }
});
var Signature = mongoose.model('Signature', schema);
module.exports = {
    Signature: Signature
};