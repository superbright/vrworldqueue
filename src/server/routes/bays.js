var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var controller = require('../controllers/bays')
router.use(bodyParser.json());
router.get('/:bayId?', controller.getBays);
router.post('/', controller.upsertBay);
router.post('/:bayId/enqueue', controller.enqueueUser);
router.get('/:bayId/dequeue', controller.dequeueUser);
router.delete('/:bayId', controller.deleteBay);
module.exports = router;