var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var socketService = require('../services/sockets');
router.use(bodyParser.json());
router.get('/game/:gameId/:endpoint', (req, res) => {
    console.log('get game');
    socketService.sendToGame(req.params.gameId, req.params.endpoint, {}, (result) => {
        res.send(result);
    });
});
router.get('/button/:buttonId/:endpoint', (req, res) => {
    socketService.sendToButton(req.params.buttonId, req.params.endpoint, {}, (result) => {
        res.send(result);
    });
});
router.get('/queue/:queueId/:endpoint', (req, res) => {
    socketService.sendToQueue(req.params.queueId, req.params.endpoint, {}, (result) => {
        res.send(result);
    });
});
router.post('/', (req, res) => {
    var clientType = req.body.clientType;
    var endpoint = req.body.endpoint;
    var message = req.body.message;
    socketService.sendToClient(clientType, endpoint, message, (result) => {
        res.send(result);
    });
});
module.exports = router;