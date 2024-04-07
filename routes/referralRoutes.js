const express = require('express');
const router = express.Router();
const shikshaController = require('../controllers/shikshaController');
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');



router.get('/credits',authMiddleware,loginCheck,shikshaController.credits);



module.exports = router;