'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = process.env.NODE_ENV === 'development' ? require('../../webpack.config') : require('../../webpack-production.config');

require("babel-core/register");
require("babel-polyfill");
var app = (0, _express2.default)();
var server = _http2.default.Server(app);
var socketController = require('./services/sockets');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var compiler = (0, _webpack2.default)(config);

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
app.use((0, _compression2.default)({}));
app.use('/api', require('./routes/routes.js'));
app.use(_express2.default.static('public'));
app.get('*', function (req, res) {
    res.sendFile(_path2.default.join(__dirname, '../../index.html'));
});
server.listen(port, function () {
    console.log('[INFO] Listening on *:' + port);
});