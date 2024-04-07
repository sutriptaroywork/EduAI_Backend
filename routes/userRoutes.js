const express = require('express');
const router = express.Router();
const shikshaController = require('../controllers/shikshaController');
const passport = require('passport');
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');

router.post('/login', shikshaController.login);
router.post('/loginwithotp', shikshaController.loginWithOtp);
router.post('/generateotp', shikshaController.generateOtp);
router.post('/register', shikshaController.register);
router.post('/forgotpassword', shikshaController.forgotPassword);
router.post('/resetpassword', shikshaController.resetPassoword);
router.post('/logout',authMiddleware,loginCheck, shikshaController.logout);
router.post('/generateRegisterOtp', shikshaController.generateRegisterOtp);
router.post('/validateRegisterOtp', shikshaController.validateRegisterOtp);



module.exports = router;