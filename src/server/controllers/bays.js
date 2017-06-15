var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
var Queue = require('../models/queue').Queue;
var scheduler = require("../services/scheduler");
var sockets = require('../services/sockets');
var schedulerTasks = {
    userTimeout: {}
    , gameTimeout: {}
};
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
    Queue.findOne({
        user: req.body.userId
    }, (err, queue) => {
        if (err) {
            res.status(500).send(err)
            return;
        }
        else if (queue) {
            res.status(200).send(queue);
            return;
        }
        else {
            var queue = new Queue({
                user: req.body.userId
                , bay: req.params.bayId
            });
            queue.save((err, doc) => {
                res.status(200).send(queue);
            });
        }
    });
};
exports.dequeueUser = (req, res) => {
    Queue.findOneAndRemove({
        bay: req.params.bayId
    }).sort({
        timeAdded: 1
    }).exec((err, queue) => {
        console.log(queue);
        if (err) res.status(500).send(err);
        else if (queue) res.status(200).send(queue);
        else res.status(404).send("No queues found for this bay");
    });
};
exports.getQueue = (req, res) => {
    Bay.findOne({
        _id: req.params.bayId
    }, (err, bay) => {
        Queue.find({
            bay: bay._id
        }).populate('user bay').exec((err, doc) => {
            if (err) res.status(500).send(err);
            else if (doc) res.status(200).send(doc)
            else res.status(404).send("No Queues found");
        });
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
module.exports.socketHandler = (socket) => {
    /* Add Socket Handling Logic Here */
    socket.on('startButtonPressed', (data) => {
        var bayId = data.bayId;
        sockets.sendToGame(bayId, 'startGame', {}, (result) => {
            console.log(result);
        });
    });
    socket.on('rfid', (data) => {
        //enqueue user
        var req = JSON.parse(data);
        switch (req.clientType) {
        case 'game':
            User.findOne({
                'rfid.id': req.tag
            }, (err, user) => {
                if (err) console.log('[error] Cant enqueue user... ' + err);
                else if (user) {
                    if (user.rfid.expiresAt > new Date()) {
                        console.log('[info] adding user to queue');
                        Bay.findOne({
                            id: req.clientId
                        }, (err, bay) => {
                            var q = new Queue({
                                user: user._id
                                , bay: bay._id
                            });
                            q.save();
                            Queue.find({
                                bay: bay._id
                            }).populate('user bay').exec((err, queue) => {
                                sockets.sendToQueue(req.clientId, 'queue', queue, (res) => {});
                            });
                        });
                    }
                    else {
                        console.log('[info] User badge is expired')
                            /*TODO: send response*/
                    }
                }
                else console.log('[info] No user associated with tag' + data.tag);
            });
            break;
        }
    });
};