const express = require('express');
const router = express.Router();
const shikshaController = require('../controllers/shikshaController');
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');
 
// shikshaController
// settings page routes
router.post('/notification',authMiddleware,loginCheck,shikshaController.notificationStatus);
router.get('/notification',authMiddleware,loginCheck,shikshaController.readNotificationStatus);
router.put('/notification',authMiddleware,loginCheck,shikshaController.notificationStatusToggle);
router.post('/changepassword',authMiddleware,loginCheck,shikshaController.changePassword);
router.get('/subscription',authMiddleware,loginCheck,shikshaController.readSubscription);

module.exports = router;