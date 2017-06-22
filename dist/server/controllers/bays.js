'use strict';

var _timerconfig = require('../../shared/timerconfig.js');

var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("node-schedule");
var sockets = require('../services/sockets');
var twilioService = require("../services/twilio");
//var timerconfig = require('../../shared/timerconfig');

//move these to app.locals
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
exports.getBayByLocalId = function (req, res) {
    Bay.findOne({
        id: req.params.bayId
    }, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) res.status(200).send(bay);else res.status(404).send("No Bay found with that ID");
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
var removeUserFromQueue = function removeUserFromQueue(user) {
    return Queue.findOneAndRemove({
        user: user
    }).exec();
};
var sendStateToClients = function sendStateToClients(bayId) {
    return getBay(bayId).then(function (bay) {
        sockets.sendToButton(bay._id, 'setState', bay.currentState);
        sockets.sendToQueue(bay._id, 'setState', bay.currentState);
        sockets.sendToBigQueue(bay._id, 'setState', bay.currentState);
    });
};
var checkState = function checkState(bayId, app) {
    return getQueue(bayId).then(function (queue) {
        if (!queue.length) {
            console.log('No one left in queue ' + bayId);
            return getBay(bayId).then(function (bay) {
                if (bay.currentState.state == 'onboarding') {
                    console.log('was in onboarding, going to idle...');
                    return startIdle(bayId, app);
                };
            });
        } else {
            console.log('Still people in queue. Restarting Onboarding...');
            return startOnboarding(bayId, app);
        }
    });
};
exports.enqueueUser = function (req, res) {
    removeUserFromQueue(req.body.userId).then(function (removedQueue) {
        console.log('----removing user----');
        if (removedQueue) {
            console.log('deleted user from queue');
            return checkState(removedQueue.bay, req.app).then(function () {
                console.log('sending queue');
                return sendQueue(removedQueue.bay);
            });
        }
    }).then(function () {
        console.log('-----then-----');
        getBay(req.params.bayId).then(function (bay) {
            if (!bay.currentState || bay.currentState.state == 'idle') {
                User.findById(req.body.userId, function (err, doc) {
                    if (doc) {
                        console.log('starting ready');
                        currentUser[bay._id] = doc;
                        startReady(bay._id, doc, req.app);
                    } else console.log('-----User not found');
                });
                res.status(200).send([]);
            } else if (bay.currentState.state == 'onboarding') {
                var q = new Queue({
                    user: req.body.userId,
                    bay: bay._id
                });
                q.save().then(function (doc) {
                    getQueue(doc.bay).then(function (fullqueue) {
                        if (fullqueue) res.status(200).send(fullqueue);
                    });
                });
            } else {
                var q = new Queue({
                    user: req.body.userId,
                    bay: bay._id
                });
                q.save().then(function (doc) {
                    Queue.find({
                        bay: bay._id
                    }).populate('bay user').exec(function (err, fullQueue) {
                        sendQueue(bay._id);
                        if (err) res.status(500).send(err);else if (fullQueue) {
                            res.status(200).send(fullQueue);
                        } else res.status(404).send(fullQueue);
                    });
                }).catch(function (err) {
                    console.log(err);
                    res.status(500).send(err);
                });
            }
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
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
    }, {
        new: true
    }).exec();
};
var getBay = function getBay(bayId) {
    return Bay.findById(bayId).populate('currentState.user').exec();
};
var popUser = function popUser(bayId) {
    console.log('-----------Pop User--------');
    return Queue.findOneAndRemove({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
};
var getUserOnDeck = function getUserOnDeck(bayId) {
    return Queue.findOne({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
};
var getQueue = function getQueue(bayId) {
    return Queue.find({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
};
var cancelOnboardingTimer = function cancelOnboardingTimer(bayId, app) {
    if (app.locals.timers.onboarding[bayId] != null) {
        app.locals.timers.onboarding[bayId].cancel();
        app.locals.timers.onboarding[bayId] = null;
    }
};
var cancelGameplayTimer = function cancelGameplayTimer(bayId, app) {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
    }
};
var startIdle = function startIdle(bayId, app) {
    console.log('Going to Idle State');
    return updateBayState(bayId, {
        state: 'idle'
    }).then(function (bay) {
        cancelGameplayTimer(bay._id, app);
        cancelOnboardingTimer(bay._id, app);
        return sendStateToClients(bay._id);
    });
};
exports.startIdle = startIdle;
var startOnboarding = function startOnboarding(bayId, app) {
    console.log('Onboarding, waiting for user...');
    return getUserOnDeck(bayId).then(function (user) {
        if (!user) return startIdle(bayId, app);else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + 1);
            cancelOnboardingTimer(bayId, app);
            return updateBayState(bayId, {
                state: 'onboarding',
                endTime: endTime
            }).then(function (bay) {
                twilioService.sendMessage({
                    phone: user.user.phone,
                    message: "You're up next for " + bay.game + " at bay " + bay.name + "!"
                });
                console.log(bay.currentState);
                sockets.sendToButton(bay._id, 'setState', bay.currentState);
                sockets.sendToQueue(bay._id, 'setState', bay.currentState);
                console.log('current time is ' + new Date());
                console.log('onboarding will end at... ' + bay.currentState.endTime);
                app.locals.timers.onboarding[bay._id] = scheduler.scheduleJob(bay.currentState.endTime, function () {
                    console.log('Onboarding timeout, moving to next person...');
                    popUser(bay._id).then(function (queue) {
                        sendQueue(bay._id);
                        startOnboarding(bay._id, app);
                    });
                });
            });
        }
    }).catch(function (err) {
        console.log(err);
    });
};
exports.startOnboarding = startOnboarding;
exports.resumeOnboarding = function (bayId, app) {};
var sendQueue = function sendQueue(bayId) {
    return getBay(bayId).then(function (bay) {
        return getQueue(bayId).then(function (queue) {
            if (queue) {
                sockets.sendToButton(bay._id, 'queue', queue);
                sockets.sendToQueue(bay._id, 'queue', queue);
                sockets.sendToBigQueue(bay.id, 'queue', queue);
            } else {
                sockets.sendToButton(bay._id, 'queue', []);
                sockets.sendToQueue(bayId, 'queue', []);
                sockets.sendToBigQueue(bay.id, 'queue', []);
            }
        });
    });
};
var startReady = function startReady(bayId, user, app) {
    console.log('-------Start Ready-------');
    popUser(bayId).then(function (queue) {
        //        sendQueue(bayId);
        if (app.locals.timers.onboarding[bayId] != null) {
            app.locals.timers.onboarding[bayId].cancel();
        }
        console.log('Bay ' + bayId + ' is Ready for ' + user);
        return updateBayState(bayId, {
            state: 'ready',
            user: user
        }).then(function (bay) {
            return sendStateToClients(bay._id).then(function () {
                return sendQueue(bay._id);
            });
        });
    });
};
var startGameplay = function startGameplay(bayId, app) {
    return getBay(bayId).then(function (bay) {
        console.log('start Gameplay on bay ' + bay._id);
        if (bay.currentState.state == 'gameplay') console.log('Already playing game on game ' + bay._id);else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + bay.playTime);
            if (app.locals.timers.onboarding[bay._id] != null) {
                console.log('Deleting onboarding timer bay ' + bay._id);
                app.locals.timers.onboarding[bay._id].cancel();
                app.locals.timers.onboarding[bay._id] = null;
            }
            var data = {
                state: 'gameplay',
                endTime: endTime
            };
            console.log('Update bay state');
            return updateBayState(bay._id, data).then(function (bay) {
                if (bay) {
                    console.log('current time is ' + new Date());
                    console.log('gameplay will end at... ' + bay.currentState.endTime);
                    app.locals.timers.gameplay[bay._id] = scheduler.scheduleJob(bay.currentState.endTime, function () {
                        console.log('gameplay timer expired');
                        return endGameplay(bay._id, app).then(function () {
                            return sendStateToClients(bay._id);
                        });
                    });
                    sockets.sendToGame(bay.id, 'startGame', bay.currentState);
                    sockets.sendToButton(bay._id, 'setState', bay.currentState);
                    sockets.sendToQueue(bay._id, 'setState', bay.currentState);
                } else console.log('Cant find bay to start gameplay ' + bay._id);
            });
        }
    });
};
var endGameplay = function endGameplay(bayId, app) {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
        console.log('canceling gameplay timer in endgameplay');
    }
    console.log('Gameplay over!');
    var data = {
        state: 'onboarding'
    };
    updateBayState(bayId, data).then(function (bay) {
        if (bay) sockets.sendToGame(bay.id, 'endGame', bay.currentState);
        //        sockets.sendToButton(bay._id, 'setState', bay.currentState);
        //        sockets.sendToQueue(bay._id, 'setState', bay.currentState);
        startOnboarding(bay._id, app);
    });
};
var endGameplay = function endGameplay(bayId, app) {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
        console.log('canceling gameplay timer in endgameplay');
    }
    console.log('Gameplay over!');
    return updateBayState(bayId, {
        state: 'onboarding'
    }).then(function (bay) {
        if (bay) sockets.sendToGame(bay.id, 'endGame', bay.currentState);
        //        sockets.sendToButton(bay._id, 'setState', bay.currentState);
        //        sockets.sendToQueue(bay._id, 'setState', bay.currentState);
        return startOnboarding(bay._id, app);
    });
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
                    if (err) sockets.sendToQueue(bay._id, 'userattempt', res);else if (bay) {
                        Queue.findOne({
                            user: user._id
                        }).populate('user bay').exec(function (err, queue) {
                            if (err) {
                                res.err = err;
                                sockets.sendToQueue(bay._id, 'userattempt', res);
                            } else if (queue) {
                                if (!queue.bay || !queue.user) delete queue._id;else if (bay._id.equals(queue.bay._id)) res.error = "You are already in this queue";else res.warning = "Would you like to join this queue? You'll lose your place in your other queue.";
                                res.data = queue;
                                sockets.sendToQueue(bay._id, 'userattempt', res);
                            } else {
                                res.info = "Would you like to join this queue?";
                                getQueue(bay._id).then(function (queue) {
                                    if (queue && bay.currentState.state != 'gameplay' && bay.currentState.state != 'ready') res.info = "There's no one in front of you. Would you like to play?";
                                });
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
                    }
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
        callback(user._id.equals(currentUser[bayId]._id));
    });
};
module.exports.socketHandler = function (socket, app) {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', function (data) {});
    socket.on('startButton', function (req) {
        var bayId = req.clientId;
        startGameplay(bayId, app);
    });
    socket.on('endButton', function (req) {
        var bayId = req.clientId;
        endGameplay(bayId, app);
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
                console.log('Bay ' + bay._id + 'in state: ' + bay.currentState.state);
                if (bay.currentState.state == 'onboarding') {
                    console.log('Check if correct user');
                    getUserOnDeck(bay._id).then(function (queue) {
                        var user = queue.user;
                        if (user.rfid.id == req.tag) {
                            console.log('Is current User');
                            startReady(bay._id, queue.user, app);
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