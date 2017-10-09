import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

class Message {
    constructor() {
        this.message = express();
        this.fs = fs;
        this.dataFile = path.join(__dirname, '../message.json');
    }

    //configuring message
    configureApp() {
        this.message.set('port', (process.env.PORT || 3000));
        this.message.use(bodyParser.json());
        this.message.use(bodyParser.urlencoded({ extended: true }));
    }

    //configuring cores
    configureCORS() {
        // Additional middleware which will set headers that we need on each request.
        this.message.use((req, res, next) => {
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

    configureRoutes() {
        //api call for getting all the messages
        this.message.get('/message', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
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
        this.message.post('/message', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
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

                this.fs.writeFile(this.dataFile, JSON.stringify(message, null, 4), (err) => {
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
        this.message.put('/message/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let messageDetails = JSON.parse(data);
                let idIndex = 0;
                let findMessageDetailById = messageDetails.filter(messageDetail => {
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
                this.fs.writeFile(this.dataFile, JSON.stringify(messageDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(messageDetails);
                });
            });
        });
        //api call for deleting message
        this.message.delete('/message/:id', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let messageDetails = JSON.parse(data);
                let idIndex = null;
                let findMessageDetailById = messageDetails.filter(messageDetail => {
                    if (messageDetail.timestamp == req.params.timestamp) {
                        idIndex = messageDetails.indexOf(messageDetail);
                        return messageDetail;
                    }
                });

                if (idIndex >= 0) {
                    messageDetails.splice(idIndex, 1);
                }

                this.fs.writeFile(this.dataFile, JSON.stringify(messageDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(messageDetails);
                });
            });
        });
    }

    listen(port) {
        this.message.listen(port, () => {
            console.log(`Server started: http://localhost:${port}/`);
        });
    }

    run() {
        this.configureApp();
        this.configureCORS()
        this.configureRoutes();
        this.listen(this.message.get('port'));
    }
}

export default Message;