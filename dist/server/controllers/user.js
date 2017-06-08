'use strict';

var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    res.send('Hello from root user node.');
});
router.get('/users', function (req, res) {
    res.send('List of APIv1 users.');
});
module.exports = router;