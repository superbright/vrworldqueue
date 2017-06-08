'use strict';

var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    res.json('List of users');
});
router.get('/:userId', function (req, res) {
    res.json('User with id: ' + req.params.userId);
});
router.post('/:userId', function (req, res) {
    res.json('Creating user with id: ' + req.params.userId);
});
router.post('/:userId');
module.exports = router;