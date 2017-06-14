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
        game: req.body.game
    });
    newBay.save(function (err, doc) {
        if (err) res.status(500).send(err);
        res.status(200).send(doc);
    });
};
exports.enqueueUser = function (req, res) {
    Queue.findOne({
        user: req.body.userId
    }, function (err, queue) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (queue) {
            res.status(200).send(queue);
            return;
        } else {
            var queue = new Queue({
                user: req.body.userId,
                bay: req.params.bayId
            });
            queue.save(function (err, doc) {
                res.status(200).send(queue);
            });
        }
    });
};
exports.dequeueUser = function (req, res) {
    Queue.findOneAndRemove({
        bay: req.params.bayId
    }).sort({
        timeAdded: 1
    }).exec(function (err, queue) {
        console.log(queue);
        if (err) res.status(500).send(err);else if (queue) res.status(200).send(queue);else res.status(404).send("No queues found for this bay");
    });
};
exports.getQueue = function (req, res) {
    Queue.find({
        bay: req.params.bayId
    }, function (err, doc) {
        if (err) res.status(500).send(err);else if (doc) res.status(200).send(doc);else res.status(404).send("No Queues found");
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
    Queue.remove({
        bay: req.params.bayId
    }, function (err) {
        if (err) res.status(500).send(err);
        res.status(200).send([]);
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
                            Bay.findOne({
                                id: req.clientId
                            }, function (err, bay) {
                                var q = new Queue({
                                    user: user._id,
                                    bay: bay._id
                                });
                                q.save();
                                sockets.sendToQueue(req.clientId, 'refreshQueue', {}, function (res) {
                                    console.log(res);
                                });
                            });
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