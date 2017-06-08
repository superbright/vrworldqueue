'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user').User;
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
// in latest body-parser use like below.
router.use(bodyParser.urlencoded({
    extended: true
}));
router.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) res.json(err);else res.send(users);
    });
});
router.get('/:userId', function (req, res) {
    User.findById(req.params.userId, function (err, user) {
        if (err) res.send(err);
        if (user) res.send(user);else res.json("No User found with that ID");
    });
});
router.post('/', function (req, res) {
    var newUser = new User({
        name: req.body.firstname + ' ' + req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        username: req.body.username
    });
    newUser.save();
    res.send(newUser);
});
router.delete('/:userId', function (req, res) {
    User.findByIdAndRemove(req.params.userId, function (err, user) {
        if (err) res.send(err);
        if (user) {
            delete user._id;
            res.send('User with id ' + user._id + ' deleted');
        } else res.send("No User found with that ID");
    });
});
module.exports = router;