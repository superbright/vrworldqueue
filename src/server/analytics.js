var Mixpanel = require('mixpanel');
var moment = require('moment');

var devEnv = process.env.NODE_ENV === 'development'; //@todo swap this out for a difference api key in dev
var mixpanel = Mixpanel.init('8d3dd6219b721744231d20fbf6ac2110');

exports.sendGameStart = (bay, user = bay.currentState.user) => {
  sendAnalytics('Game Start', {
    location: 1,
    user: user.screenname,
    bay: bay.name,
    game: bay.game,
    time: new Date()
  });
};

exports.sendBayScan = (bay, user = bay.currentState.user) => {
  if (user.role !== 'admin') {
    sendAnalytics('Bay Scan', {
      location: 1,
      user: user.screenname,
      bay: bay.name,
      game: bay.game,
      time: new Date()
    });
  }
}

exports.registerUser = (user) => {
  sendAnalytics('Register User', {
    location: 1,
    user: user.screenname,
    dob: moment(user.dob).toDate(),
    gender: user.gender,
    address: user.address,
    source: user.source,
    time: new Date(),
  });
};

var sendAnalytics = (event, params) => {
  if (!devEnv) {
    try {
      mixpanel.track(event, params);
      //    console.log('[DEBUG] [MIXPANEL] ', event, params);
    } catch (e) {
      console.log('[ERROR] [MIXPANEL]', e);
    }
  }
};