var Bay = require('./models/bay').Bay;
var Queue = require('./models/queue').Queue;
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
                //TODO:
                //go through bay states
                //Look for dangling queues
                //account for queue states start timers
                //if time < date.now() delete
                // else create timer and push to app.locals
            bays.forEach(function (bay) {
                console.log(bay.currentState);
                if (bay.currentState == 'idle') {}
                else if (bay.currentState == '')
                    if (bay.currentState.endTime && bay.currentState.endTime) {
                        console.log('endtime; ' + bay.currentState.endTime)
                        if (bay.currentState.endTime < new Date()) {
                            if (bay.currentState.state == 'gameplay') {
                                bay.currentState.endTime = null;
                                bay.currentState.state = 'idle';
                                bay.save().then((bay) => {
                                    console.log(bay);
                                });
                            }
                        }
                    }
                Queue.find({
                    bay: bay._id
                }).exec((queues) => {
                    if (!queues) {
                        bay.currentState.state = 'idle';
                        bay.save();
                    }
                })
            });
        }
    });
}
module.exports = verifyData;