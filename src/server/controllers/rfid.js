var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Bay = require('../models/bay').Bay;
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
        console.log("[RFID Socket] " + msg);
    });
};