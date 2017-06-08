var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: {
        type: String
    }
    , email: {
        type: String
        , required: true
    }
    , phone: {
        type: String
    }
    , username: {
        type: String
    }
    , usedVR: {
        type: Boolean
    }
    , role: {
        type: String
        , enum: ['user', 'admin']
        , default: 'user'
    }
, })
var User = mongoose.model('User', schema);
module.exports = {
    User: User
}