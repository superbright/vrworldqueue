var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    id: {
        type: Number
        , required: true
    }
    , name: {
        type: String
    }
    , game: {
        type: String
    }
    , timeouts: {
        user: {
            type: Date
        }
        , game: {
            type: Date
        }
    }
});
var Bay = mongoose.model('Bay', schema);
module.exports = {
    Bay: Bay
}