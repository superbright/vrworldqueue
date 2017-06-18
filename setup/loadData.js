const data = require('./baydata');
const Bay = require('../src/server/models/bay').Bay;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vrworld');
//WARNING, CURRENTLY DESTRUCTIVE
//Drops table, and updates all the data with new bays
//this script is only for testing, should not be used for production
//remove all bays
Bay.remove({}).then(function (err, result) {
    if (err) console.log(err);
    //create all new bays
    data.bays.forEach(bay => {
        console.log(bay);
        const newBay = new Bay({
            id: bay.bayid
            , name: bay.name
            , game: bay.game
            , playTime: bay.playTime
        });
        newBay.save().then(function (err, savedBay) {
            if (err) console.log(err);
            console.log(savedBay);
        });
        return;
    });
    //console.log(result);
});