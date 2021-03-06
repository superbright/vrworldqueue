var bayController = require('../controllers/bays');
var rfidController = require('../controllers/rfid');
var userController = require('../controllers/users');
let sockets = {
    game: {}
    , button: {}
    , queue: {}
    , queueAdmin: {}
    , admin: {}
    , registration: {}
    , global: {}
    , bigqueue: {}
};
let socketState = {
    game: {}
    , button: {}
    , queue: {}
    , queueAdmin: {}
    , admin: {}
    , registration: {}
    , global: {}
    , bigqueue: {}
}
import SocketIO from 'socket.io';
import {
    findIndex, sanitizeString
}
from '../../shared/util';
module.exports.setupSockets = (server, app) => {
    let io = new SocketIO(server);
    io.on('connection', (socket) => {
        let clientId = socket.handshake.query.clientId;
        let clientType = socket.handshake.query.clientType;
        let currentBay = {
            id: socket.id
            , clientId: clientId
            , clientType: clientType
        };
        registerSocket(socket, currentBay, app);
    });
};
module.exports.disconnectClient = (clientType, clientId) => {
    if (sockets[clientType][clientId]) {
        sockets[clientType][clientId].disconnect();
        sockets[clientType][clientId] = null;
    }
}
var registerSocket = (socket, currentBay, app) => {
    console.log('[Info] Incoming WS Connection from ' + currentBay.clientType + ' # ' + currentBay.clientId);
    if (sockets[currentBay.clientType][currentBay.clientId] != null) {
        if (currentBay.clientType != 'admin') {
            console.warn('[WARN] socket already connected');
            socket.emit('setState', {
                state: 'error'
                , error: 'Page is already open on other tablet'
            });
            socket.disconnect();
            return;
        }
    }
    sockets[currentBay.clientType][currentBay.clientId] = socket;
    socketState[currentBay.clientType][currentBay.clientId] = true;
    console.log('[INFO] ' + currentBay.clientType + " #" + currentBay.clientId + ' connected!');
    socket.on('disconnect', () => {
        console.log('[INFO] ' + currentBay.clientType + " " + currentBay.clientId + ' disconnected!');
        sockets[currentBay.clientType][currentBay.clientId] = null;
        socketState[currentBay.clientType][currentBay.clientId] = false;
        socket.broadcast.emit('bayDisconnect', {
            clientId: currentBay.bayNumber
        });
    });
    socket.emit('hello', currentBay);
    socket.on('refresh', () => {
        console.log('[INFO] Refresh triggered');
        socket.broadcast.emit('refresh');
    })
    userController.socketHandler(socket, app);
    rfidController.socketHandler(socket, app);
    bayController.socketHandler(socket, app);
}
exports.sendToGame = (gameId, endpoint, message, callback) => {
    console.log('sending to game' + endpoint);
    exports.sendToClient('game', gameId, endpoint, message, callback);
};
exports.sendToButton = (buttonId, endpoint, message, callback) => {
    exports.sendToClient('button', buttonId, endpoint, message, callback);
};
exports.sendToQueue = (queueId, endpoint, message, callback) => {
    exports.sendToClient('queue', queueId, endpoint, message, callback);
};
exports.sendToBigQueue = (queueId, endpoint, message, callback) => {
    exports.sendToClient('bigqueue', queueId, endpoint, message, callback);
};
exports.sendToQueueAdmin = (queueId, endpoint, message, callback) => {
    exports.sendToClient('queueAdmin', queueId, endpoint, message, callback);
};
exports.sendToAdmin = (adminId, endpoint, message, callback) => {
    exports.sendToClient('admin', adminId, endpoint, message, callback);
};
exports.sendBlob = (req, callback) => {
    exports.sendToClient(req.clientType, req.clientId, req.endpoint, req.message, callback);
};
exports.sendToClient = (clientType, clientId, endpoint, message, callback) => {
    var returnValue = {
        request: {
            clientType: clientType
            , clientId: clientId
            , endpoint: endpoint
            , message: message
        }
    };
    var socket = sockets[clientType][clientId];
    if (!socket) {
        console.log('[WARN]: Socket not found: ' + returnValue.request.clientType + " " + returnValue.request.clientId);
        returnValue.error = "Socket not found";
    }
    else if (!socket.connected) {
        console.log('[WARN] Socket not connected');
        returnValue.error = "Socket Not Connected";
    }
    else {
        socket.emit(endpoint, message);
        returnValue.status = "ok";
    }
    callback && callback(returnValue);
};
console.log('This is definitely latest code');
exports.sockets = sockets;
exports.socketState = socketState;