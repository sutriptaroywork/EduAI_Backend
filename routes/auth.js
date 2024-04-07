const express = require('express')
const { Collection } = require('mongoose')
const passport = require('passport')
const router = express.Router()
const jwt = require('jsonwebtoken');
const googleTokenModel = require('../models/googleAuthToken');
const googleToken = require('../models/googleAuthToken');
const newestProf = require('../models/prof');

// @desc    Auth with Google
// @route   GET /auth/google

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] })) 



  // @desc    Google auth callback
  // @route   GET /auth/google/callback
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {

      // jwt token generate , save in Collection,
      // if logged out delete token from Collection
      // check in middleware if token is present in collection for accessing every routes, if not  send invalid token error
      // Generate a JWT token

      console.log(req.user, "req userrrrrr",req.user.googleId)
      if(!req.user.googleId){
        res.redirect(`https://shikshaml.com/login?plainUser=${true}`)
      }

      const googleId = req.user.googleId

      // const payload = { internalToken: process.env.GOOGLE_AUTH_TOKEN };
      const payload = { clientId: googleId };
      const cookieToken = jwt.sign({ data: payload }, process.env.SECRET_KEY, {
        expiresIn: '24h',
      });

      const googleLoginRecord = new googleToken({
        userId: googleId,
        googleToken: cookieToken,
      });
      console.log(googleLoginRecord, "token saved")
      const ans = googleLoginRecord.save();

      let profileCheck = await newestProf.findOne({ id: googleId })

      console.log(profileCheck, "completed")
      if (!profileCheck.completed) {
        // res.cookie('googleToken', cookieToken, { httpOnly: true });
        res.redirect(`https://shikshaml.com/profile?gToken=${cookieToken}`)
      }
      else {
        res.cookie('googleToken', cookieToken, { httpOnly: true });
        res.redirect(`https://shikshaml.com/dashboard?gToken=${cookieToken}`)
      }

    }
  )

// @desc    Logout user
// @route   /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) { return next(error) }
    res.redirect('/')
  })
})

module.exports = router