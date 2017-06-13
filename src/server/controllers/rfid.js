var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Bay = require('../models/bay').Bay;
var sockets = require('../services/sockets');
router.post('/:bayId', (req, res) => {
    Bay.find({
        id: req.params.bayId
    }, (err, bay) => {
        if (err) return err;
        if (bay) {
            var rfid = req.params.rfid;
        }
    });
});
module.exports.socketHandler = (socket) => {
    /* Add Socket Handling Logic Here */
    socket.on('rfid', (msg) => {
        var json = JSON.parse(msg);
        json.endpoint = 'rfid';
        json.message = 'rfid';
        console.log("[RFID Socket] " + json.tag);
        sockets.sendBlob(json, (result) => {
            console.log(result);
        });
    });
};