const path = require('path');
const express = require('express');
const multer = require('multer');
const _ = require('lodash');

const prof = require('../models/prof');
const router = express.Router();
//profile upload with image
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');
const Credits = require('../models/credits');
const OrganizationProfile = require('../models/orgProfile');
const { HttpCodes, Messages } = require('../helpers/static');
const { Error } = require('mongoose');

// Generate a random image code for each post call
function generateImageCode() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
let imageName=null
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './profile/images');
    },
    filename(req, file, cb) {
        const imageCode = generateImageCode();
        imageName=Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

console.log(imageCode,imageName,"generateImageCode")
        cb(
            null,
            `image-${imageCode}${path.extname(file.originalname)}`
        );
        req.imageCode = imageCode; // Save the generated image code in the request object
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

router.post('/', authMiddleware, loginCheck, async (req, res) => {
    try {
      const {
        fullname,
        dob,
        gender,
        grade,
        otherGrade,
        school,
        educationBoard,
        otherBoard,
        city,
        referralCode,
        areaOfInterest,
        completed,
        state,
        parentEmail,
        parentNo,
        parentName,
        image,
        codeUsed,
        tokenBalance,
        pincode,
      } = req.body;
  
      let schoolCode, coachingCodes;
  
      if (referralCode) {
        const creditsData = await Credits.findOne({ myReferralCode: referralCode });
        if (!creditsData) {
          return res.status(HttpCodes.BadRequest).json({
            success: false,
            message: Messages.ReferralCodeIncorrect,
          });
        }
  
        const idFromCredits = creditsData.id;
        const publisherData = await OrganizationProfile.findOne({ userId: idFromCredits });
  
        if (
          !publisherData ||
          (publisherData.type !== 'publisher' &&
            publisherData.type !== 'school' &&
            publisherData.type !== 'coaching')
        ) {
          return res.status(HttpCodes.BadRequest).json({
            success: false,
            message: Messages.ReferralCodeIncorrect,
          });
        }
      }
  
      if (codeUsed) {
        schoolCode = codeUsed.school && codeUsed.school.code ? codeUsed.school.code : null;
        coachingCodes = codeUsed.coachings && codeUsed.coachings.length? codeUsed.coachings.map((coaching) => coaching.code)
            : [];
      }

      if (schoolCode) {
        const publisherData = await OrganizationProfile.findOne({ publisher_code: schoolCode });
        if (!publisherData || publisherData.type !== "school") {
          return res.status(HttpCodes.BadRequest).json({
            success: false,
            message: Messages.InvalidSchoolCode,
          });
        }
      }
  
      if (coachingCodes) {
        if (coachingCodes.length > 3) {
          return res.send({
            success: false,
            message: Messages.CoachingLimitExceeded,
          });
        }
  
        for (const coachingCode of coachingCodes) {
          const publisherData = await OrganizationProfile.findOne({ publisher_code: coachingCode });
  
          if (!publisherData || publisherData.type !== "coaching") {
            return res.send({
              success: false,
              message: Messages.InvalidCoachingCode,
            });
          }
        }
  
        const id = req.decoded_token.clientId;
  
        let update = {
          id,
          fullname,
          dob,
          gender,
          grade,
          otherGrade,
          school,
          educationBoard,
          otherBoard,
          city,
          state,
          referralCode,
          areaOfInterest,
          completed,
          parentNo,
          parentName,
          parentEmail,
          image,
          codeUsed,
          tokenBalance,
          pincode,
        };
        update = _.omitBy(update, _.isNil);
        update = _.omitBy(update, x => x === "null");
        update = _.omitBy(update, x => x === "undefined");
  
        const filter = { id };
  
        // Use findOneAndUpdate to insert or update the record based on the filter
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const savedProfile = await prof.findOneAndUpdate(filter, update, options);
  
        // if (referralCode) {
        //     // Find the record with the given refCode
        //     const creditsRecord = await Credits.findOne({ myReferralCode: referralCode });
  
        //     if (!creditsRecord) {
        //         return res.status(HttpCodes.BadRequest).json({ success: false, error: Messages.NoReferralCode });
        //     }
        //     const isUserIdPresent = creditsRecord.referredIds.some((referredId) => referredId.userId === id);
  
        //     console.log(isUserIdPresent);
  
        //     if (!isUserIdPresent) {
        //         console.log('not present');
        //         creditsRecord.referredIds.push({
        //             userId: id,
        //             creditsScore: 130,
        //         });
        //     }
  
        //     console.log('userId record already exists');
  
        //     // Update the record with a sample userId and credit points
        //     const ans = creditsRecord.referredIds;
        //     console.log(ans, 'anss');
        // }
  
        res.send({
          success: true,
          message: Messages.DataUpdateSuccess,
          profile: savedProfile,
        });
      }
    } catch (error) {
    console.log(error);
      res.status(HttpCodes.InternalServerError).json({
        success: false,
        message: Messages.InternalServerError,
      });
    }
  });
  

module.exports = router;
