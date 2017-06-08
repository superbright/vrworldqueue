'use strict';

var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    res.json('List of queues');
});
router.get('/:queueId', function (req, res) {
    res.json('Queue with id: ' + req.params.userId);
});
router.post('/:queueId', function (req, res) {
    res.json('Creating Queue with id: ' + req.params.userId);
});
router.post('/:queueId');
module.exports = router;