'use strict';
import express from 'express';
import http from 'http';
import compression from 'compression';
import path from 'path';
import webpack from 'webpack';
import config from '../../webpack.config';
require("babel-core/register");
require("babel-polyfill");
const app = express();
const server = http.Server(app);
var socketController = require('./services/sockets');
let port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const compiler = webpack(config);
// webpack hot reload
app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));
mongoose.connect('mongodb://localhost/vrworld');
// verify data on start
// setup timers
require("./verifydata")(app);
socketController.setupSockets(server, app);
app.use(compression({}));
app.use('/api', require('./routes/routes.js'));
app.use(express.static('public'));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../index.html'));
});
server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});