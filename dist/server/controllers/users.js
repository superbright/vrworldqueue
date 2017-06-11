'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user').User;
var Signature = require('../models/signature').Signature;
router.use(bodyParser.json());
router.get('/:userId?', function (req, res) {
    if (req.params.userId) User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) res.status(200).send(user);else res.status(404).send("No User found with that ID");
    });else User.find({}, function (err, users) {
        if (err) res.status(500).send(err);else res.status(200).send(users);
    });
});
router.get('/:userId/signature', function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) {
            Signature.findById(user.Signature, function (err, signature) {
                if (err) res.status(500).send(err);
                if (signature) res.status(200).send(signature);else res.status(404).send('No signature found for that user');
            });
        } else res.json("No User found with that ID");
    });
});
router.post('/', function (req, res) {
    console.log(req.body);
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
        signature: signature._id
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
});
router.delete('/:userId', function (req, res) {
    User.findByIdAndRemove(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) {
            delete user._id;
            res.status(200).send('User with id ' + user._id + ' deleted');
            if (user.signature) delete user.signature._id;
        } else res.status(404).send("No User found with that ID");
    });
});
module.exports = router;