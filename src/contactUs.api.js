import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

class ContactUs {
    constructor() {
        this.contactUs = express();
        this.fs = fs;
        this.dataFile = path.join(__dirname, '../contactUs.json');
    }

    //configuring contactUs
    configureApp() {
        this.contactUs.set('port', (process.env.PORT || 3000));
        this.contactUs.use(bodyParser.json());
        this.contactUs.use(bodyParser.urlencoded({ extended: true }));
    }

    //configuring cores
    configureCORS() {
        // Additional middleware which will set headers that we need on each request.
        this.contactUs.use((req, res, next) => {
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
        //api call for getting all the contacts
        this.contactUs.get('/contactUs', (req, res) => {
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
        //api call for posting contacts
        this.contactUs.post('/contactUs', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
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

                this.fs.writeFile(this.dataFile, JSON.stringify(contactUs, null, 4), (err) => {
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
        this.contactUs.put('/contactUs/:timestamp', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let contactUsDetails = JSON.parse(data);
                let idIndex = 0;
                let findContactUsDetailByTimestamp = contactUsDetails.filter(contactUsDetail => {
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
                this.fs.writeFile(this.dataFile, JSON.stringify(contactUsDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(contactUsDetails);
                });
            });
        });
        //api call for deleting existing contact
        this.contactUs.delete('/contactUs/:timestamp', (req, res) => {
            this.fs.readFile(this.dataFile, (err, data) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                let contactUsDetails = JSON.parse(data);
                let idIndex = null;
                let findContactUsDetailByTimestamp = contactUsDetails.filter(contactUsDetail => {
                    if (contactUsDetail.timestamp == req.params.timestamp) {
                        idIndex = contactUsDetails.indexOf(contactUsDetail);
                        return contactUsDetail;
                    }
                });

                if (idIndex >= 0) {
                    contactUsDetails.splice(idIndex, 1);
                }

                this.fs.writeFile(this.dataFile, JSON.stringify(contactUsDetails, null, 4), function(err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    res.json(contactUsDetails);
                });
            });
        });
    }

    listen(port) {
        this.contactUs.listen(port, () => {
            console.log(`Server started: http://localhost:${port}/`);
        });
    }

    run() {
        this.configureApp();
        this.configureCORS()
        this.configureRoutes();
        this.listen(this.contactUs.get('port'));
    }
}

export default ContactUs;