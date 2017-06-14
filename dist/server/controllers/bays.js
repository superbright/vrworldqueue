'use strict';

var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
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
        game: req.body.game,
        queue: new Queue()
    });
    newBay.queue.save();
    newBay.save(function (err, doc) {
        if (err) res.status(500).send(err);
        res.status(200).send(doc);
    });
};
exports.enqueueUser = function (req, res) {
    User.findById(req.body.userId, function (err, user) {
        if (err) res.status(500).send(err);else if (user) {
            if (user.queue != null) {
                console.log("user already in queue");
                console.log(user.queue);
                res.status(404).send('User already in queue');
            } else Bay.findById({
                _id: req.params.bayId
            }, function (err, bay) {
                if (err) res.status(500).send(err);else if (bay) {
                    Queue.findById(bay.queue, function (err, queue) {
                        if (err) res.status(500).send(err);else if (queue) {
                            user.queue = bay.queue;
                            queue.users.push({
                                user: user._id
                            });
                            user.save();
                            queue.save();
                            //                            queue.save((err, doc) => {
                            //                                if (err) res.status(500).send(err);
                            //                                else res.status(200).send(doc);
                            //                            });
                            res.status(200).send(queue);
                        } else res.status(404).send('queue not found');
                    });
                } else res.status(404).send("Bay not found");
            });
        } else res.status(404).send("User not found");
    });
};
exports.dequeueUser = function (req, res) {
    Bay.findById(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) {
            Queue.findById(bay.queue, function (err, queue) {
                if (err) res.status(500).send(err);else if (queue) {
                    var user = queue.users.shift();
                    if (user) {
                        user.queue = null;
                        user.save;
                        res.status(200).send(user);
                        queue.users.pull(user);
                        bay.timeouts.user = Date.now() + 60000;
                        queue.save();
                        //                        schedulerTasks['userTimeout'][bay.id] = scheduler.addToSchedule(Date.now() + 60000, () => {
                        //                            console.log("User Timeout");
                        //                        });
                    } else res.status(404).send('There are no users in the queue');
                } else res.status(404).send('Queue not found');
            });
        } else res.status(404).send('No bay found with that ID');
    });
};
exports.getQueue = function (req, res) {
    Bay.findById(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) Queue.findById(bay.queue, function (err, queue) {
            if (err) res.status(500).send(err);else if (queue) res.status(200).send(queue);else res.staus(404).send("queue not found");
        });else res.status(404).send("Bay not found");
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
            Queue.findById(bay.queue, function (err, queue) {
                if (err) res.status(500).send(err);else if (queue) {
                    queue.users = [];
                    queue.save();
                    res.status(200).send(queue);
                } else res.status(404).send("Queue not found");
            });
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
    socket.on('rfid', function (data) {
        //enqueue user
        var req = JSON.parse(data);
        switch (req.clientType) {
            case 'game':
                User.findOne({
                    'rfid.id': req.tag
                }, function (err, user) {
                    if (err) console.log('[error] Cant enqueue user... ' + err);else if (user) {
                        if (user.rfid.expiresAt > new Date()) {
                            console.log('[info] adding user to queue');
                        } else {
                            console.log('[info] User badge is expired'
                            /*TODO: send response*/
                            );
                        }
                    } else console.log('[info] No user associated with tag' + data.tag);
                });
                break;
        }
    });
};