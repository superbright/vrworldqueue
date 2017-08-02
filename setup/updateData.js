const data = require('./baydata');
const Bay = require('../src/server/models/bay').Bay;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vrworld');
//Updates all the data with bay data. 
//Will create new object if one with that 
//bayid does not exist (upsert)

data.bays.forEach(bay => {
    const newBay = {
        id: bay.bayid
        , name: bay.name
        , game: bay.game
        , playTime: bay.playTime
        , instructionFile: bay.instructionFile
        , bigBayFile: bay.bigBayImageFile
    };
    Bay.findOneAndUpdate({
        id: newBay.id
    }, newBay, {
        upsert: true
        , new: true
    }).then((savedBay) => {
        console.log(savedBay);
    }).catch((err) => {
        console.log(err);
    });
});
console.log('All done!');