var ua = require('universal-analytics');
var visitor = ua('UA-100868454-1', 'New York Arcade', {strictCidFormat: false});

// var params = {
//   ec: "Event Category",
//   ea: "Event Action",
//   el: "…and a label",
//   ev: 42,
// }

var sendAnalytics = function (category, action, label, value, params) {
    visitor.event(category, action, label, value, params, function(err) {
      console.log(err);
    });
}

//sendAnalytics("Testing", "Start Game", "Bay", 1, { playername : 'mike' });

module.exports = sendAnalytics;
