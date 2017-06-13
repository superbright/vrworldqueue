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
        var req = JSON.parse(msg);
        var res = req;
        if (req.clientId) res.endpoint = 'rfid';
        if (req.clientType == 'registration') res.clientType = 'admin';
        switch (req.clientType) {
        case 'admin':
            res.clientType = 'registration';
            sockets.sendBlob(res, (result) => {
                console.log(result);
            });
            break;
        case 'queue':
            break;
        }
        console.log("RFID tag scanned from " + req.clientType + " #" + req.clientId);
    });
};