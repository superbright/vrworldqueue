'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var Bay = require('../models/bay').Bay;
var User = require('../models/user').User;
router.get('/:bayId?', function (req, res) {
    if (req.params.bayId) {
        Bay.findById(req.params.bayId, function (err, bay) {
            if (err) res.status(500).send(err);
            if (bay) res.status(200).send(bay);else res.status(404).send("No Bay found with that ID");
        });
    } else Bay.find({}, function (err, bays) {
        if (err) res.status(500).send(err);else res.status(200).send(bays);
    });
});
router.post('/', function (req, res) {
    var newBay = new Bay({
        id: req.body.id,
        name: req.body.name,
        game: req.body.game
    });
    newBay.save();
    res.status(200).send(newBay);
});
router.post('/:bayId/enqueue', function (req, res) {
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
});
router.get('/:bayId/dequeue', function (req, res) {
    Bay.findById(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);else if (bay) {
            var user = bay.queue.shift();
            if (user) {
                res.status(200).send(user);
                bay.queue.pull(user);
                bay.save();
            } else res.status(404).send('There are no users in the queue');
        } else res.status(404).send('No bay found with that ID');
    });
});
router.delete('/:bayId', function (req, res) {
    Bay.findByIdAndRemove(req.params.bayId, function (err, bay) {
        if (err) res.status(500).send(err);
        if (bay) {
            delete bay._id;
            res.status(200).send('Bay with id ' + bay._id + ' deleted');
        } else res.status(404).send("No Bay found with that ID");
    });
});
module.exports = router;