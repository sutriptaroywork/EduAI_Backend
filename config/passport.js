const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/user')
const oAuth = require('../models/oAuth')
const subNew = require('../models/subscriptionNew')
const Credits = require('../models/credits')
const newestProf = require('../models/prof')
const newUser2 = require('../models/newUser2')

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // callbackURL: '/backend/auth/google/callback',
        callbackURL:'https://shikshaml.com/backend/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value, // Access the first email in the emails array
        }
        console.log(profile, "profile")
        console.log(accessToken, "accessToken")
        console.log(refreshToken, "refreshToken")
        console.log(profile.emails[0].value, "profile.emails[0].value,")

        // let ans3 = await oAuth.deleteOne({ googleId: profile.id })
        // let ans2 = await Credits.deleteOne({ id: profile.id })
        // let ans1 = await subNew.deleteOne({ id: profile.id })

        try {
          let user = await User.findOne({ googleId: profile.id })
          let plainUser = await newUser2.findOne({ email: profile.emails[0].value })
          
          if (user || plainUser) {
            if(plainUser){
              done(null, plainUser)
            }else{
              done(null, user)
            }
            console.log("exists ",user,plainUser)

          } else {
            console.log("create ")
            const result = new User({ googleId: profile.id, displayName: profile.displayName, firstName: profile.name.givenName,lastName: profile.name.familyName});
            const newResult = await result.save();
            console.log(newResult, "new")
         
            // Create a new Credits document for the registering user
            function generateReferralCode() {
              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              let referralCode = '';

              for (let i = 0; i < 6; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                referralCode += characters.charAt(randomIndex);
              }

              return referralCode;
            }
            const uniqueReferralCode = generateReferralCode();
            console.log(uniqueReferralCode, "unique ref");
            const newCreditsRecord = new Credits({
              id: profile.id,
              myReferralCode: uniqueReferralCode,
              referredIds: [] // Initially empty, you can fill it later
            });
            // Save the document to the database
            const savedRecord = await newCreditsRecord.save();
            console.log(savedRecord, "savedRecord ");


            // Create a new Subscription document for the registering user
            const currentDate = new Date()
            const expiryDate = new Date(currentDate);
            expiryDate.setDate(currentDate.getDate() + 30);

            const newSubscription = new subNew({
              status: 'active',
              planName: 'Introductory Plan',
              startDate: new Date(),
              expiredDate: expiryDate,// Calculate the expiration date based on the duration,
              duration: 30, // Example: 30 days
              paymentMethod: 'None',
              id: profile.id
            });
            const savedSubscription = await newSubscription.save();
            console.log('savedSubscription', savedSubscription);

            const Profile = new newestProf({
              id: profile.id,
            });
            const savedProfile = await Profile.save();
            console.log('savedProfile', savedProfile);

            done(null, newResult)
          }
        }
        catch (err) {
          console.error(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    console.log(user.id, "user id")
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    const ans = await User.findById(id)
    console.log(ans, "<<<<<ans")
    User.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err, null));
  });
}