var bayController = require('../controllers/bays');
var rfidController = require('../controllers/rfid');
var signatureController = require('../controllers/signatures');
var userController = require('../controllers/users');
let sockets = {
    game: {}
    , button: {}
    , queue: {}
};
import SocketIO from 'socket.io';
import {
    findIndex, sanitizeString
}
from '../../shared/util';
module.exports.setupSockets = (server) => {
    let io = new SocketIO(server);
    io.on('connection', (socket) => {
        console.log('Incoming WS Connection');
        let bayId = socket.handshake.query.bayId;
        let clientType = socket.handshake.query.clientType;
        let currentBay = {
            id: socket.id
            , bayNumber: bayId
            , clientType: clientType
        };
        if (sockets[clientType][bayId] != null) {
            console.log('[INFO] bay ID is already connected, kicking.');
            socket.disconnect();
        }
        else {
            sockets[currentBay.clientType][currentBay.bayNumber] = socket;
            console.log('[INFO] ' + currentBay.clientType + " #" + currentBay.bayNumber + ' connected!');
        }
        socket.on('disconnect', () => {
            console.log('[INFO] ' + currentBay.clientType + " " + currentBay.bayNumber + ' disconnected!');
            sockets[currentBay.clientType][currentBay.bayNumber] = null;
            socket.broadcast.emit('bayDisconnect', {
                bayId: currentBay.bayNumber
            });
        });
    });
};
exports.sendToGame = (gameId, endpoint, message, callback) => {
    exports.sendToClient('game', gameId, endpoint, message, callback);
};
exports.sendToButton = (buttonId, endpoint, message, callback) => {
    exports.sendToClient('button', buttonId, endpoint, message, callback);
};
exports.sendToQueue = (queueId, endpoint, message, callback) => {
    exports.sendToClient('queue', queueId, endpoint, message, callback);
};
exports.sendToClient = (clientType, clientId, endpoint, message, callback) => {
    var returnValue = {
        request: {
            clientType: clientType
            , clientId: clientId
            , endpoint: endpoint
            , message: message
        }
    }
    var socket = sockets[clientType][clientId];
    if (!socket) {
        returnValue.error = "Socket not found";
    }
    else if (!socket.connected) {
        returnValue.error = "Socket Not Connected";
    }
    else {
        socket.emit(endpoint, message);
        returnValue.status = "ok";
    }
    callback && callback(returnValue);
}
exports.sockets = sockets;