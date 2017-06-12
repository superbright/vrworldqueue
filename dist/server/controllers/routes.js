'use strict';

var express = require('express');
var router = express.Router();
var routes = function routes(io) {
    router.use('/users', require('./users.js'));
    router.use('/signatures', require('./signatures.js'));
    router.use('/bays', require('./bays.js'));
    router.get('/', function (req, res) {
        res.send('api root');
    });
    return routes;
};
module.exports = routes;