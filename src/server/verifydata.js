var Bay = require('./models/bay').Bay;
var verifyData = function (app) {
    Bay.find({}, (err, bays) => {
        if (err) {
            console.log(err);
        }
        else {
            app.locals.timers = {
                onboarding: {}
                , gameplay: {}
            }
            app.locals.testVar = {
                    msg: "Hello"
                }
                //TODO:
                //go through bay states
                //Look for dangling queues
                //account for queue states start timers
                //if time < date.now() delete
                // else create timer and push to app.locals
            bays.forEach(function (bay) {
                console.log(bay.currentState);
                if (bay.currentState.endTime && bay.currentState.endTime) {
                    console.log('endtime; ' + bay.currentState.endTime)
                    if (bay, bay.currentState.endTime < new Date()) {
                        console.log("delteing timer");
                        if (bay.currentState.state == 'gameplay') {
                            bay.currentState.endTime = null;
                            bay.currentState.state = 'idle';
                            bay.save().then((bay) => {
                                console.log(bay);
                            });
                        }
                    }
                }
                // console.log(bay.id + " " + bay.name + " "+ bay.currentState);
            });
        }
    });
}
module.exports = verifyData;