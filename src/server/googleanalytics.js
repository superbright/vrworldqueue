var ua = require('universal-analytics');
var visitor = ua('UA-100868454-1', 'New York Arcade', {
    strictCidFormat: false
});

exports.sendBayScan = (bay, user, action) => {
  if (user.role !== 'admin') {
    console.log(`[ANALYTICS] ${bay.name} ${bay.game} ${user.screenname} ${action}`);
    this.sendAnalytics(bay.name + '|' + bay.game, action, user.screenname);
  }
};

exports.sendGameStart = (bay) => {
  console.log(`[ANALYTICS] ${bay.name} ${bay.game} start`);
  this.sendAnalytics(bay.name, 'start', bay.game);
}

exports.sendTest = () => {
    console.log('------Sending Test-------');
    exports.sendAnalytics("Testing", "Start Game", "Bay", 1, {
        playername: 'mike'
    });
};
exports.sendAnalytics = function (category, action, label, value, params) {
    visitor.event(category, action, label, value, params, function (err) {
        console.log('[ANALYTICS] [ERROR]', err);
    });
};