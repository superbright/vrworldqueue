var bayController = require('../controllers/bays');
var rfidController = require('../controllers/rfid');
var signatureController = require('../controllers/signatures');
var userController = require('../controllers/users');
let sockets = {
    game: {}
    , startButton: {}
    , queue: {}
    , admin: {}
    , registration: {}
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
        let clientId = socket.handshake.query.clientId;
        let clientType = socket.handshake.query.clientType;
        let currentBay = {
            id: socket.id
            , bayNumber: clientId
            , clientType: clientType
        };
        if (sockets[clientType][clientId] != null) {
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
                clientId: currentBay.bayNumber
            });
        });
        userController.socketHandler(socket);
        rfidController.socketHandler(socket);
        bayController.socketHandler(socket);
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
exports.sendToAdmin = (adminId, endpoint, message, callnacl) => {
    exports.sendToClient('admin', adminId, endpoint, message, callback);
}
exports.sendBlob = (req, callback) => {
    exports.sendToClient(req.clientType, req.clientId, req.endpoint, req.message, callback);
}
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