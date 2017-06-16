var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId
        , ref: 'User'
    }
    , bay: {
        type: mongoose.Schema.Types.ObjectId
        , ref: 'Bay'
    }
    , timeAdded: {
        type: Date
        , default: Date.now
    }
});
var Queue = mongoose.model('Queue', schema);
module.exports = {
    Queue: Queue
}