'use strict';

var User = require('../models/user').User;
var Signature = require('../models/signature').Signature;
exports.getUsers = function (req, res) {
    if (req.params.userId) User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) res.status(200).send(user);else res.status(404).send("No User found with that ID");
    });else User.find({}, function (err, users) {
        if (err) res.status(500).send(err);else res.status(200).send(users);
    });
};
exports.getUserSignature = function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) {
            Signature.findById(user.Signature, function (err, signature) {
                if (err) res.status(500).send(err);
                if (signature) res.status(200).send(signature);else res.status(404).send('No signature found for that user');
            });
        } else res.json("No User found with that ID");
    });
};
exports.postUser = function (req, res) {
    var signature = new Signature({
        image: {
            data: req.body.signaturedate,
            contentType: 'image/png'
        }
    });
    signature.save();
    var userData = {
        name: req.body.firstname + ' ' + req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        screenname: req.body.screenname,
        signature: signature._id,
        rfid: {
            id: req.body.rfid
        }
    };
    var query = {
        'email': req.body.email
    };
    User.findOneAndUpdate(query, userData, {
        upsert: true,
        new: true
    }, function (err, doc) {
        if (err) res.status(500).send(err);else res.status(200).send(doc);
    });
};
exports.validateScreenname = function (req, res) {
    User.find({
        screenname: req.body.screenname
    }, function (err, doc) {
        if (err) res.status(500).send(err);else res.status(200).send(doc);
    });
};
exports.deleteUser = function (req, res) {
    User.findByIdAndRemove(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) {
            delete user._id;
            res.status(200).send('User with id ' + user._id + ' deleted');
            if (user.signature) delete user.signature._id;
        } else res.status(404).send("No User found with that ID");
    });
};
module.exports.socketHandler = function (socket) {
    /* Add Socket Handling Logic Here */
};