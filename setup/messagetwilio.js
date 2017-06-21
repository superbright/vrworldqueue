// Load the twilio module
var twilioService = require("../src/server/services/twilio");
twilioService.sendMessage({phone:'9702314197',message:'test one two'});