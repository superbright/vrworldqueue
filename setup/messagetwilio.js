// Load the twilio module
var client = require('twilio')('sid', 'authtoken');


client.api.messages.create({
  to:"+16466969286",
  from:"+16466473067",
  body:"stop all the downloading"
   }).then(function(data) {
     console.log(data);
     console.log('Administrator notified');
   }).catch(function(err) {
     console.error('Could not notify administrator');
     console.error(err);
   });
