var User = require('../models/user').User;
var Signature = require('../models/signature').Signature;
exports.getUsers = (req, res) => {
    if (req.params.userId) User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        if (user) res.status(200).send(user);
        else res.status(404).send("No User found with that ID");
    });
    else User.find({}, (err, users) => {
        if (err) res.status(500).send(err);
        else res.status(200).send(users);
    });
}
exports.getUserSignature = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        if (user) {
            Signature.findById(user.Signature, (err, signature) => {
                if (err) res.status(500).send(err);
                if (signature) res.status(200).send(signature);
                else res.status(404).send('No signature found for that user');
            });
        }
        else res.json("No User found with that ID");
    });
};
exports.postUser = (req, res) => {
    var signature = new Signature({
        image: {
            data: req.body.signaturedate
            , contentType: 'image/png'
        }
    });
    signature.save();
    var userData = {
        name: req.body.firstname + ' ' + req.body.lastname
        , email: req.body.email
        , phone: req.body.phone
        , screenname: req.body.screenname
        , signature: signature._id
        , rfid: {
            id: req.body.rfid
        }
    };
    var query = {
        'email': req.body.email
    };
    User.findOneAndUpdate(query, userData, {
        upsert: true
        , new: true
    }, (err, doc) => {
        if (err) res.status(500).send(err);
        else res.status(200).send(doc);
    });
};
exports.validateUser = (req, res) => {
    User.find({
        screenname: req.body.screenname
    }, (err, doc) => {
        var response = {};
        if (err) res.status(500).send(err);
        else if (doc) response = {
            valid: false
        };
        else response = {
            valid: true
        };
        res.status(200).send(response);
    });
}
exports.deleteUser = (req, res) => {
    User.findByIdAndRemove(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        if (user) {
            delete user._id;
            res.status(200).send('User with id ' + user._id + ' deleted');
            if (user.signature) delete user.signature._id;
        }
        else res.status(404).send("No User found with that ID");
    });
};
module.exports.socketHandler = (socket) => {
    /* Add Socket Handling Logic Here */
};