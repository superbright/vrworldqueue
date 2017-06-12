'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Bay = require('../models/bay').Bay;
router.post('/:bayId', function (req, res) {
    Bay.find({
        id: req.params.bayId
    }, function (err, bay) {
        if (err) return err;
        if (bay) {
            var rfid = req.params.rfid;
        }
    });
});
module.exports.socketHandler = function (socket) {
    /* Add Socket Handling Logic Here */
    socket.on('rfid', function (msg) {
        console.log("[RFID Socket] " + msg);
    });
};