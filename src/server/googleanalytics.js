var ua = require('universal-analytics');
var visitor = ua('UA-100868454-1', 'New York Arcade', {
    strictCidFormat: false
});
//var User = require('./models/user').User;
//var Bay = require('./models/bay').Bay;
// var params = {
//   ec: "Event Category",
//   ea: "Event Action",
//   el: "…and a label",
//   ev: 42,
// }
//var sendUserEvent = (action, label, userId, params) => {
//    User.findById(userId).then((user) => {
//        if (!user) console.log('User not found');
//        else sendAnalytics('User', label, user.screenname, params);
//    }).catch((err) => {
//        console.error(err);
//    });
//}
//var sendBayEvent = (action, label, bayId, params) => {}
exports.sendTest = () => {
    console.log('------Sending Test-------');
    exports.sendAnalytics("Testing", "Start Game", "Bay", 1, {
        playername: 'mike'
    });
}
exports.sendAnalytics = function (category, action, label, value, params) {
//    console.log('----SendingAnalytics-----');
//    console.log(category)
//    console.log(action)
//    console.log(label)
//    console.log(value)
//    console.log(params)
//    console.log('-----------------------');
    //console.log(visitor);
    visitor.event(category, action, label, value, params, function (err) {
        console.log('----err----');
        console.log(err);
    });
};
//sendAnalytics("Testing", "Start Game", "Bay", 1, {
//    playername: 'mike'
//    });
//module.exports = sendAnalytics;