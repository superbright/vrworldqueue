import moment from 'moment';
var User = require('../models/user').User;
var Signature = require('../models/signature').Signature;
import {
    twoAMTomorrow, midnightThisMorning, isNumeric
}
from '../../shared/util.js';
var analytics = require("../googleanalytics.js");
exports.getUsers = (req, res) => {
    let dob = null;
    if (req.params.userId) User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        if (user) {
          if (user.dob) {
            user = user.toObject();
            dob = moment(user.dob);
            user.dob = {
              month: dob.month(),
              date: dob.date(),
              year: dob.year()
            }
          };
          res.status(200).send(user);
        }
        else res.status(404).send("No User found with that ID");
    });
    else User.find({}, (err, users) => {
        if (err) res.status(500).send(err);
        else res.status(200).send(users);
    });
}
exports.activateUser = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        else if (user) {
            if (!user.rfid) {
                res.status(404).send("User does not have RFID");
            }
            else {
                user.rfid.expiresAt = twoAMTomorrow();
                user.save((err, doc) => {
                    if (err) res.status(500).send(err);
                    else {
                        analytics.sendAnalytics("User", "Activate User", doc.screenname, new Date().getMilliseconds(), {});
                        res.status(200).send(doc);
                    }
                });
            }
        }
        else {
            res.status(404).send("No user found with that ID");
        }
    });
};
exports.deactivateUser = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        else if (user) {
            if (!user.rfid) {
                res.status(404).send("User does not have RFID");
            }
            else {
                user.rfid.expiresAt = midnightThisMorning();
                user.save((err, doc) => {
                    if (err) res.status(500).send(err);
                    else res.status(200).send(doc);
                });
            }
        }
        else {
            res.status(404).send("No user found with that ID");
        }
    });
};
exports.getUserSignature = (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        else if (user) {
            Signature.findById(user.Signature, (err, signature) => {
                if (err) res.status(500).send(err);
                if (signature) res.status(200).send(signature);
                else res.status(404).send('No signature found for that user');
            });
        }
        else res.json("No User found with that ID");
    });
};

exports.suggestScreenname = (req, res) => {
  if (req.body.firstname && req.body.lastname) {
    suggestScreenname(req.body.firstname, req.body.lastname).then((suggestion) => {
      res.status(200).json({
        status: !!suggestion,
        suggestion: suggestion
      });
    });
  } else {
    res.status(200).json({
      status: false,
      error: 'Cannot suggest screenname'
    });
  }
};

exports.checkScreenName = (req, res) => {
    if (req.params.screenname != null) {
        User.findOne({
            screenname: req.params.screenname
        }, (err, user) => {
            if (err) res.status(500).send(err);
            else if (user) {
                res.json({
                    status: true
                    , error: 'Screenname already taken'
                });
            }
            else res.json({
                status: true
            });
        });
    }
    else {
        res.json({
            status: false
            , error: 'must send screenname'
        })
    }
}
exports.postUser = (req, res) => {
    var signature = new Signature({
        image: {
            data: req.body.signaturedate
            , contentType: 'image/png'
        }
    });
    signature.save();
    var userData = {};
    if (req.body.firstname != null) userData.firstname = req.body.firstname;
    if (req.body.lastname != null) userData.lastname = req.body.lastname
    if (req.body.email != null) userData.email = req.body.email;
    if (req.body.phone != null) userData.phone = req.body.phone;
    if (req.body.screenname != null) userData.screenname = req.body.screenname;
    if (req.body.createdAt != null) userData.createdAt = req.body.createdAt;
    if (req.body.gender != null) userData.gender = req.body.gender;
    if (req.body.dob != null &&
        isNumeric(req.body.dob.month) &&
        isNumeric(req.body.dob.date) &&
        isNumeric(req.body.dob.year))
    {
      userData.dob = moment(req.body.dob);
    }
    if (req.body.address != null) userData.address = req.body.address;
    if (req.body.source != null) userData.source = req.body.source;
    userData.signature = signature._id;
    if (req.body.rfid) {
        console.log('Adding RFID');
        userData.rfid = {};
        userData.rfid.id = req.body.rfid;
        userData.rfid.expiresAt = req.body.timer && !isNaN(parseInt(req.body.timer)) ?
          moment().add(req.body.timer, 'h').toDate() : twoAMTomorrow();
    }
    var query = {
        'email': req.body.email
    };
    User.findOneAndUpdate(query, userData, {
        upsert: true
        , new: true
    }, (err, doc) => {
        if (err) res.status(500).send(err);
        else {
            analytics.sendAnalytics("User", "Register User", doc.screenname, new Date().getMilliseconds(), {});
            res.status(200).send(doc);
        }
    });
};
exports.validateUser = (req, res) => {
    User.find({
        screenname: req.body.screenname
    }, (err, doc) => {
        var response = {};
        if (err) res.status(500).send(err);
        else if (doc) response = {
            valid: false
        };
        else response = {
            valid: true
        };
        res.status(200).send(response);
    });
}
exports.deleteUser = (req, res) => {
    User.findByIdAndRemove(req.params.userId, (err, user) => {
        if (err) res.status(500).send(err);
        if (user) {
            delete user._id;
            res.status(200).send('User with id ' + user._id + ' deleted');
            if (user.signature) delete user.signature._id;
        }
        else res.status(404).send("No User found with that ID");
    });
};

var suggestScreenname = async (firstname, lastname, suggestion = '', attempts = 10) => {
  if (!attempts) {
    return false;
  }
  if (!suggestion) {
    suggestion = firstname + lastname.substring(0, 1);
  }

  while (attempts--) {
    var res = await User.find({screenname: suggestion}).exec();
    if (!res.length) return suggestion;
    if (suggestion.length >= firstname.length + lastname.length) {
      suggestion = firstname + lastname + attempts;
    } else {
      suggestion = (firstname+lastname).substring(0, suggestion.length + 1);
    }
  }
  return false;
};

module.exports.socketHandler = (socket) => {
    /* Add Socket Handling Logic Here */
};