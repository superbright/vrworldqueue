var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
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