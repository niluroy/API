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

var ContactUs = function () {
    function ContactUs() {
        _classCallCheck(this, ContactUs);

        this.contactUs = (0, _express2.default)();
        this.fs = _fs2.default;
        this.dataFile = _path2.default.join(__dirname, '../contactUs.json');
    }

    //configuring contactUs


    _createClass(ContactUs, [{
        key: 'configureApp',
        value: function configureApp() {
            this.contactUs.set('port', process.env.PORT || 3000);
            this.contactUs.use(_bodyParser2.default.json());
            this.contactUs.use(_bodyParser2.default.urlencoded({ extended: true }));
        }

        //configuring cores

    }, {
        key: 'configureCORS',
        value: function configureCORS() {
            // Additional middleware which will set headers that we need on each request.
            this.contactUs.use(function (req, res, next) {
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

            //api call for getting all the contacts
            this.contactUs.get('/contactUs', function (req, res) {
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
            //api call for posting contacts
            this.contactUs.post('/contactUs', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var contactUs = JSON.parse(data);
                    var newContactUs = {
                        timestamp: req.body.timestamp,
                        fullName: req.body.fullName,
                        emailId: req.body.emailId,
                        message: req.body.message,
                        subject: req.body.subject
                    };

                    contactUs.push(newContactUs);

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(contactUs, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                    });
                    /*
                    sortedData = _.sortBy(contactUs, 'id');
                    var sortedData = JSON.stringify(sortedData.reverse());
                    res.json(JSON.parse(sortedData));*/
                    res.json(contactUs);
                });
            });
            //api call for updating existing contacts
            this.contactUs.put('/contactUs/:timestamp', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var contactUsDetails = JSON.parse(data);
                    var idIndex = 0;
                    var findContactUsDetailByTimestamp = contactUsDetails.filter(function (contactUsDetail) {
                        if (contactUsDetail.timestamp == req.params.timestamp) {
                            idIndex = contactUsDetails.indexOf(contactUsDetail);
                            return contactUsDetail;
                        }
                    });
                    findContactUsDetailByTimestamp[0].timestamp = req.body.timestamp;
                    findContactUsDetailByTimestamp[0].fullName = req.body.fullName;
                    findContactUsDetailByTimestamp[0].emailId = req.body.emailId;
                    findContactUsDetailByTimestamp[0].message = req.body.message;
                    findContactUsDetailByTimestamp[0].subject = req.body.subject;

                    contactUsDetails.splice(idIndex, 1, findContactUsDetailByTimestamp[0]);
                    _this.fs.writeFile(_this.dataFile, JSON.stringify(contactUsDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(contactUsDetails);
                    });
                });
            });
            //api call for deleting existing contact
            this.contactUs.delete('/contactUs/:timestamp', function (req, res) {
                _this.fs.readFile(_this.dataFile, function (err, data) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    var contactUsDetails = JSON.parse(data);
                    var idIndex = null;
                    var findContactUsDetailByTimestamp = contactUsDetails.filter(function (contactUsDetail) {
                        if (contactUsDetail.timestamp == req.params.timestamp) {
                            idIndex = contactUsDetails.indexOf(contactUsDetail);
                            return contactUsDetail;
                        }
                    });

                    if (idIndex >= 0) {
                        contactUsDetails.splice(idIndex, 1);
                    }

                    _this.fs.writeFile(_this.dataFile, JSON.stringify(contactUsDetails, null, 4), function (err) {
                        if (err) {
                            console.error(err);
                            process.exit(1);
                        }
                        res.json(contactUsDetails);
                    });
                });
            });
        }
    }, {
        key: 'listen',
        value: function listen(port) {
            this.contactUs.listen(port, function () {
                console.log('Server started: http://localhost:' + port + '/');
            });
        }
    }, {
        key: 'run',
        value: function run() {
            this.configureApp();
            this.configureCORS();
            this.configureRoutes();
            this.listen(this.contactUs.get('port'));
        }
    }]);

    return ContactUs;
}();

exports.default = ContactUs;