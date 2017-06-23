var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("node-schedule");
var sockets = require('../services/sockets');
var twilioService = require("../services/twilio");
import {
    timerparams
}
from '../../shared/timerconfig.js';
import {
    messages
}
from '../../shared/messages.js'
console.log(messages);
//move these to app.locals
var currentUser = {}
exports.getBays = (req, res) => {
    if (req.params.bayId) {
        Bay.findById(req.params.bayId, (err, bay) => {
            if (err) res.status(500).send(err);
            else if (bay) res.status(200).send(bay);
            else res.status(404).send("No Bay found with that ID");
        });
    }
    else Bay.find({}, (err, bays) => {
        if (err) res.status(500).send(err);

        else res.status(200).send(bays);
    });
};
exports.getBayByLocalId = (req, res) => {
    Bay.findOne({
        id: req.params.bayId
    }, (err, bay) => {
        if (err) res.status(500).send(err);
        else if (bay) res.status(200).send(bay);
        else res.status(404).send("No Bay found with that ID");
    });
};
exports.upsertBay = (req, res) => {
    var newBay = new Bay({
        id: req.body.id
        , name: req.body.name
        , game: req.body.game
    });
    newBay.save((err, doc) => {
        if (err) res.status(500).send(err);
        res.status(200).send(doc);
    });
};
var removeUserFromQueue = (user) => {
    return Queue.findOneAndRemove({
        user: user
    }).exec();
}
var sendStateToClients = (bayId) => {
    return getBay(bayId).then((bay) => {
        sockets.sendToButton(bay._id, 'setState', bay.currentState);
        sockets.sendToQueue(bay._id, 'setState', bay.currentState);
        sockets.sendToBigQueue(bay.id, 'setState', bay.currentState);
    });
}
var checkState = (bayId, app) => {
    return getQueue(bayId).then((queue) => {
        if (!queue.length) {
            console.log('No one left in queue ' + bayId);
            return getBay(bayId).then((bay) => {
                if (bay.currentState.state == 'onboarding') {
                    console.log('was in onboarding, going to idle...');
                    return startIdle(bayId, app);
                };
            });
        }
        else {
            console.log('Still people in queue. Restarting Onboarding...');
            return startOnboarding(bayId, app);
        }
    });
}
exports.enqueueUser = (req, res) => {
    removeUserFromQueue(req.body.userId).then((removedQueue) => {
        if (removedQueue) {
            console.log('deleted user from queue');
            return checkState(removedQueue.bay, req.app).then(() => {
                console.log('sending queue');
                return sendQueue(removedQueue.bay);
            });
        }
    }).then(() => {
        getBay(req.params.bayId).then((bay) => {
            if (!bay.currentState || bay.currentState.state == 'idle') {
                User.findById(req.body.userId, (err, doc) => {
                    if (doc) {
                        console.log('starting ready');
                        currentUser[bay._id] = doc;
                        startReady(bay._id, doc, req.app);
                    }
                    else console.log('-----User not found');
                });
                res.status(200).send([]);
            }
            else if (bay.currentState.state == 'onboarding') {
                var q = new Queue({
                    user: req.body.userId
                    , bay: bay._id
                });
                q.save().then((doc) => {
                    getQueue(doc.bay).then((fullqueue) => {
                        if (fullqueue) res.status(200).send(fullqueue);
                    });
                });
            }
            else {
                var q = new Queue({
                    user: req.body.userId
                    , bay: bay._id
                });
                q.save().then((doc) => {
                    Queue.find({
                        bay: bay._id
                    }).populate('bay user').exec((err, fullQueue) => {
                        sendQueue(bay._id);
                        if (err) res.status(500).send(err);
                        else if (fullQueue) {
                            res.status(200).send(fullQueue);
                        }
                        else res.status(404).send(fullQueue);
                    });
                }).catch((err) => {
                    console.log(err);
                    res.status(500).send(err);
                });
            }
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).send(err);
    });
}
exports.dequeueUser = (req, res) => {
    Queue.findOneAndRemove({
        bay: req.params.bayId
    }).sort({
        timeAdded: 1
    }).exec((err, queue) => {
        if (err) res.status(500).send(err);
        else if (queue) res.status(200).send(queue);
        else res.status(404).send("No queues found for this bay");
    });
};
exports.getQueue = (req, res) => {
    getQueue(req.params.bayId).then((queue) => {
        res.status(200).send(queue);
    });
};
exports.deleteBay = (req, res) => {
    Bay.findByIdAndRemove(req.params.bayId, (err, bay) => {
        if (err) res.status(500).send(err);
        if (bay) {
            delete bay._id;
            res.status(200).send('Bay with id ' + bay._id + ' deleted');
        }
        else res.status(404).send("No Bay found with that ID");
    });
};
module.exports.clearQueue = (req, res) => {
    Queue.remove({
        bay: req.params.bayId
    }, (err) => {
        if (err) res.status(500).send(err);
        res.status(200).send([]);
    });
}
var updateBayState = (bayId, data) => {
    return Bay.findByIdAndUpdate(bayId, {
        $set: {
            currentState: data
        }
    }, {
        new: true
    }).exec();
};
var getBay = (bayId) => {
    return Bay.findById(bayId).populate('currentState.user').exec();
}
var popUser = (bayId) => {
    console.log('-----------Pop User--------');
    return Queue.findOneAndRemove({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
}
var getUserOnDeck = (bayId) => {
    return Queue.findOne({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
}
var getQueue = (bayId) => {
    return Queue.find({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
}
var cancelOnboardingTimer = (bayId, app) => {
    if (app.locals.timers.onboarding[bayId] != null) {
        app.locals.timers.onboarding[bayId].cancel();
        app.locals.timers.onboarding[bayId] = null;
    }
}
var cancelGameplayTimer = (bayId, app) => {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
    }
}
var startIdle = (bayId, app) => {
    console.log('Going to Idle State')
    return updateBayState(bayId, {
        state: 'idle'
    }).then((bay) => {
        cancelGameplayTimer(bay._id, app);
        cancelOnboardingTimer(bay._id, app);
        return sendStateToClients(bay._id);
    });
}
exports.startIdle = startIdle;
var startOnboarding = (bayId, app) => {
    console.log('Onboarding, waiting for user...');
    return getUserOnDeck(bayId).then((user) => {
        if (!user) return startIdle(bayId, app);
        else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + 1);
            cancelOnboardingTimer(bayId, app)
            return updateBayState(bayId, {
                state: 'onboarding'
                , endTime: endTime
            }).then((bay) => {
                //                console.log(bay.currentState)
                //                sockets.sendToButton(bay._id, 'setState', bay.currentState);
                //                sockets.sendToQueue(bay._id, 'setState', bay.currentState);
                sendStateToClients(bay._id);
                console.log('current time is ' + new Date());
                console.log('onboarding will end at... ' + bay.currentState.endTime);
                app.locals.timers.onboarding[bay._id] = scheduler.scheduleJob(bay.currentState.endTime, () => {
                    console.log('Onboarding timeout, moving to next person...');
                    popUser(bay._id).then((queue) => {
                        sendQueue(bay._id);
                        return startOnboarding(bay._id, app);
                    });
                });
                notifyUserOnDeck(bay._id);
            });
        }
    }).catch((err) => {
        console.log(err);
    });
};
exports.startOnboarding = startOnboarding;
exports.resumeOnboarding = (bayId, app) => {}
var sendQueue = (bayId) => {
    return getBay(bayId).then((bay) => {
        return getQueue(bayId).then((queue) => {
            if (queue) {
                sockets.sendToButton(bay._id, 'queue', queue);
                sockets.sendToQueue(bay._id, 'queue', queue);
                sockets.sendToBigQueue(bay.id, 'queue', queue);
            }
            else {
                sockets.sendToButton(bay._id, 'queue', []);
                sockets.sendToQueue(bayId, 'queue', []);
                sockets.sendToBigQueue(bay.id, 'queue', []);
            }
        });
    })
};
var startReady = (bayId, user, app) => {
    console.log('-------Start Ready-------');
    popUser(bayId).then((queue) => {
        if (app.locals.timers.onboarding[bayId] != null) {
            app.locals.timers.onboarding[bayId].cancel();
        }
        return updateBayState(bayId, {
            state: 'ready'
            , user: user
        }).then((bay) => {
            return sendStateToClients(bay._id).then(() => {
                return sendQueue(bay._id);
            })
        })
    });
}
var notifyUserOnDeck = (bayId) => {
    console.log('--------notify user on deck-------');
    return getBay(bayId).then((bay) => {
        return getQueue(bayId).then((queue) => {
            if (queue.length > 1) {
                console.log('--------sending twilio-------');
                console.log(queue[1].user.phone);
                twilioService.sendMessage({
                    phone: queue[1].user.phone
                    , message: "You're up next for " + bay.game + " at bay " + bay.name + "!"
                });
            }
            else console.log("No one else in queue to notify");
        });
    });
};
var startGameplay = (bayId, app) => {
    return getBay(bayId).then((bay) => {
        console.log('start Gameplay on bay ' + bay._id);
        if (bay.currentState.state == 'gameplay') console.log('Already playing game on game ' + bay._id);
        else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + bay.playTime);
            if (app.locals.timers.onboarding[bay._id] != null) {
                console.log('Deleting onboarding timer bay ' + bay._id);
                app.locals.timers.onboarding[bay._id].cancel();
                app.locals.timers.onboarding[bay._id] = null;
            }
            var data = {
                state: 'gameplay'
                , endTime: endTime
            };
            console.log('Update bay state');
            return updateBayState(bay._id, data).then((bay) => {
                if (bay) {
                    console.log('current time is ' + new Date());
                    console.log('gameplay will end at... ' + bay.currentState.endTime);
                    app.locals.timers.gameplay[bay._id] = scheduler.scheduleJob(bay.currentState.endTime, () => {
                        console.log('gameplay timer expired');
                        return endGameplay(bay._id, app).then(() => {
                            return sendStateToClients(bay._id).then(() => {});
                        })
                    });
                    return sendStateToClients(bay._id, app).then(() => {
                        sockets.sendToGame(bay.id, 'startGame', bay.currentState);
                    });
                }
                else console.log('Cant find bay to start gameplay ' + bay._id);
            });
        }
    });
};
var endGameplay = (bayId, app) => {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
        console.log('canceling gameplay timer in endgameplay');
    }
    console.log('Gameplay over!');
    var data = {
        state: 'onboarding'
    };
    updateBayState(bayId, data).then((bay) => {
        if (bay) sockets.sendToGame(bay.id, 'endGame', bay.currentState);
        startOnboarding(bay._id, app);
    });
};
var endGameplay = (bayId, app) => {
    if (app.locals.timers.gameplay[bayId] != null) {
        app.locals.timers.gameplay[bayId].cancel();
        app.locals.timers.gameplay[bayId] = null;
        console.log('canceling gameplay timer in endgameplay');
    }
    console.log('Gameplay over!');
    return updateBayState(bayId, {
        state: 'onboarding'
    }).then((bay) => {
        if (bay) sockets.sendToGame(bay.id, 'endGame', bay.currentState);
        return startOnboarding(bay._id, app);
    });
};
var addUserToQueue = (bayId, tag) => {
    var res = {}
    User.findOne({
        'rfid.id': tag
    }, (err, user) => {
        if (err) console.log('[error] Cant enqueue user... ' + err);
        else if (user) {
            if (user.rfid.expiresAt > new Date()) {
                Bay.findOne({
                    id: bayId
                }, (err, bay) => {
                    if (err) sockets.sendToQueue(bay._id, 'userattempt', res);
                    else if (bay) {
                        if (bay.currentState.state == 'ready' && bay.currentState.user.equals(user._id)) {
                            sendStateToClients(bay._id);
                        }
                        else {
                            Queue.findOne({
                                user: user._id
                            }).populate('user bay').exec((err, queue) => {
                                if (err) {
                                    res.err = err;
                                    sockets.sendToQueue(bay._id, 'userattempt', res);
                                }
                                else if (queue) {
                                    if (!queue.bay || !queue.user) delete queue._id;
                                    else
                                    if (bay._id.equals(queue.bay._id)) res.error = messages.alreadyinqueue;
                                    else res.warning = messages.loseyourplace;
                                    res.data = queue;
                                    sockets.sendToQueue(bay._id, 'userattempt', res);
                                }
                                else {
                                    res.info = messages.wouldyouliketojoin;
                                    getQueue(bay._id).then((queue) => {
                                        if (queue && bay.currentState.state != 'gameplay' && bay.currentState.state != 'ready') res.info = messages.wouldyouliketoplay;
                                    })
                                    var q = new Queue({
                                        user: user._id
                                        , bay: bay._id
                                    });
                                    q.populate('user bay', (err) => {
                                        res.data = q;
                                        sockets.sendToQueue(bay._id, 'userattempt', res);
                                    });
                                }
                            });
                        }
                    }
                });
            }
            else {
                console.log('[info] User badge is expired')
                res.error = messages.badgeexpired;
                Bay.findOne({
                    id: bayId
                }, (err, bay) => {
                    if (bay) sockets.sendToQueue(bay._id, 'userattempt', res);
                });
            }
        }
        else {
            console.log('[info] No user associated with tag' + tag);
            res.error = messages.usernotfound;
            Bay.findOne({
                id: bayId
            }, (err, bay) => {
                if (bay) sockets.sendToQueue(bay._id, 'userattempt', res);
            });
        }
    });
};
var isCurrentUser = (bayId, tag, callback) => {
    User.findOne({
        'rfid.id': tag
    }, (err, user) => {
        callback(user._id.equals(currentUser[bayId]._id))
    });
}
module.exports.socketHandler = (socket, app) => {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', (data) => {});
    socket.on('startButton', (req) => {
        var bayId = req.clientId;
        startGameplay(bayId, app);
    });
    socket.on('endButton', (req) => {
        var bayId = req.clientId;
        endGameplay(bayId, app);
    });
    socket.on('rfid', (data) => {
        var req = JSON.parse(data)
            //enqueue user
        var res = {}
        Bay.findOne({
            id: req.clientId
        }, {}, (err, bay) => {
            console.log(req.tag + 'tapped in');
            if (req.clientType == 'game') {
                console.log('Bay ' + bay._id + 'in state: ' + bay.currentState.state);
                if (bay.currentState.state == 'onboarding') {
                    console.log('Check if correct user');
                    getUserOnDeck(bay._id).then((queue) => {
                        var user = queue.user;
                        if (user.rfid.id == req.tag) {
                            console.log('Is current User');
                            startReady(bay._id, queue.user, app);
                        }
                        else addUserToQueue(req.clientId, req.tag);
                    });
                }
                else {
                    console.log('attempting to add user to queue');
                    addUserToQueue(req.clientId, req.tag);
                }
            }
        });
    });
};
