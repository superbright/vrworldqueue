var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var controller = require('../controllers/bays')
router.use(bodyParser.json());
router.get('/:bayId?', controller.getBays);
router.get('/local/:bayId', controller.getBayByLocalId);
router.post('/', controller.upsertBay);
router.post('/:bayId/enqueue', controller.enqueueUser);
router.get('/:bayId/dequeue', controller.dequeueUser);
router.delete('/:bayId', controller.deleteBay);
router.get('/:bayId/queue', controller.getQueue);
router.post('/:bayId/user', controller.bringUserToFront);
router.delete('/:bayId/user', controller.deleteUserFromQueue);
router.delete('/:bayId/queue', controller.clearQueue);
module.exports = router;