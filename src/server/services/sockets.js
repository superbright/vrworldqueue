var bayController = require('../controllers/bays');
var rfidController = require('../controllers/rfid');
var signatureController = require('../controllers/signatures');
var userController = require('../controllers/bays');
let sockets = {
    game: {}
    , button: {}
    , queue: {}
};
let bays = [];
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
        if (findIndex(bays, currentBay.id) > -1) {
            console.log('[INFO] bay ID is already connected, kicking.');
            socket.disconnect();
        }
        else {
            sockets[currentBay.clientType][currentBay.id] = socket;
            console.log('[INFO] ' + currentBay.clientType + " #" + currentBay.bayNumber + ' connected!');
            bays.push(currentBay);
        }
        socket.on('disconnect', () => {
            if (findIndex(bays, currentBay.id) > -1) bays.splice(findIndex(bays, currentBay.id), 1);
            console.log('[INFO] ' + currentBay.clientType + " " + currentBay.bayNumber + ' disconnected!');
            socket.broadcast.emit('bayDisconnect', {
                bayId: currentBay.bayNumber
            });
        });
    });
};