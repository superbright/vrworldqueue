'use strict';

var Signature = require('../models/signature').Signature;
exports.getSignatures = function (req, res) {
    if (req.params.signatureId) Signature.findById(req.params.signatureId, function (err, signature) {
        if (err) res.status(500).send(err);else if (signature) res.status(200).send(signature);else res.status(404).send("Signature not found with that ID");
    });else Signature.find({}, function (err, signatures) {
        if (err) res.status(500).send(err);else res.status(200).send(signatures);
    });
};
exports.deleteSignature = function (req, res) {
    Signature.findByIdAndRemove(req.params.signatureId, function (err, signature) {
        if (err) res.status(500).send(err);
        if (signature) {
            delete signature._id;
            res.status(200).send('Signature with id ' + signature._id + ' deleted');
        } else res.status(404).send("No signature found with that ID");
    });
};
module.exports.socketHandler = function (socket) {};