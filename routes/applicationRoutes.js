const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController')

router.get('/maintenance', applicationController.applicationStatus);

module.exports = router;
