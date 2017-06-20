'use strict';
import express from 'express';
import http from 'http';
import compression from 'compression';
import path from 'path';
import webpack from 'webpack';

const config = process.env.NODE_ENV === 'development'
  ? require('../../webpack.config')
  : require('../../webpack-production.config');

require("babel-core/register");
require("babel-polyfill");
const app = express();
const server = http.Server(app);
var socketController = require('./services/sockets');
let port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));
if (process.env.NODE_ENV === 'development') {
  // app.use(require('webpack-hot-middleware')(compiler));
}


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
