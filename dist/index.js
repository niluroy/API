'use strict';

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _contactUs = require('./contactUs.api');

var _contactUs2 = _interopRequireDefault(_contactUs);

var _message = require('./message.api');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//for running the server
//var server = new Server();
//server.run();

//for running the contactUs APIs
var contactUs = new _contactUs2.default();
contactUs.run();

//for running the message APIs
//var message = new Message();
//message.run();