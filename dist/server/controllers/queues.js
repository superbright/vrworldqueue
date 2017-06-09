'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));
var Queue = require('../models/queue').Queue;
router.get('/:queueId?', function (req, res) {
    if (req.params.queueId) Queue.findById(req.params.queueId, function (err, queue) {
        if (err) res.status(500).send(err);
        if (queue) res.status(200).send(queue);else res.status(404).send("No Queue found with that ID");
    });else Queue.find({}, function (err, queues) {
        if (err) res.status(500).send(err);else res.status(200).send(queues);
    });
});
router.post('/', function (req, res) {
    var newQueue = new Queue({});
    newQueue.save();
    res.status(200).send(newQueue);
});
router.delete('/:queueId', function (req, res) {
    Queue.findByIdAndRemove(req.params.queueId, function (err, queue) {
        if (err) res.status(500).send(err);
        if (queue) {
            delete queue._id;
            res.status(200).send('Queue with id ' + queue._id + ' deleted');
        } else res.status(404).send("No Queue found with that ID");
    });
});
module.exports = router;