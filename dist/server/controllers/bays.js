'use strict';

var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("node-schedule");
var sockets = require('../services/sockets');
var timers = {
    onboarding: {},
    gameplay: {}
};
var bayState = {};
var currentUser = {};
exports.getBays = function (req, res) {
    if (req.params.bayId) {
        Bay.findById(req.params.bayId, function (err, bay) {
            if (err) res.status(500).send(err);else if (bay) res.status(200).send(bay);else res.status(404).send("No Bay found with that ID");
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
    Queue.findOneAndRemove({
        user: req.body.userId
    }, function (err, queue) {
        if (err) {
            res.status(500).send(err);
            return;
        } else if (queue) {
            delete queue._id;
            console.log('deleted user from queue');
        }
        if (!bayState[req.params.bayId] || bayState[req.params.bayId] == 'idle') {
            User.findById(req.body.userId, function (err, doc) {
                currentUser[req.params.bayId] = doc;
                startReady(req.params.bayId);
            });
            res.status(200).send([]);
        } else {
            var q = new Queue({
                user: req.body.userId,
                bay: req.params.bayId
            });
            q.save(function (err, doc) {
                Queue.find({
                    bay: req.params.bayId
                }).populate('bay user').exec(function (err, fullQueue) {
                    if (err) res.status(500).send(err);else if (fullQueue) {
                        res.status(200).send(fullQueue);
                    } else res.status(404).send(fullQueue);
                });
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
    Bay.findOne({
        _id: req.params.bayId
    }, function (err, bay) {
        Queue.find({
            bay: bay._id
        }).populate('user bay').exec(function (err, doc) {
            if (err) res.status(500).send(err);else if (doc) res.status(200).send(doc);else res.status(404).send("No Queues found");
        });
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
var popUser = function popUser(bayId) {
    Queue.findOneAndRemove({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).exec(function (err, queue) {
        if (err) return {};else return queue;
    });
};
exports.getState = function (req, res) {
    res.status(200).send(bayState);
};
var userOnDeck = function userOnDeck(bayId, callback) {
    Queue.findOne({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).exec(function (err, queue) {
        if (err) callback(err);else callback(queue);
    });
};
var getQueue = function getQueue(bayId, callback) {
    Queue.find({
        bay: bayId
    }).populate('user bay').exec(function (err, doc) {
        if (err) callback(err);else callback(doc);
    });
};
var startIdle = function startIdle(bayId) {
    console.log('Going to Idle State');
    bayState[bayId] = "Idle";
    var data = {
        state: 'idle'
    };
    sockets.sendToButton(bayId, 'setState', data);
    sockets.sendToQueue(bayId, 'setState', data);
};
var startOnboarding = function startOnboarding(bayId) {
    console.log('Onboarding, waiting for user...');
    bayState[bayId] = 'Onboarding';
    getQueue(bayId, function (queue) {
        console.log(queue);
        if (!queue.length) startIdle(bayId);else {
            userOnDeck(bayId, function (user) {
                currentUser[bayId] = user;
                var endTime = new Date();
                endTime.setSeconds(endTime.getSeconds() + 10);
                if (timers.onboarding.bayId != null) {
                    timers.onboarding.bayId.cancel();
                }
                timers.onboarding.bayId = scheduler.scheduleJob(endTime, function () {
                    console.log('Onboarding timeout, moving to next person...');
                    popUser();
                    startOnboarding(bayId);
                });
                var data = {
                    state: 'onboarding',
                    data: {
                        timeout: endTime,
                        queue: queue
                    }
                };
                sockets.sendToButton(bayId, 'setState', data);
                sockets.sendToQueue(bayId, 'setState', data);
            });
        }
    });
};
var startReady = function startReady(bayId) {
    popUser();
    if (timers.onboarding.bayId != null) {
        timers.onboarding.bayId.cancel();
    }
    console.log('Bay ' + bayId + ' is Ready');
    var data = {
        state: 'ready'
    };
    sockets.sendToButton(bayId, 'setState', data, function (res) {
        console.log(res);
    });
};
var startGameplay = function startGameplay(bayId) {
    console.log('start Gameplay on bay ' + bayId);
    if (bayState[bayId] == 'Playing') console.log('Already playing game...');else {
        bayState[bayId] = 'Playing';
        var endTime = new Date();
        endTime.setSeconds(endTime.getSeconds() + 10);
        if (timers.onboarding.bayId != null) {
            timers.onboarding.bayId.cancel();
        }
        timers.gameplay.bayId = scheduler.scheduleJob(endTime, function () {
            endGameplay(bayId);
        });
        var data = {
            state: 'gameplay',
            endTime: endTime
        };
        sockets.sendToGame(bayId, 'endGame', data);
        sockets.sendToButton(bayId, 'setState', data);
        sockets.sendToQueue(bayId, 'setState', data);
    }
};
var endGameplay = function endGameplay(bayId) {
    console.log('Gameplay over!');
    var data = {
        state: 'onboarding'
    };
    sockets.sendToGame(bayId, 'endGame', data);
    sockets.sendToButton(bayId, 'setState', data);
    sockets.sendToQueue(bayId, 'setState', data);
    startOnboarding(bayId);
};
var addUserToQueue = function addUserToQueue(bayId, tag) {
    var res = {};
    User.findOne({
        'rfid.id': tag
    }, function (err, user) {
        if (err) console.log('[error] Cant enqueue user... ' + err);else if (user) {
            if (user.rfid.expiresAt > new Date()) {
                Bay.findOne({
                    id: bayId
                }, function (err, bay) {
                    Queue.findOne({
                        user: user._id
                    }).populate('user bay').exec(function (err, queue) {
                        if (err) {
                            res.err = err;
                            sockets.sendToQueue(bay._id, 'userattempt', res, function (res) {
                                //console.log(res);
                            });
                        } else if (queue) {
                            res.data = queue;
                            sockets.sendToQueue(bay._id, 'userattempt', res, function (res) {
                                //console.log(res);
                            });
                        } else {
                            var q = new Queue({
                                user: user._id,
                                bay: bay._id
                            });
                            q.populate('user bay', function (err) {
                                console.log(q);
                                res.data = q;
                                sockets.sendToQueue(bay._id, 'userattempt', res, function (res) {
                                    console.log(res);
                                });
                            });
                        }
                    });
                });
            } else {
                console.log('[info] User badge is expired');
                res.error = "badge expired";
                Bay.findOne({
                    id: bayId
                }, function (err, bay) {
                    if (bay) sockets.sendToQueue(bay._id, 'userattempt', res, function (res) {
                        console.log(res);
                    });
                });
            }
        } else {
            console.log('[info] No user associated with tag' + tag);
            res.error = "user not found";
            Bay.findOne({
                id: bayId
            }, function (err, bay) {
                if (bay) sockets.sendToQueue(bay._id, 'userattempt', res, function (res) {
                    console.log(res);
                });
            });
        }
    });
};
var isCurrentUser = function isCurrentUser(bayId, tag) {
    User.findOne({
        'rfid.id': tag
    }, function (err, user) {
        return user == currentUser[bayId];
    });
};
module.exports.socketHandler = function (socket) {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', function (data) {});
    socket.on('startButton', function (req) {
        var bayId = req.clientId;
        startGameplay(bayId);
    });
    socket.on('rfid', function (data) {
        var req = JSON.parse(data
        //enqueue user
        );var res = {};
        Bay.findOne({
            id: req.clientId
        }, {}, function (err, bay) {
            console.log(req.tag + 'tapped in');
            if (req.clientType == 'game') {
                console.log('Bay ' + bay._id + 'in state: ' + bayState[bay._id]);
                if (bayState[bay._id] == 'Onboarding') {
                    console.log('Check if correct user');
                    if (isCurrentUser(bay._id, req.tag)) startReady(bay._id);else addUserToQueue(req.clientId, req.tag);
                } else {
                    console.log('attempting to add user to queue');
                    addUserToQueue(req.clientId, req.tag);
                }
            }
        });
    });
};