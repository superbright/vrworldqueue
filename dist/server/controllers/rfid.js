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
        var req = JSON.parse(msg);
        var res = req;
        if (req.clientId) res.endpoint = 'rfid';
        if (json.clientType == 'registration') res.clientType = 'admin';
        json.message = 'rfid';
        console.log("RFID tag scanned from " + json.clientType + " #" + json.clientId);
        sockets.sendBlob(json, function (result) {
            console.log(result);
        });
    });
};