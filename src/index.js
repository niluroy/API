import Server from './server';
import ContactUs from './contactUs.api';
import Message from './message.api';

//for running the server
//var server = new Server();
//server.run();

//for running the contactUs APIs
var contactUs = new ContactUs();
contactUs.run();

//for running the message APIs
//var message = new Message();
//message.run();