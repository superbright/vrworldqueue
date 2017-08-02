'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _util = require('../../shared/util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../models/user').User;
var Signature = require('../models/signature').Signature;

var analytics = require("../googleanalytics.js");
exports.getUsers = function (req, res) {
    var dob = null;
    if (req.params.userId) User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);
        if (user) {
            if (user.dob) {
                user = user.toObject();
                dob = (0, _moment2.default)(user.dob);
                user.dob = {
                    month: dob.month(),
                    date: dob.date(),
                    year: dob.year()
                };
            };
            res.status(200).send(user);
        } else res.status(404).send("No User found with that ID");
    });else User.find({}, function (err, users) {
        if (err) res.status(500).send(err);else res.status(200).send(users);
    });
};
exports.activateUser = function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);else if (user) {
            if (!user.rfid) {
                res.status(404).send("User does not have RFID");
            } else {
                user.rfid.expiresAt = (0, _util.twoAMTomorrow)();
                user.save(function (err, doc) {
                    if (err) res.status(500).send(err);else {
                        analytics.sendAnalytics("User", "Activate User", doc.screenname, new Date().getMilliseconds(), {});
                        res.status(200).send(doc);
                    }
                });
            }
        } else {
            res.status(404).send("No user found with that ID");
        }
    });
};
exports.deactivateUser = function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);else if (user) {
            if (!user.rfid) {
                res.status(404).send("User does not have RFID");
            } else {
                user.rfid.expiresAt = (0, _util.midnightThisMorning)();
                user.save(function (err, doc) {
                    if (err) res.status(500).send(err);else res.status(200).send(doc);
                });
            }
        } else {
            res.status(404).send("No user found with that ID");
        }
    });
};
exports.getUserSignature = function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.status(500).send(err);else if (user) {
            Signature.findById(user.Signature, function (err, signature) {
                if (err) res.status(500).send(err);
                if (signature) res.status(200).send(signature);else res.status(404).send('No signature found for that user');
            });
        } else res.json("No User found with that ID");
    });
};
exports.checkScreenName = function (req, res) {
    if (req.params.screenname != null) {
        User.findOne({
            screenname: req.params.screenname
        }, function (err, user) {
            if (err) res.status(500).send(err);else if (user) {
                res.json({
                    status: true,
                    error: 'Screenname already taken'
                });
            } else res.json({
                status: true
            });
        });
    } else {
        res.json({
            status: false,
            error: 'must send screenname'
        });
    }
};
exports.postUser = function (req, res) {
    var signature = new Signature({
        image: {
            data: req.body.signaturedate,
            contentType: 'image/png'
        }
    });
    signature.save();
    var userData = {};
    if (req.body.firstname != null) userData.firstname = req.body.firstname;
    if (req.body.lastname != null) userData.lastname = req.body.lastname;
    if (req.body.email != null) userData.email = req.body.email;
    if (req.body.phone != null) userData.phone = req.body.phone;
    if (req.body.screenname != null) userData.screenname = req.body.screenname;
    if (req.body.createdAt != null) userData.createdAt = req.body.createdAt;
    if (req.body.gender != null) userData.gender = req.body.gender;
    if (req.body.dob != null) userData.dob = (0, _moment2.default)(req.body.dob);
    if (req.body.address != null) userData.address = req.body.address;
    userData.signature = signature._id;
    if (req.body.rfid) {
        console.log('Adding RFID');
        userData.rfid = {};
        userData.rfid.id = req.body.rfid;
        userData.rfid.expiresAt = req.body.timer && !isNaN(parseInt(req.body.timer)) ? (0, _moment2.default)().add(req.body.timer, 'h').toDate() : (0, _util.twoAMTomorrow)();
    }
    var query = {
        'email': req.body.email
    };
    User.findOneAndUpdate(query, userData, {
        upsert: true,
        new: true
    }, function (err, doc) {
        if (err) res.status(500).send(err);else {
            analytics.sendAnalytics("User", "Register User", doc.screenname, new Date().getMilliseconds(), {});
            res.status(200).send(doc);
        }
    });
};
exports.validateUser = function (req, res) {
    User.find({
        screenname: req.body.screenname
    }, function (err, doc) {
        var response = {};
        if (err) res.status(500).send(err);else if (doc) response = {
            valid: false
        };else response = {
            valid: true
        };
        res.status(200).send(response);
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