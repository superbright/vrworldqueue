'use strict';

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Bay = require('../models/bay').Bay;
var sockets = require('../services/sockets');
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
        var json = JSON.parse(msg);
        json.endpoint = 'rfid';
        json.message = 'rfid';
        console.log("[RFID Socket] " + json.tag);
        sockets.sendBlob(json, function (result) {
            console.log(result);
        });
    });
};