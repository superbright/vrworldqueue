'use strict';

var express = require('express');
var router = express.Router();
router.use('/users', require('./users.js'));
router.use('/signatures', require('./signatures.js'));
router.use('/bays', require('./bays.js'));
router.get('/', function (req, res) {
    res.send('api root');
});
module.exports = router;