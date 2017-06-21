var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("node-schedule");
var sockets = require('../services/sockets');
//var timerconfig = require('../../shared/timerconfig');
import {
    timerparams
}
from '../../shared/timerconfig.js';
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
                    startReady(req.params.bayId, doc, req.app);
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
    console.log(data);
    return Bay.findByIdAndUpdate(bayId, {
        $set: {
            currentState: data
        }
    }, {
        new: true
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
        sockets.sendToButton(bayId, 'setState', bay.currentState);
        sockets.sendToQueue(bayId, 'setState', bay.currentState);
    });
}
exports.startIdle = startIdle;
var startOnboarding = (bayId, app, oldEndTime) => {
    console.log('Onboarding, waiting for user...');
    getUserOnDeck(bayId).then((user) => {
        if (!user) startIdle(bayId);
        else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + 1);
            if (app.locals.timers.onboarding[bayId] != null) {
                console.log('Canceling onboarding timer for bay ' + bayId);
                app.locals.timers.onboarding[bayId].cancel();
                app.locals.timers.onboarding[bayId] = null;
            }
            var data = {
                state: 'onboarding'
                , endTime: endTime
            }
            updateBayState(bayId, data).then((bay) => {
                sockets.sendToButton(bayId, 'setState', bay.currentState);
                sockets.sendToQueue(bayId, 'setState', bay.currentState);
                console.log('current time is ' + new Date());
                console.log('onboarding will end at... ' + bay.currentState.endTime);
                app.locals.timers.onboarding[bayId] = scheduler.scheduleJob(bay.currentState.endTime, () => {
                    console.log('Onboarding timeout, moving to next person...');
                    popUser(bayId).then((queue) => {
                        sendQueue(bayId);
                        startOnboarding(bayId, app);
                    });
                });
            });
        }
    })
};
exports.startOnboarding = startOnboarding;
exports.resumerOnboarding = (bayId, app) => {}
var sendQueue = (bayId) => {
    getQueue(bayId).then((queue) => {
        if (queue) sockets.sendToQueue(bayId, 'queue', queue);
        else sockets.sendToQueue(bayId, 'queue', []);
    });
};
var startReady = (bayId, user, app) => {
    popUser(bayId).then((queue) => {
        sendQueue(bayId);
        if (app.locals.timers.onboarding[bayId] != null) {
            app.locals.timers.onboarding[bayId].cancel();
        }
        console.log('Bay ' + bayId + ' is Ready');
        var data = {
            state: 'ready'
            , user: user
        }
        updateBayState(bayId, data).then((bay) => {
            sockets.sendToQueue(bayId, 'setState', bay.currentState);
            sockets.sendToButton(bayId, 'setState', bay.currentState);
        })
    });
}
var startGameplay = (bayId, app) => {
    console.log('start Gameplay on bay ' + bayId);
    getBay(bayId).then((bay) => {
        if (bay.currentState == 'gameplay') console.log('Already playing game on game ' + bayId);
        else {
            var endTime = new Date();
            endTime.setMinutes(endTime.getMinutes() + bay.playTime);
            if (app.locals.timers.onboarding[bayId] != null) {
                console.log('Deleting onboarding timer bay ' + bayId);
                app.locals.timers.onboarding[bayId].cancel();
                app.locals.timers.onboarding[bayId] = null;
            }
            var data = {
                state: 'gameplay'
                , endTime: endTime
            };
            console.log('Update bay state');
            updateBayState(bayId, data).then((bay) => {
                if (bay) {
                    console.log(bay);
                    console.log('current time is ' + new Date());
                    console.log('gameplay will end at... ' + bay.currentState.endTime);
                    app.locals.timers.gameplay[bayId] = scheduler.scheduleJob(bay.currentState.endTime, () => {
                        console.log('gameplay timer expired');
                        endGameplay(bayId, app);
                    });
                    sockets.sendToGame(bay.id, 'startGame', bay.currentState);
                    sockets.sendToButton(bayId, 'setState', bay.currentState);
                    sockets.sendToQueue(bayId, 'setState', bay.currentState);
                }
                else console.log('Cant find bay to start gameplay ' + bayId);
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
    Bay.findById(bayId, (err, bay) => {
        if (bay) sockets.sendToGame(bay.id, 'endGame', data);
    });
    updateBayState(bayId, data).then((bay) => {
        sockets.sendToButton(bayId, 'setState', bay.currentState);
        sockets.sendToQueue(bayId, 'setState', bay.currentState);
    });
    startOnboarding(bayId, app);
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
                                if (bay._id.equals(queue.bay._id)) res.error = "You are already in this queue";
                                else res.warning = "Would you like to join this queue? You'll lose your place in your other queue.";
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
                    }
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
                            startReady(bay._id, user, app);
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