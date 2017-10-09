'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Message = function () {
    function Message() {
        _classCallCheck(this, Message);

        this.message = (0, _express2.default)();
        this.fs = _fs2.default;
        this.dataFile = _path2.default.join(__dirname, '../message.json');
    }

    //configuring message


    _createClass(Message, [{
        key: 'configureApp',
        value: function configureApp() {
            this.message.set('port', process.env.PORT || 3000);
            this.message.use(_bodyParser2.default.json());
            this.message.use(_bodyParser2.default.urlencoded({ extended: true }));
        }

        //configuring cores

    }, {
        key: 'configureCORS',
        value: function configureCORS() {
            // Additional middleware which will set headers that we need on each request.
            this.message.use(function (req, res, next) {
                // Set permissive CORS header - this allows this server to be used only as
                // an API server in conjunction with something like webpack-dev-server.
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

                // Disable caching so we'll always get the latest data.
                res.setHeader('Cache-Control', 'no-cache');
                next();
            });
        }
    }, {
        key: 'configureRoutes',
        value: function configureRoutes() {
            var _this = this;

            //api call for getting all the messages
            this.message.get('/message', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var unsortedData = JSON.parse(data);
                    //console.log("Unsorted: " + JSON.stringify(unsortedData) + "\n");
                    /*sortedData = _.sortBy(unsortedData, 'id');
                    //console.log("Sorted: " + JSON.stringify(sortedData.reverse()));
                    var sortedData = JSON.stringify(sortedData.reverse());*/
                    //console.log("Testing: " + JSON.parse(sortedData) + "\n");
                    res.json(unsortedData);
                });
            });

            //api call for posting new messages
            this.message.post('/message', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }

                    var message = JSON.parse(data);
                    var newMessage = {
                        id: req.body.id,
                        user: req.body.user,
                        picUrl: req.body.picUrl,
                        text: req.body.text,
                        type: req.body.type,
                        status: req.body.status,
                        contentType: req.body.contentType,
                        contentData: { data: req.body.contentData.data },
                        responseData: { data: req.body.responseData.data },
                        lastUpdateTime: req.body.lastUpdateTime
                    };

                    message.push(newMessage);

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(message, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                    });
                    /*
                    sortedData = _.sortBy(newMessage, 'id');
                    var sortedData = JSON.stringify(sortedData.reverse());
                    res.json(JSON.parse(sortedData));*/
                    res.json(message);
                });
            });
            //api call for updating existing message
            this.message.put('/message/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var messageDetails = JSON.parse(data);
                    var idIndex = 0;
                    var findMessageDetailById = messageDetails.filter(function (messageDetail) {
                        if (messageDetail.id == req.params.id) {
                            idIndex = messageDetails.indexOf(messageDetail);
                            return messageDetail;
                        }
                    });
                    findMessageDetailById[0].id = req.body.id;
                    findMessageDetailById[0].user = req.body.user;
                    findMessageDetailById[0].picUrl = req.body.picUrl;
                    findMessageDetailById[0].text = req.body.text;
                    findMessageDetailById[0].type = req.body.type;
                    findMessageDetailById[0].status = req.body.status;
                    findMessageDetailById[0].contentType = req.body.contentType;
                    findMessageDetailById[0].contentData = { data: req.body.contentData.data };
                    findMessageDetailById[0].responseData = { data: req.body.responseData.data };
                    findMessageDetailById[0].lastUpdateTime = req.body.lastUpdateTime;

                    messageDetails.splice(idIndex, 1, findMessageDetailById[0]);
                    _this.fs.writeFile(_this.dataFile, JSON.stringify(messageDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(messageDetails);
                    });
                });
            });
            //api call for deleting message
            this.message.delete('/message/:id', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var messageDetails = JSON.parse(data);
                    var idIndex = null;
                    var findMessageDetailById = messageDetails.filter(function (messageDetail) {
                        if (messageDetail.timestamp == req.params.timestamp) {
                            idIndex = messageDetails.indexOf(messageDetail);
                            return messageDetail;
                        }
                    });

                    if (idIndex >= 0) {
                        messageDetails.splice(idIndex, 1);
                    }

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(messageDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(messageDetails);
                    });
                });
            });
        }
    }, {
        key: 'listen',
        value: function listen(port) {
            this.message.listen(port, function () {
                console.log('Server started: http://localhost:' + port + '/');
            });
        }
    }, {
        key: 'run',
        value: function run() {
            this.configureApp();
            this.configureCORS();
            this.configureRoutes();
            this.listen(this.message.get('port'));
        }
    }]);

    return Message;
}();

exports.default = Message;