'use strict';

var asyncFun = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', req);

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function asyncFun(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
        if (!bayState[req.params.bayId] || bayState[req.params.bayId] == 'Idle') {
            User.findById(req.body.userId, function (err, doc) {
                currentUser[req.params.bayId] = doc;
                startReady(req.params.bayId, doc);
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
        if (err) res.status(500).send(err);else if (queue) res.status(200).send(queue);else res.status(404).send("No queues found for this bay");
    });
};
exports.getQueue = function (req, res) {
    getQueue(req.params.bayId).then(function (queue) {
        if (queue.length > 0 && (!bayState[req.params.bayId] || bayState[req.params.bayId] == 'Idle')) startOnboarding(req.params.bayId);
        res.status(200).send(queue);
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
var updateBayState = function updateBayState(bayId, data) {
    return Bay.findByIdAndUpdate(bayId, {
        $set: {
            currentState: data
        }
    }).exec();
};
var getBay = function getBay(bayId) {
    return Bay.findById(bayId).exec();
};
var popUser = function popUser(bayId) {
    return Queue.findOneAndRemove({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).exec();
};
exports.getState = function (req, res) {
    res.status(200).send(bayState);
};

var getUserOnDeck = function getUserOnDeck(bayId) {
    return Queue.findOne({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user').exec();
};
var getQueue = function getQueue(bayId) {
    return Queue.find({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
};
var startIdle = function startIdle(bayId) {
    console.log('Going to Idle State');
    bayState[bayId] = "Idle";
    var data = {
        state: 'idle'
    };
    updateBayState(bayId, data).then(function (bay) {
        sockets.sendToButton(bayId, 'setState', data);
        sockets.sendToQueue(bayId, 'setState', data);
    });
};
var startOnboarding = function startOnboarding(bayId) {
    console.log('Onboarding, waiting for user...');
    bayState[bayId] = 'Onboarding';
    getUserOnDeck(bayId).then(function (user) {
        if (!user) startIdle(bayId);else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + 1);
            if (timers.onboarding.bayId != null) {
                timers.onboarding.bayId.cancel();
            }
            timers.onboarding.bayId = scheduler.scheduleJob(endTime, function () {
                console.log('Onboarding timeout, moving to next person...');
                popUser(bayId).then(function (queue) {
                    sendQueue(bayId);
                    startOnboarding(bayId);
                });
            });
            var data = {
                state: 'onboarding',
                endTime: endTime
            };
            updateBayState(bayId, data).then(function (bay) {
                sockets.sendToButton(bayId, 'setState', data);
                sockets.sendToQueue(bayId, 'setState', data);
            });
        }
    });
};
var sendQueue = function sendQueue(bayId) {
    getQueue(bayId).then(function (queue) {
        if (queue) sockets.sendToQueue(bayId, 'queue', queue);else sockets.sendToQueue(bayId, 'queue', []);
    });
};
var startReady = function startReady(bayId, user) {
    popUser(bayId).then(function (queue) {
        sendQueue(bayId);
        bayState[bayId] = 'Ready';
        if (timers.onboarding.bayId != null) {
            timers.onboarding.bayId.cancel();
        }
        console.log('Bay ' + bayId + ' is Ready');
        var data = {
            state: 'ready',
            user: user
        };
        updateBayState(bayId, data).then(function (bay) {
            sockets.sendToQueue(bayId, 'setState', data);
            sockets.sendToButton(bayId, 'setState', data);
        });
    });
};
var startGameplay = function startGameplay(bayId) {
    console.log('start Gameplay on bay ' + bayId);
    if (bayState[bayId] == 'Playing') console.log('Already playing game...');else {
        Bay.findById(bayId).then(function (bay) {
            if (bay) sockets.sendToGame(bay.id, 'startGame', data);
            bayState[bayId] = 'Playing';
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + bay.playTime);
            if (timers.onboarding.bayId != null) {
                timers.onboarding.bayId.cancel();
                timers.onboarding.bayId = null;
            }
            timers.gameplay.bayId = scheduler.scheduleJob(endTime, function () {
                endGameplay(bayId);
            });
            var data = {
                state: 'gameplay',
                endTime: endTime
            };
            updateBayState(bayId, data).then(function (bay) {
                sockets.sendToButton(bayId, 'setState', data);
                sockets.sendToQueue(bayId, 'setState', data);
            });
        });
    }
};
var endGameplay = function endGameplay(bayId) {
    if (timers.gameplay.bayId != null) {
        timers.gameplay.bayId.cancel();
        timers.gameplay.bayId = null;
    }
    console.log('Gameplay over!');
    var data = {
        state: 'onboarding'
    };
    Bay.findById(bayId, function (err, bay) {
        if (bay) sockets.sendToGame(bay.id, 'endGame', data);
    });
    updateBayState(bayId, data).then(function (bay) {
        sockets.sendToButton(bayId, 'setState', data);
        sockets.sendToQueue(bayId, 'setState', data);
    });
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
                            sockets.sendToQueue(bay._id, 'userattempt', res);
                        } else if (queue) {
                            if (bay._id.equals(queue.bay._id)) res.error = "You are already in this queue";
                            res.data = queue;
                            sockets.sendToQueue(bay._id, 'userattempt', res);
                        } else {
                            var q = new Queue({
                                user: user._id,
                                bay: bay._id
                            });
                            q.populate('user bay', function (err) {
                                res.data = q;
                                sockets.sendToQueue(bay._id, 'userattempt', res);
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
                    if (bay) sockets.sendToQueue(bay._id, 'userattempt', res);
                });
            }
        } else {
            console.log('[info] No user associated with tag' + tag);
            res.error = "user not found";
            Bay.findOne({
                id: bayId
            }, function (err, bay) {
                if (bay) sockets.sendToQueue(bay._id, 'userattempt', res);
            });
        }
    });
};
var isCurrentUser = function isCurrentUser(bayId, tag, callback) {
    User.findOne({
        'rfid.id': tag
    }, function (err, user) {
        console.log('-------------------');
        console.log(user);
        console.log(currentUser[bayId]);
        console.log('-------------------');
        callback(user._id.equals(currentUser[bayId]._id));
    });
};
module.exports.socketHandler = function (socket) {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', function (data) {});
    socket.on('startButton', function (req) {
        var bayId = req.clientId;
        startGameplay(bayId);
    });
    socket.on('endButton', function (req) {
        var bayId = req.clientId;
        endGameplay(bayId);
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
                    getUserOnDeck(bay._id).then(function (queue) {
                        var user = queue.user;
                        console.log(user);
                        console.log(req.tag);
                        if (user.rfid.id == req.tag) {
                            console.log('Is current USer');
                            startReady(bay._id, user);
                        } else addUserToQueue(req.clientId, req.tag);
                    });
                } else {
                    console.log('attempting to add user to queue');
                    addUserToQueue(req.clientId, req.tag);
                }
            }
        });
    });
};