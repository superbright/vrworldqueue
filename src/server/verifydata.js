var Bay = require('./models/bay').Bay;


var verifyData = function(app) {
  Bay.find({}, (err, bays) => {
      if (err) {
        console.log(err);
      } else {

        app.locals.timers  = {
            onboarding: {}
            , gameplay: {}
        }

        //TODO:
        //go through bay states
        //if time < date.now() delete
        // else create timer and push to app.locals

        bays.forEach(function(bay) {
           console.log(bay.id + " " + bay.name + " "+ bay.currentState);
        });
      }
  });
}

module.exports = verifyData;
