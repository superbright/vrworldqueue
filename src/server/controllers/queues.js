var express = require('express');
var router = express.Router();
var Queue = require('../models/queue').Queue;
router.get('/', (req, res) => {
    res.json('List of queues');
});
router.get('/:queueId', (req, res) => {
    res.json('Queue with id: ' + req.params.userId);
});
router.post('/:queueId', (req, res) => {
    res.json('Creating Queue with id: ' + req.params.userId);
});
router.post('/:queueId')
module.exports = router;