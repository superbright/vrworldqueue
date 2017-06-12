var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var controller = require('../controllers/signatures')
router.use(bodyParser.json());
router.get('/:signatureId?', controller.getSignatures);
router.delete('/:signatureId', controller.deleteSignature);
module.exports = router;