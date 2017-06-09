'use strict';
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import compression from 'compression';
import {
    validNick, findIndex, sanitizeString
} from '../shared/util';
import path from 'path';

import webpack from 'webpack';
import config from '../../webpack.config';

const app = express();
const server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;
let users = [];
let sockets = {};
const mongoose = require('mongoose');
const compiler = webpack(config);

// webpack hot reload
app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

mongoose.connect('mongodb://localhost/vrworld');
app.use(compression({}));
// app.use(express['static'](__dirname + '/../client'));
app.use('/users', require('./controllers/users.js'));
app.use('/queues', require('./controllers/users.js'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

io.on('connection', (socket) => {
    let nick = socket.handshake.query.nick;
    let currentUser = {
        id: socket.id
        , nick: nick
    };
    if (findIndex(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    }
    else if (!validNick(currentUser.nick)) {
        socket.disconnect();
    }
    else {
        console.log('[INFO] User ' + currentUser.nick + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);
        io.emit('userJoin', {
            nick: currentUser.nick
        });
        console.log('[INFO] Total users: ' + users.length);
    }
    socket.on('ding', () => {
        socket.emit('dong');
    });
    socket.on('disconnect', () => {
        if (findIndex(users, currentUser.id) > -1) users.splice(findIndex(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.nick + ' disconnected!');
        socket.broadcast.emit('userDisconnect', {
            nick: currentUser.nick
        });
    });
    socket.on('userChat', (data) => {
        let _nick = sanitizeString(data.nick);
        let _message = sanitizeString(data.message);
        let date = new Date();
        let time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);
        console.log('[CHAT] [' + time + '] ' + _nick + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', {
            nick: _nick
            , message: _message
        });
    });
});
server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});
