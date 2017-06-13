'use strict';

var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var scheduler = require("../services/scheduler");
var sockets = require('../services/sockets');
var schedulerTasks = {
    userTimeout: {},
    gameTimeout: {}
};
exports.getBays = function (req, res) {
    if (req.params.bayId) {
        Bay.findById(req.params.bayId, function (err, bay) {
            if (err) res.status(500).send(err);
            if (bay) res.status(200).send(bay);else res.status(404).send("No Bay found with that ID");
        });
    } else Bay.find({}, function (err, bays) {
        if (err) res.status(500).send(err);else res.status(200).send(bays);
    });
};
exports.upsertBay = function (req, res) {
    var newBay = new Bay({
        id: req.body.id,
        name: req.body.name,
        game: req.body.game
    });
    newBay.save();
    res.status(200).send(newBay);
};
exports.enqueueUser = function (req, res) {
    User.findById(req.body.userId, function (err, user) {
        if (err) res.status(500).send(err);else if (user) {
            Bay.findOneAndUpdate({
                _id: req.params.bayId,
                'queue.user': {
                    $ne: req.body.userId
                }
            }, {
                $addToSet: {
                    queue: {
                        user: user._id
                    }
                }
            }, {
                new: true
            }, function (err, bay) {
                if (err) res.status(500).send(err);else if (bay) res.status(200).send(bay);else res.status(404).send("Bay does not exist or User is already in queue");
            });
        } else res.status(404).send('User not found');
    });
};
exports.dequeueUser = function (req, res) {
    Bay.findById(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) {
            var user = bay.queue.shift();
            if (user) {
                res.status(200).send(user);
                bay.queue.pull(user);
                bay.timeouts.user = Date.now() + 60000;
                bay.save();
                schedulerTasks['userTimeout'][bay.id] = scheduler.addToSchedule(Date.now() + 60000, function () {
                    console.log("User Timeout");
                });
            } else res.status(404).send('There are no users in the queue');
        } else res.status(404).send('No bay found with that ID');
    });
};
exports.deleteBay = function (req, res) {
    Bay.findByIdAndRemove(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);
        if (bay) {
            delete bay._id;
            res.status(200).send('Bay with id ' + bay._id + ' deleted');
        } else res.status(404).send("No Bay found with that ID");
    });
};
module.exports.clearQueue = function (req, res) {
    Bay.findById(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) {
            bay.queue = [];
            bay.save();
            res.status(200).send(bay);
        } else res.status(404).send("No Bay found with that ID");
    });
};
module.exports.socketHandler = function (socket) {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', function (data) {
        var bayId = data.bayId;
        sockets.sendToGame(bayId, 'startGame', {}, function (result) {
            console.log(result);
        });
    });
    //    socket.on('rfid', (data) => {
    //        console.log('rfid socket endpoint');
    //        var bayId = data.bayId;
    //        if (schedulerTasks[userTimeout][bayId] != null) {
    //            schedulerTasks[userTimeout][bayId].cancel();
    //            schedulerTasks[userTimeout][bayId] = null;
    //        }
    //    });
};