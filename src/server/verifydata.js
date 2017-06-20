var Bay = require('./models/bay').Bay;

Bay.find({}, (err, bays) => {
    if (err) console.log(err);
    else {
      //console.log(bays);
      bays.forEach(function(bay) {
         console.log(bay.id + " " + bay.name + " "+ bay.currentState);
      });
    }
});
