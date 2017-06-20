var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("node-schedule");
var sockets = require('../services/sockets');
var timers = {
    onboarding: {}
    , gameplay: {}
}
var bayState = {}
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
exports.enqueueUser = (req, res) => {
    Queue.findOneAndRemove({
        user: req.body.userId
    }, (err, queue) => {
        if (err) {
            res.status(500).send(err)
            return;
        }
        else if (queue) {
            delete queue._id;
            sendQueue(queue.bay);
            console.log('deleted user from queue');
        }
        getBay(req.params.bayId).then((bay) => {
            console.log(bay.currentState);
            if (!bay.currentState || bay.currentState.state == 'idle') {
                User.findById(req.body.userId, (err, doc) => {
                    console.log('starting ready');
                    currentUser[req.params.bayId] = doc;
                    startReady(req.params.bayId, doc);
                });
                res.status(200).send([]);
            }
            else {
                var q = new Queue({
                    user: req.body.userId
                    , bay: req.params.bayId
                });
                q.save((err, doc) => {
                    Queue.find({
                        bay: req.params.bayId
                    }).populate('bay user').exec((err, fullQueue) => {
                        if (err) res.status(500).send(err);
                        else if (fullQueue) {
                            res.status(200).send(fullQueue);
                        }
                        else res.status(404).send(fullQueue);
                    });
                });
            }
        });
    });
};
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
        getBay(req.params.bayId).then((bay) => {
            if ((queue.length > 0) && !bay.currentState.state || bay.currentState.state == 'idle') startOnboarding(req.params.bayId);
        });
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
    }).exec();
};
var getBay = (bayId) => {
    return Bay.findById(bayId).exec();
}
var popUser = (bayId) => {
    return Queue.findOneAndRemove({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).exec();
}
exports.getState = (req, res) => {
    res.status(200).send(bayState);
}
async function asyncFun(req) {
    return req;
}
var getUserOnDeck = (bayId) => {
    return Queue.findOne({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user').exec();
}
var getQueue = (bayId) => {
    return Queue.find({
        bay: bayId
    }).sort({
        timeAdded: 1
    }).populate('user bay').exec();
}
var startIdle = (bayId) => {
    console.log('Going to Idle State')
    var data = {
        state: 'idle'
    };
    updateBayState(bayId, data).then((bay) => {
        sockets.sendToButton(bayId, 'setState', data);
        sockets.sendToQueue(bayId, 'setState', data);
    });
}
var startOnboarding = (bayId) => {
    console.log('Onboarding, waiting for user...');
    bayState[bayId] = 'Onboarding';
    getUserOnDeck(bayId).then((user) => {
        if (!user) startIdle(bayId);
        else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + 1);
            if (timers.onboarding.bayId != null) {
                timers.onboarding.bayId.cancel();
            }
            timers.onboarding.bayId = scheduler.scheduleJob(endTime, () => {
                console.log('Onboarding timeout, moving to next person...');
                popUser(bayId).then((queue) => {
                    sendQueue(bayId);
                    startOnboarding(bayId);
                });
            });
            var data = {
                state: 'onboarding'
                , endTime: endTime
            }
            updateBayState(bayId, data).then((bay) => {
                sockets.sendToButton(bayId, 'setState', data);
                sockets.sendToQueue(bayId, 'setState', data);
            });
        }
    })
};
var sendQueue = (bayId) => {
    getQueue(bayId).then((queue) => {
        if (queue) sockets.sendToQueue(bayId, 'queue', queue);
        else sockets.sendToQueue(bayId, 'queue', []);
    });
};
var startReady = (bayId, user) => {
    popUser(bayId).then((queue) => {
        sendQueue(bayId);
        bayState[bayId] = 'Ready';
        if (timers.onboarding.bayId != null) {
            timers.onboarding.bayId.cancel();
        }
        console.log('Bay ' + bayId + ' is Ready');
        var data = {
            state: 'ready'
            , user: user
        }
        updateBayState(bayId, data).then((bay) => {
            sockets.sendToQueue(bayId, 'setState', data);
            sockets.sendToButton(bayId, 'setState', data);
        })
    });
}
var startGameplay = (bayId) => {
    console.log('start Gameplay on bay ' + bayId);
    if (bayState[bayId] == 'Playing') console.log('Already playing game...');
    else {
        Bay.findById(bayId).then((bay) => {
            if (bay) sockets.sendToGame(bay.id, 'startGame', data);
            bayState[bayId] = 'Playing';
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + bay.playTime);
            if (timers.onboarding.bayId != null) {
                timers.onboarding.bayId.cancel();
                timers.onboarding.bayId = null;
            }
            timers.gameplay.bayId = scheduler.scheduleJob(endTime, () => {
                endGameplay(bayId);
            });
            var data = {
                state: 'gameplay'
                , endTime: endTime
            };
            updateBayState(bayId, data).then((bay) => {
                sockets.sendToButton(bayId, 'setState', data);
                sockets.sendToQueue(bayId, 'setState', data);
            })
        });
    }
};
var endGameplay = (bayId) => {
    if (timers.gameplay.bayId != null) {
        timers.gameplay.bayId.cancel();
        timers.gameplay.bayId = null;
    }
    console.log('Gameplay over!');
    var data = {
        state: 'onboarding'
    };
    Bay.findById(bayId, (err, bay) => {
        if (bay) sockets.sendToGame(bay.id, 'endGame', data);
    });
    updateBayState(bayId, data).then((bay) => {
        sockets.sendToButton(bayId, 'setState', data);
        sockets.sendToQueue(bayId, 'setState', data);
    });
    startOnboarding(bayId);
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
                    Queue.findOne({
                        user: user._id
                    }).populate('user bay').exec((err, queue) => {
                        if (err) {
                            res.err = err;
                            sockets.sendToQueue(bay._id, 'userattempt', res);
                        }
                        else if (queue) {
                            console.log(queue);
                            if(!queue.bay || !queue.user)
                                delete queue._id;
                            if (bay._id.equals(queue.bay._id)) res.error = "You are already in this queue";
                            else res.info = "Would you like to join this queue? You'll lose your place in your other queue.";
                            res.data = queue;
                            sockets.sendToQueue(bay._id, 'userattempt', res);
                        }
                        else {
                            res.info = "Would you like to join this queue?"
                            getQueue(bay._id).then((queue) => {
                                if (queue && bay.currentState.state != 'gameplay' && bay.currentState.state != 'ready') res.info = "There's no one in front of you. Would you like to play?"
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
                });
            }
            else {
                console.log('[info] User badge is expired')
                res.error = "badge expired";
                Bay.findOne({
                    id: bayId
                }, (err, bay) => {
                    if (bay) sockets.sendToQueue(bay._id, 'userattempt', res);
                });
            }
        }
        else {
            console.log('[info] No user associated with tag' + tag);
            res.error = "user not found";
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
        console.log('-------------------');
        console.log(user);
        console.log(currentUser[bayId]);
        console.log('-------------------');
        callback(user._id.equals(currentUser[bayId]._id))
    });
}
module.exports.socketHandler = (socket) => {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', (data) => {});
    socket.on('startButton', (req) => {
        var bayId = req.clientId;
        startGameplay(bayId);
    });
    socket.on('endButton', (req) => {
        var bayId = req.clientId;
        endGameplay(bayId);
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
                            startReady(bay._id, user);
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