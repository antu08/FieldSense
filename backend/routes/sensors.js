const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensorsController');

// Open endpoint for IoT devices to post data
router.post('/data', sensorsController.receiveData);

module.exports = router;
