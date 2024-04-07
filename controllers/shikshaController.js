const { HttpCodes, Messages } = require('../helpers/static');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Menu = require('../models/exploreMenu');
const History = require('../models/history');
const Content = require('../models/content');
const quotes = require('../models/quotes');
const moment = require('moment');
const axios = require('axios')
const { ObjectId } = require('mongodb');

const ResetPass = require('../models/resetpassword');
const subscription = require('../models/subscribe');
const Note = require('../models/stickynotes');
const User = require("../models/user")
const HoursSpent = require('../models/hoursSpent'); // Import your HoursSpent model
const Todo = require('../models/todo'); //
const Reminder = require('../models/reminder'); //

const newUser2 = require('../models/newUser2'); //
const verifyOtp = require('../models/verifyOtp'); //
const { verify, JsonWebTokenError, decode } = require('jsonwebtoken');

const nodemailer = require('nodemailer');
const twilio = require('twilio');
var smtpTransport = require('nodemailer-smtp-transport');
const path = require('path');
var ejs = require("ejs");
const { EventListInstance } = require('twilio/lib/rest/taskrouter/v1/workspace/event');
const OverallPerformance = require('../models/overallperformance');
const Notification = require('../models/notifications');
const Credits = require('../models/credits');
const subNew = require('../models/subscriptionNew');
const prof = require('../models/prof');
const events = require('../models/events');
const TokenModel = require('../models/authenticationToken');
const InstituteModel = require('../models/institute');
const menuSubmenuModel = require('../models/menuSubmenuModel');
const googleToken = require('../models/googleAuthToken');
const qna = require('../models/submitQnA');
const newestProf = require('../models/prof');
const PopularContent = require('../models/popular');
const weeklyHoursSpent = require('../models/weeklyHoursSpent');
const OrganizationProfile = require('../models/orgProfile');
const invalidAuthToken = require('../models/invalidAuthToken')

const login = async (req, res, next) => {
  try {
    console.log('\nlogin on line 48')
    const { email, password, mobile } = req.body;

    // Check if the required fields are present
    if ((!email && !mobile) || !password) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }
    let existingClient;
    if (email) {
      existingClient = await newUser2.findOne({ email });
    }

    else if (mobile) {
      existingClient = await newUser2.findOne({ mobile });

    }
    if (!existingClient) {

      return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });

    }

    // Check if the provided password matches the stored password
    const passwordMatch = await bcrypt.compare(password, existingClient.password);

    if (!passwordMatch) {

      return res.status(HttpCodes.BadRequest).json({ message: Messages.IncorrectPassword });
    }

    // Generate a JWT token
    const payload = { clientId: existingClient._id };
    const token = jwt.sign({ data: payload }, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });

    // Create a new record for login
    const authenticateToken = new TokenModel({
      userId: existingClient._id,
      token: token,
    });

    const ans = await authenticateToken.save();


    // Check if there's an existing record with the same userId and no logout time
    const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
      userId: existingClient._id,
      logoutTime: null, // Indicates no logout time set
    });

    if (!existingHoursSpentRecord) {
      // Create a new record for login
      const hoursSpentRecord = new weeklyHoursSpent({
        userId: existingClient._id,
        loginTime: new Date(),
        logoutTime: null,
      })


      // if (existingHoursSpentRecord) {
      //   console.log("do nothing")
      // } else {
      //   // Create a new record for login
      //   const hoursSpentRecord = new weeklyHoursSpent({
      //     userId: existingClient._id,
      //     loginTime: new Date(),
      //     logoutTime: null,
      //   });

      const hoursAns = await hoursSpentRecord.save();

      console.log(hoursAns, "hoursAns")
    }
    const profile = await prof.findOne({ id: existingClient._id });

    console.log(profile?.completed, "profile");

    return res.status(HttpCodes.Ok).json({
      userToken: token,
      success: true,
      message: Messages.DataRetrievedSuccess,
      completed: profile?.completed || false,
    });
  } catch (err) {
    console.error(err);
    return res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};


const logout = async (req, res) => {
  try {
    // Extract the userId and token from the request or wherever you store them
    const userId = req.decoded_token.clientId;

    let bearer_token = req.headers['authorization'];
    let token = bearer_token.split(" ")[1];

    // Find the existing record with the same userId, and no logout time
    const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
      userId: userId,
      logoutTime: null, // Indicates no logout time set
    });

    if (existingHoursSpentRecord) {
      // Update the existing record with the logout time
      const loginTime = existingHoursSpentRecord.loginTime;

      // Check if login date and current date both are falling on the same date
      if (loginTime.toISOString().split('T')[0] !== new Date().toISOString().split('T')[0]) {
        // Set logout time to 23:59:59:999 of the same date as login
        existingHoursSpentRecord.logoutTime = new Date(loginTime);
        existingHoursSpentRecord.logoutTime.setHours(23, 59, 59, 999);
        await existingHoursSpentRecord.save();

        // Create a new record for the next day with login time as 00:00:00:000 and logout time as current time
        const newRecord = new weeklyHoursSpent({
          userId: userId,
          loginTime: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'),
          logoutTime: new Date(),
        });

        await newRecord.save();
      } else {
        // Same day, update the existing record with the current logout time
        existingHoursSpentRecord.logoutTime = new Date();
        await existingHoursSpentRecord.save();
      }

      // // Find and delete the record using the token
      const deletedRecord = await TokenModel.findOneAndDelete({ userId: userId, token: token });

      if (!deletedRecord) {
        const deleteGoogleToken = await googleToken.findOneAndDelete({ googleToken: token });
        if (!deleteGoogleToken) {
          return res.status(HttpCodes.NotFound).json({ message: Messages.NoRecordFound });
        }
      }

      return res.json({ message: Messages.SignedOutSuccess });
    } else {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }
  } catch (err) {
    console.error(err);
    return res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

// const logout = async (req, res) => {
//   try {
//     // Extract the userId and token from the request or wherever you store them

//     const userId = req.decoded_token.clientId;

//     console.log(userId, "advance user")
//     let bearer_token = req.headers['authorization'];
//     let token = bearer_token.split(" ")[1];

//     console.log(token, "token")

//     // Find the existing record with the same userId and token, and no logout time
//     const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
//       userId: userId,
//       logoutTime: null, // Indicates no logout time set
//     });

//     if (existingHoursSpentRecord) {
//       // Update the existing record with the logout time
//       existingHoursSpentRecord.logoutTime = new Date();
//       await existingHoursSpentRecord.save();

//       // const ans = await HoursSpent.find({})
//       // console.log(ans, "ans")

//       // Find and delete the record using the token

//       const deletedRecord = await TokenModel.findOneAndDelete({ userId: userId, token: token });

//       if (!deletedRecord) {
//         const deleteGoogleToken = await googleToken.findOneAndDelete({ googleToken: token });
//         if (!deleteGoogleToken) {
//           return res.status(HttpCodes.NotFound).json({ message: 'Record not found' });
//         }
//       }

//       return res.json({ message: 'Logged out successfully' });
//     } else {
//       return res.status(HttpCodes.NotFound).json({ message: 'Matching login record not found' });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
//   }
// };

// initiate subscription model for introductory plan for registering user


const register = async (req, res, next) => {

  function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
  }

  try {
    let userId;
    const { email, mobile, password } = req.body;

    const refcode = req.query.refcode
    // Check if the client already exists
    let existingClient;

    if (email) {
      existingClient = await newUser2.findOne({ email });
    } else if (mobile) {
      existingClient = await newUser2.findOne({ mobile });
    }

    if (existingClient) {
      return res.status(HttpCodes.Conflict).json({ success: false, message: Messages.UserAlreadyExists });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new client document
    const newClient = new newUser2({ email, mobile, password: hashedPassword });
    const ans = await newClient.save();

    // Example ObjectId
    const objectId = new ObjectId(ans._id);

    // Get the string representation of the ObjectId
    userId = objectId.toString();


    const uniqueReferralCode = generateReferralCode();

    // Create a new Credits document for the registering user
    const newCreditsRecord = new Credits({
      id: userId,
      myReferralCode: uniqueReferralCode,
      referredIds: [] // Initially empty, you can fill it later
    });

    // Save the document to the database
    const savedRecord = await newCreditsRecord.save();

    // insert refcode in registering users profile
    const Profile = new newestProf({
      id: userId,
      referralCode: '',
    });

    // const savedProfile = await Profile.save();
    await Profile.save();

    if (refcode) {
      // // const savedProfile = await Profile.save();
      await newestProf.findOneAndUpdate({ id: new ObjectId(userId) }, { referralCode: refcode }, { new: true });

      // Find the record with the given refCode
      const creditsRecord = await Credits.findOne({ myReferralCode: refcode });

      if (!creditsRecord) {
        return res.status(HttpCodes.NotFound).json({ error: `credit record ${Messages.NoDataFound}` });
      }

      // const orgData = await OrganizationProfile.findOne({ userId: creditsRecord.id })
      // if (orgData) {
      //   let orgType = 'publisher'
      //   if (orgData.type) {
      //     orgType = orgData.type
      //   }
      //   let codeUsed = [{
      //     [orgData.type]: {
      //       code: refcode
      //     }
      //   }];

      //   if (orgData.type === 'coaching') {
      //     codeUsed = [{
      //       [orgData.type]: [{
      //         code: refcode
      //       }]
      //     }];
      //   }

      //   savedProfile.codeUsed = codeUsed;
      //   savedProfile.save();
      // }

      // Update the record with a sample userId and credit points
      creditsRecord.referredIds.push({ userId: userId, creditsScore: 130 });
      creditsRecord.save();
    }
    // for every new user activate introductory plan

    const currentDate = new Date()
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 30);

    const newSubscription = new subNew({
      status: 'active',
      planName: 'Introductory Plan',
      startDate: new Date(),
      expiredDate: expiryDate,// Calculate the expiration date based on the duration,
      duration: 30, // Example: 30 days
      paymentMethod: 'Credit Card',
      id: userId
    });
    newSubscription.save();

    res.status(HttpCodes.Created).json({
      success: true,
      message: Messages.RegistrationSuccess,
      // token,
      // userId: newClient._id, // Include the user's ID in the response
    });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ success: false, message: Messages.InternalServerError });
  }
};


// searches for content based on keyword else return the history of the user as recently watched content
// const search = async (req, res, next) => {
//   const keyword = req.query.keyword;
//   const userId = req.decoded_token.clientId;


//   try {
//     if (keyword) {
//       const searchResults = await Content.find({
//         $or: [
//           { title: { $regex: keyword, $options: 'i' } },
//         ]
//       });
//       res.json(searchResults);
//     } else {
//       const [recentlyViewed, popularNow] = await Promise.all([
//         History.find({ userId: userId })
//           .sort({ viewedAt: -1 }) // Sort by viewedAt in descending order (recent first)
//           .limit(10),

//         PopularContent.find()
//           .sort({ viewCount: -1 }) // Sort by viewCount in descending order
//           .limit(10),
//       ]);

//       res.json({ recentlyViewed, popularNow }); // Return the entire recentlyViewed item
//     }
//   } catch (err) {
//     res.status(HttpCodes.InternalServerError).json({ error: 'Error fetching content' });
//   }
// };
const search = async (req, res, next) => {
  const keyword = req.query.keyword;
  const userId = req.decoded_token.clientId;

  try {
    if (keyword) {
      const searchResults = await Content.find({
        $or: [{ title: { $regex: keyword, $options: 'i' } }],
      });
      res.json(searchResults);
    } else {
      const [recentlyViewed, popularNow] = await Promise.all([
        History.find({ userId: userId })
          .sort({ viewedAt: -1 }) // Sort by viewedAt in descending order (recent first)
          .limit(10),

        PopularContent.aggregate([
          {
            $group: {
              _id: "$assigned_code",
              uniqueUsers: { $addToSet: "$userId" },
              content: { $first: "$$ROOT" },
            },
          },
          {
            $project: {
              _id: 0,
              assigned_code: "$_id",
              uniqueUserCount: { $size: "$uniqueUsers" },
              content: 1,
            },
          },
          {
            $sort: { uniqueUserCount: -1 },
          },
          {
            $limit: 5,
          },
        ]),
      ]);

      const formattedPopularNow = popularNow.map(item => item.content);



      res.json({ recentlyViewed, popularNow: formattedPopularNow });
    }
  } catch (err) {
    res.status(HttpCodes.InternalServerError).json({ error: Messages.ErorrFetchingData });
  }
};

const advsearch = async (req, res, next) => {
  const filter = req.body.filter;
  const keyword = req.query.keyword;

  const andConditions = []
  if (Object.keys(filter).length > 0) {
    const filterList = Object.keys(filter)
    for (let i = 0; i < filterList.length; i++) {
      const category = filterList[i]
      andConditions.push({"categories.category": { $regex: new RegExp(category, "i") }})
      const valueType = typeof filter[category]
      if (valueType === "string") {
        andConditions.push({"categories.subcategories": { $in: new RegExp(filter[category], "i") }})
      } else {
        andConditions.push({"categories.subcategories": { $in: filter[category].map(subcategory => new RegExp(subcategory, "i")) }})
      }
    }
  }

  // Build the $and array dynamically
  // const andConditions = Object.keys(filter).map(category => ({
  //   "categories.category": { $regex: new RegExp(category, "i") },
  //   "categories.subcategories": { $in: filter[category].map(subcategory => new RegExp(subcategory, "i")) },
  // }));

  try {
    const filterObj = {}
    if (andConditions.length > 0) {
      filterObj["$and"] = andConditions
    }
    if (keyword) {
      filterObj["$or"] = [
        { title: { $regex: new RegExp(keyword, "i") } },
        { keywords: { $regex: new RegExp(keyword, "i") } },
      ]
    }
    const searchResults = await Content.find(filterObj);
    console.log("searchResults data => ", searchResults);
    res.json(searchResults);
  } catch (err) {
    console.error("Error:", err);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.ErorrFetchingData, details: err.message });
  }
}

// const advsearch = async (req, res, next) => {
//   try {
//     const { filter, schoolCode, coachingCode } = req.body;
//     const keyword = req.query.keyword;
//     let responseObj = {
//       success: false,
//       message: Messages.NoDataFound,
//       data: [],
//     };

//     const getPublicationCodes = async() => {
//       const organizations = await OrganizationProfile.find();
//       return organizations
//         .filter((item) => item.type === 'publisher')
//         .map((item) => item.publisher_code);
//     }

//     const findContents = async (queryConditions, limitValue) => {
//       const filteredContent = limitValue
//         ? await Content.find(queryConditions).limit(limitValue)
//         : await Content.find(queryConditions);
    
//       if (!filteredContent || filteredContent.length === 0) {
//         return res.send(responseObj);
//       }
    
//       return res.send({
//         success: true,
//         message: Messages.DataRetrievedSuccess,
//         data: filteredContent,
//       });
//     };
    

//     //If filter is absent in request body
//     if(!filter){
//       const publicationCodes = await getPublicationCodes()
//       return await findContents({
//         publisher_code:{$in:publicationCodes},
//       },20)
//     }

//     const andConditions = Object.keys(filter).map((category) => ({
//       'categories.category': { $regex: new RegExp(category, 'i') },
//       'categories.subcategories': {
//         $in: filter[category].map((subcategory) => new RegExp(subcategory, 'i')),
//       },
//     }));


//     //if school code is present in request body
//     if (schoolCode) {
//       const organization = await OrganizationProfile.findOne({ publisher_code: schoolCode });
//       if (!organization || organization.type !== 'school') {
//         return res.send(responseObj);
//       }

//       return findContents({
//         $and: [...andConditions, { publisher_code: schoolCode }],
//         $or: [
//           { title: { $regex: new RegExp(keyword, 'i') } },
//           { keywords: { $regex: new RegExp(keyword, 'i') } },
//         ],
//       });
//     }

//     //if coaching code is present in request body
//     if (coachingCode) {
//       const organization = await OrganizationProfile.findOne({ publisher_code: coachingCode });
//       if (!organization || organization.type !== 'coaching') {
//         return res.send(responseObj);
//       }

//       return findContents({
//         $and: [...andConditions, { publisher_code: { $in: coachingCode } }],
//         $or: [
//           { title: { $regex: new RegExp(keyword, 'i') } },
//           { keywords: { $regex: new RegExp(keyword, 'i') } },
//         ],
//       });
//     }

//     //if no school or coaching code is present in request body
//     if (!schoolCode && !coachingCode) {
//       console.log("HITTTT");
//       const publicationCodes = await getPublicationCodes()
//       return findContents({
//         $and: [...andConditions, { publisher_code: { $in: publicationCodes } }],
//         $or: [
//           { title: { $regex: new RegExp(keyword, 'i') } },
//           { keywords: { $regex: new RegExp(keyword, 'i') } },
//         ],
//       });
//     }
//   } catch (error) {
//     res.status(HttpCodes.InternalServerError).json({
//       error: Messages.InternalServerError,
//     });
//   }
// };


const menuSubMenu = async (req, res) => {
  try {
    const a = await menuSubmenuModel.find({});
    res.json(a[0]);
  }
  catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError
    });
  }
}

//fetches events of the user
const readEvents = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const readEvents = await events.find({ id: userId });
    res.status(HttpCodes.Ok).json(readEvents);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.ErorrFetchingData });
  }
}
//deletes the users event with the given eventId
const deleteEvents = async (req, res) => {
  try {
    const eventId = req.params.id; // Get the event ID from the URL parameters

    // Use the `findOneAndDelete` method to find and delete the event by its ID
    const deletedEvent = await events.findOneAndDelete({ _id: eventId });

    if (!deletedEvent) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }

    return res.status(HttpCodes.Ok).json({ message: Messages.DataDeletedSuccess });
  } catch (error) {
    console.error(error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.DeleteFail });
  }
}

// fetches  greeting
const greetings = async (req, res, next) => {
  try {
    const count = await quotes.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomQuote = await quotes.findOne().skip(randomIndex);

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let greeting = '';
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    res.json({
      greeting,
      time: currentTime.toLocaleTimeString(),
      quote: randomQuote.quoteText,
      author: randomQuote.author,
    });
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};


//read credits
const credits = async (req, res) => {

  // / Function to calculate the sum of creditsScore
  const calculateTotalCreditsScore = (creditsRecord) => {
    if (!creditsRecord || !creditsRecord.referredIds || creditsRecord.referredIds.length === 0) {
      return 0; // Default creditsScore if no referredIds or empty array
    }

    // Sum up the creditsScore values in the referredIds array
    const totalCreditsScore = creditsRecord.referredIds.reduce((total, referredId) => {
      return total + referredId.creditsScore;
    }, 0);

    return totalCreditsScore;
  };
  try {
    const userId = req.decoded_token.clientId;
    if (!userId) {
      return res.status(HttpCodes.BadRequest).json({ error: Messages.BadRequest });
    }

    const userCredits = await Credits.findOne({ id: userId });

    if (!userCredits) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.UserNotFound });
    }

    const totalCreditsScore = calculateTotalCreditsScore(userCredits);

    return res.status(HttpCodes.Ok).json({ userCredits, totalCredits: totalCreditsScore });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};


// const hoursSpent = async (req, res) => {
//   try {
//     const userId = req.query.userId;
//     // Get the current date
//     const currentDate = new Date();

//     // Calculate the start and end of the current day
//     const startOfDay = new Date(currentDate);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(currentDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     // Find records for the user with the provided userId and within the current day
//     const records = await weeklyHoursSpent.find({
//       userId: userId,
//       loginTime: { $gte: startOfDay, $lte: endOfDay },
//     }).sort({ loginTime: 1 }); // Sort records by login time in ascending order

//     let totalMilliseconds = 0;

//     // Calculate the total time spent for the same day
//     for (let i = 0; i < records.length; i++) {
//       const record = records[i];

//       // Check if the record has both login and logout times
//       if (record.loginTime && record.logoutTime) {
//         // Calculate the time difference in milliseconds
//         const timeDifference = record.logoutTime - record.loginTime;
//         totalMilliseconds += timeDifference;
//       }
//     }

//     // Convert total time to hours and minutes
//     const totalHours = Math.floor(totalMilliseconds / 3600000);
//     const totalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000);

//     return res.json({
//       totalHours: totalHours,
//       totalMinutes: totalMinutes,
//     });
//   } catch (error) {
//     console.error('Error calculating total time spent:', error);
//     res.status(HttpCodes.InternalServerError).json({ error: 'Failed to calculate total time spent' });
//   }
// };

// const overallPerformance = async (req, res) => {
//   try {
//     // const userId = req.query.userId;
//     const userId = req.decoded_token.clientId;

//     // Fetch the user's overall performance record
//     const performance = await OverallPerformance.findOne({
//     });

//     if (!performance) {
//       return res.status(HttpCodes.NotFound).json({ message: 'Performance data not found for this user.' });
//     }

//     // Calculate right and wrong answer percentages
//     const totalQuestions = performance.attemptedQuestions;
//     const rightAnswerPercentage = (performance.rightAnswers / totalQuestions) * 100;
//     const wrongAnswerPercentage = (performance.wrongAnswers / totalQuestions) * 100;

//     res.json({
//       rightAnswerPercentage,
//       wrongAnswerPercentage,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
//   }
// }






// for time passing to next day its giving in minus like -17 records has value 20 to 03
// const hoursSpent = async (req, res) => {
//   async function searchRecords(userId, daysInRange) {
//     try {
//       const result = {};

//       for (const dayInfo of daysInRange) {
//         const searchDate = new Date(dayInfo.date);

//         const records = await weeklyHoursSpent.find({
//           userId: userId,
//           loginTime: {
//             $gte: new Date(searchDate),
//             $lt: new Date(searchDate.setDate(searchDate.getDate() + 1)),
//           },
//         });

//         // Calculate the total logged-in time for the day
//         const totalLoggedInTime = records.reduce((sum, record) => {
//           if (record.logoutTime) {
//             const loginMoment = moment(record.loginTime);
//             const logoutMoment = moment(record.logoutTime);
//             const duration = moment.duration(logoutMoment.diff(loginMoment));
//             return sum + duration.asHours(); // add the logged-in hours to the sum
//           } else {
//             return sum;
//           }
//         }, 0);

//         // Set the result for the day
//         result[dayInfo.day] = totalLoggedInTime.toFixed(0);

//         console.log(`Records for ${dayInfo.day}:`, records);
//       }

//       console.log('Total Logged-in Time:', result);
//       return result;
//     } catch (err) {
//       console.error('Error searching records:', err);
//     }
//   }

//   try {
//     const userId =`123`;
//     // const userId = req.decoded_token.clientId;
//     console.log(userId, "userIduserIduserIduserIduserIduserId");

//     const today = new Date();
//     const currentDayIndex = today.getUTCDay();
//     const mondayIndex = 1; // Monday

//     // Calculate the difference between the current day and Monday
//     let dayDifference = currentDayIndex - mondayIndex;
//     if (dayDifference < 0) {
//       dayDifference += 7; // Ensure a positive difference
//     }

//     // Calculate the starting date (Monday) for the range
//     const startDate = new Date(today);
//     startDate.setUTCDate(today.getUTCDate() - dayDifference);

//     const daysInRange = [];

//     for (let i = 0; i < 7; i++) {
//       const currentDate = new Date(startDate);
//       currentDate.setUTCDate(startDate.getUTCDate() + i);

//       const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getUTCDay()];
//       const formattedDate = currentDate.toISOString().split('T')[0];
//       daysInRange.push({ day: dayName, date: formattedDate });
//     }

//     const result = await searchRecords(userId, daysInRange);
//     res.json({ message: "successful", data: result });
//     console.log(daysInRange, "daysInRange");
//   } catch (err) {
//     console.error('Error:', err);
//     res.json({ message: "error fetching hours spent" });
//   }
// }

// working for current day but not distributing to next day

const hoursSpent = async (req, res) => {
  async function searchRecords(userId, daysInRange) {
    try {
      const result = {};

      for (const dayInfo of daysInRange) {
        const searchDate = new Date(dayInfo.date);

        const records = await weeklyHoursSpent.find({
          userId: userId,
          loginTime: {
            $gte: new Date(searchDate),
            $lt: new Date(searchDate.setDate(searchDate.getDate() + 1)),
          },
        });

        // Calculate the total logged-in time for the day
        let totalLoggedInTime = 0;

        for (const record of records) {
          if (record.logoutTime) {
            const loginMoment = moment(record.loginTime);
            const logoutMoment = moment(record.logoutTime);

            if (logoutMoment.isAfter(loginMoment)) {
              const duration = moment.duration(logoutMoment.diff(loginMoment));
              totalLoggedInTime += duration.asHours(); // add the logged-in hours to the sum
            }
          }
        }

        // Set the result for the day
        result[dayInfo.day] = totalLoggedInTime.toFixed(0);

        console.log(`Records for ${dayInfo.day}:`, records);
      }

      console.log('Total Logged-in Time:', result);
      return result;
    } catch (err) {
      console.error('Error searching records:', err);
    }
  }

  try {
    const userId = req.decoded_token.clientId;

    const today = new Date();
    const currentDayIndex = today.getUTCDay();
    const mondayIndex = 1; // Monday

    // Calculate the difference between the current day and Monday
    let dayDifference = currentDayIndex - mondayIndex;
    if (dayDifference < 0) {
      dayDifference += 7; // Ensure a positive difference
    }

    // Calculate the starting date (Monday) for the range
    const startDate = new Date(today);
    startDate.setUTCDate(today.getUTCDate() - dayDifference);

    const daysInRange = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setUTCDate(startDate.getUTCDate() + i);

      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getUTCDay()];
      const formattedDate = currentDate.toISOString().split('T')[0];
      daysInRange.push({ day: dayName, date: formattedDate });
    }

    const result = await searchRecords(userId, daysInRange);
    res.json({ message: Messages.DataRetrievedSuccess, data: result });
    console.log(daysInRange, "daysInRange");
  } catch (err) {
    console.error('Error:', err);
    res.json({ message: Messages.InternalServerError });
  }
}


const overallPerformance = async (req, res) => {

  function calculateUserScore(userRecords) {
    // Initialize counters for total attempted and correct across all levels
    let totalAttempted = 0;
    let totalCorrect = 0;

    // Iterate over all records and accumulate attempted and correct values
    userRecords.forEach(record => {
      totalAttempted += record.easy.attempted + record.medium.attempted + record.hard.attempted;
      totalCorrect += record.easy.correct + record.medium.correct + record.hard.correct;
    });

    // Calculate the percentage of the user's score
    const percentageScore = (totalCorrect / totalAttempted) * 100 || 0;

    return {
      percentageScore,
    };
  }

  try {
    const userId = req.decoded_token.clientId;

    // Fetch all user records from MongoDB
    const userRecords = await qna.find({ usercode: userId });
    console.log(userRecords, "userRecords")
    // Check if any user records are found
    if (!userRecords || userRecords.length === 0) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.UserNotFound });
    }

    // Calculate overall user score using the provided function
    const result = calculateUserScore(userRecords);

    return res.json({ data: parseFloat(result.percentageScore.toFixed(2)) });
  } catch (error) {
    console.error(error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};


//read
const readProfile = async (req, res) => {

  const userId = req.decoded_token.clientId;

  try {

    // Find the user's profile by their ID
    const profile = await prof.findOne({ id: userId });
    if (!profile) {
      return res.status(HttpCodes.NotFound).json({
        status: 404,
        success: false,
        message: Messages.UserNotFound,
      });
    }

    const tokenUsage = profile.tokenUsage
    totalUsageTillDate = tokenUsage.reduce((total, item) => total + item.tokensUsed, 0);
    const userProfile = {
      ...profile.toObject(),
      tokenBalance: Math.round(profile.tokenBalance),
      totalUsageTillDate
    }

    res.status(HttpCodes.Ok).json(userProfile);
  } catch (err) {
    res.status(HttpCodes.InternalServerError).json({
      status: 500,
      success: true,
      message: Messages.InternalServerError,
    });
  }
}

// recently Viewed
const recentlyViewed = async (req, res) => {
  const userId = req.decoded_token.clientId;
  try {
    const recentlyViewed = await History.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(10)
    res.json({ recentlyViewed })
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}


//Reminder crud
const readReminder = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const reminders = await Reminder.find({ userId });
    res.status(HttpCodes.Ok).json(reminders);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}


const addReminder = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const { priority, date, name } = req.body;
    const reminder = new Reminder({ priority, userId, date, name });
    const newReminder = await reminder.save();
    res.status(HttpCodes.Created).json(newReminder);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}

// update a reminder by userID and reminder ID
const updateReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;
    const { priority, date, name } = req.body;
    const updatedReminder = await Reminder.findByIdAndUpdate(
      reminderId,
      { priority, date, name },
      { new: true }
    );
    if (!updatedReminder) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.NoDataFound});
    }
    res.status(HttpCodes.Ok).json(updatedReminder);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}

// Delete a reminder by userID and reminder ID
const deleteReminder = async (req, res) => {
  try {
    const reminderId = req.params.id; // Get the reminder ID from the URL parameters

    // Use the `findByIdAndDelete` method to find and delete the reminder by its ID
    const deletedReminder = await Reminder.findByIdAndDelete(reminderId);

    if (!deletedReminder) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.NoDataFound });
    }

    return res.status(HttpCodes.Ok).json({ message: Messages.DataDeletedSuccess });
  } catch (error) {
    console.error(error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};



// sticky note crud
// create
const stickyNotes = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.decoded_token.clientId;
    const newNote = new Note({ user: userId, content: content });
    const savedNote = await newNote.save();
    res.status(HttpCodes.Created).json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}
// read
const readStickyNotes = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const readEvents = await events.find({ id: userId });
    res.status(HttpCodes.Ok).json(readEvents);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}
const notificationStatus = async (req, res) => {

  const userId = req.decoded_token.clientId;
  const { type, isActive } = req.body;

  try {
    // Check if user already exists
    let notification = await Notification.findOne({ user: userId });

    if (!notification) {
      // If user doesn't exist, create a new notification entry
      notification = new Notification({
        user: userId,
        notifications: [{ type, isActive }],
      });
    } else {
      // If user exists, check if the type already exists
      const existingTypeIndex = notification.notifications.findIndex(
        (notification) => notification.type === type
      );

      if (existingTypeIndex !== -1) {
        // If type exists, update its status
        notification.notifications[existingTypeIndex].isActive = isActive;
      } else {
        // If type doesn't exist, add a new notification entry
        notification.notifications.push({ type, isActive });
      }
    }

    // Save the updated/created notification
    await notification.save();

    res.json({ message: Messages.DataCreatedSuccess });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
}

const readNotificationStatus = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const readEvents = await Notification.find({ user: userId });
    console.log(readEvents, "readEvents")
    res.status(HttpCodes.Ok).json(readEvents);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}

//update
const updateStickyNotes = async (req, res) => {
  try {
    const userId = req.query.userId;
    const noteId = req.query.noteId;

    // Check if the note exists and belongs to the user
    const note = await Note.findOne({ _id: noteId, user: userId });
    if (!note) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.NoDataFound });
    }

    // Update the note's content
    note.content = req.body.content;
    const updatedNote = await note.save();

    res.status(HttpCodes.Ok).json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.DataUpdateFail });
  }
}


//todo crud
const readTodo = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    const todos = await Todo.find({ userId });
    res.status(HttpCodes.Ok).json(todos);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
}

const addTodo = async (req, res) => {
  try {
    const { taskName, status, date } = req.body;
    const userId = req.decoded_token.clientId;
    const todo = new Todo({ taskName, status, date, userId });
    const savedTodo = await todo.save();
    res.status(HttpCodes.Created).json(savedTodo);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
}
const updateTodo = async (req, res) => {
  try {
    const taskId = req.params.id
    const { taskName, status, date } = req.body; // Include taskId to identify the todo item to update

    // Check if the taskId is provided in the request body
    if (!taskId) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.NoDataFound });
    }

    // Check if the todo item with the given taskId exists
    const existingTodo = await Todo.findOne({ _id: taskId });

    if (!existingTodo) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }

    // Update the todo item fields
    existingTodo.taskName = taskName;
    existingTodo.status = status;
    existingTodo.date = date;

    // Save the updated todo item
    const updatedTodo = await existingTodo.save();

    res.status(HttpCodes.Ok).json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.id; // Get the reminder ID from the URL parameters

    // Use the `findByIdAndDelete` method to find and delete the reminder by its ID
    const deletedTodo = await Todo.findByIdAndDelete(todoId);

    if (!deletedTodo) {
      return res.status(HttpCodes.NotFound).json({ error: Messages.NoDataFound });
    }

    return res.status(HttpCodes.Ok).json({ message: Messages.DataDeletedSuccess });
  } catch (error) {
    console.error(error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};



const subscribeEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is provided in the request body
    if (!email) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }

    // Check if the email already exists in the Subscription collection
    const existingSubscription = await subscription.findOne({ email });

    if (existingSubscription) {
      return res.status(HttpCodes.Conflict).json({ message: Messages.DataExist });
    }

    // Create a new subscription
    const newSubscription = new subscription({
      email,
    });

    // Save the subscription to the database
    await newSubscription.save();

    let template = await ejs.renderFile(path.join(__dirname, '..', "/views/subscribe.ejs"));

    const result = await sendSubscribeEmail({
      to: email, subject: `Coming Soon: Your Access to our revolutionary education platform`, html:template  })

    res.status(HttpCodes.Created).json({ message: Messages.DataCreatedSuccess });
  } catch (error) {
    console.error('Error subscribing email:', error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
}


const readSubscription = async (req, res) => {
  const userId = req.decoded_token.clientId;

  try {

    // Find the user's profile by their ID
    const fetchedSubscription = await subNew.findOne({ id: userId });

    if (!fetchedSubscription) {
      return res.status(HttpCodes.NotFound).json({
        status: 404,
        success: false,
        message: Messages.NoDataFound,
      });
    }

    res.status(HttpCodes.Ok).json(fetchedSubscription);
  } catch (err) {
    res.status(HttpCodes.InternalServerError).json({
      status: 500,
      success: true,
      message: Messages.InternalServerError,
    });
  }
}


// Helper function to generate a 6-digit reset token
const generateResetToken = async () => {
  // Generate a 6-digit reset token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

  // Create a new ResetPass document
  const resetPass = new ResetPass({
    token: resetToken,
  });

  // Save the document to the collection
  await resetPass.save();

  return resetToken;
};
// Helper function to create an email transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  secureConnection: false,
  secure: false, // TLS requires secureConnection to be false,
  port: 587,
  auth: {
    user: process.env.EMAIL_TO_SEND_MAILS_FROM,
    pass: process.env.MAIL_PASS
  }
});



const forgotPassword = async (req, res, next) => {
  const { email, phoneNumber } = req.body;

  let token;
  let existingClient;
  if (email) {
    existingClient = await newUser2.findOne({ email });
  }

  else if (phoneNumber) {
    existingClient = await newUser2.findOne({ mobile: phoneNumber });

  }
  if (!existingClient) {

    return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });

  }
  // Generate a reset token
  const resetToken = await generateResetToken();

  // Choose the appropriate method based on user's contact info
  if (email) {
    token = sign({ method: 'email', data: { email: email } }, "yourSecretKey", {
      expiresIn: 60 * 60
    });
    const user = await newUser2.findOne({ email })

    let template = await ejs.renderFile(path.join(__dirname, '..', "/views/forgetpass.ejs"), {
      token: token,
    });

    const result = await sendPasswordResetEmail({ to: email, subject: "Password Reset Request", html: template });

    res.json({ message: Messages.EmailSentSuccess });
  } else if (phoneNumber) {
    // Send SMS with reset token
    const smsClient = twilio(process.env.TWILIO_AUTH_SID, process.env.TWILIO_AUTH_TOKEN);

    token = sign({ method: 'phoneNumber', data: { phoneNumber: phoneNumber } }, "yourSecretKey", {
      expiresIn: 60 * 60
    });
    const resetLink = `https://shikshaml.com/new-password?token=${token}`;

    const smsBody = `To reset your password, click on the following link: ${resetLink}`;

    smsClient.messages
      .create({
        body: smsBody,
        from: process.env.TWILIO_FROM_NUMBER,
        to: `91${phoneNumber}`,
      })
      .then(() => {
        res.status(HttpCodes.Ok).json({ message: Messages.SmsSentSeccess });
      })
      .catch((error) => {
        console.log(error);
        res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
      });
  } else {
    res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
  }
};


const sendPasswordResetEmail = async (mailOption) => {
  try {
    let mail = {};
    mail.from = process.env.EMAIL_TO_SEND_MAILS_FROM;
    mail.subject = mailOption.subject ? mailOption.subject : 'Password Reset Link';
    mail.to = mailOption.to;
    mail.cc = mailOption.cc;
    // mail.cc = process.env.NODE_ENVIRONMENT == 'PROD'? ['paras.shah@midasfintechsolutions.com', 'darshit.shah@midasfintechsolutions.com'] : [];
    if (mailOption.html) {
      mail.html = mailOption.html
    } else if (mailOption.text) {
      mail.text = mailOption.text;
    } else {
      mail.html =
        `<p>Please click on <a href=https://shikshaml.com/new-password?token=${mailOption.token}>link</a>.
     You will be redirected to change password link</p>`
    }
    mail.attachments = mailOption.attachments ? mailOption.attachments : []
    await transporter.sendMail(mail);
  }
  catch (error) {
    console.log(error);
    return error;
  }
}


// const resetPassoword = async (req, res) => {
//   try {
//     const { newPassword } = req.body;

//     const bearerToken = req.headers['token'];
//     if (!bearerToken) {
//       return res.status(HttpCodes.Forbidden).json({ error: 'Missing token' });
//     }

//     let decodedToken;
//     let user;


//     if (bearerToken.startsWith('email')) {
//       decodedToken = jwt.verify(bearerToken, 'email');
//       const email = decodedToken.data.email;
//       user = await newUser2.findOne({ email });
//     } else if (bearerToken.startsWith('phoneNumber')) {
//       decodedToken = jwt.verify(bearerToken, 'phoneNumber');
//       const phoneNumber = decodedToken.data.phoneNumber;
//       user = await newUser2.findOne({ phoneNumber });
//     } else {
//       return res.status(HttpCodes.BadRequest).json({ message: 'Invalid token format' });
//     }

//     if (!user) {
//       return res.status(HttpCodes.NotFound).json({ message: 'User not found' });
//     }

//     // Hash the new password using bcrypt
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update the user's password with the hashed password
//     user.password = hashedPassword;

//     // Save the updated user document
//     await user.save();

//     res.status(HttpCodes.Ok).json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
//   }
// };



// const resetPassoword = async (req, res) => {

//   try {
//     const { newPassword } = req.body;

//     const bearerToken = req.headers['token'];
//     if (!bearerToken) {
//       return res.status(HttpCodes.Forbidden).json({ error: 'Missing token' });
//     }

//     const decodedToken = jwt.verify(token, "email");
//     const email = decodedToken.data.email

//     const user = await newUser2.find({ email });
//     if (!user) {
//       return res.status(HttpCodes.NotFound).json({ message: 'User not found' });
//     }

//     // Hash the new password using bcrypt
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update the user's password with the hashed password
//     user.password = hashedPassword;

//     // Save the updated user document
//     await user.save();

//     res.status(HttpCodes.Ok).json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
//   }
// }
const resetPassoword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    let bearer_token = req.headers['authorization'];
    // console.log(bearer_token);
    if (!bearer_token) {
      console.log("I was in bearer token here");
      res.json({ status: 401, message: Messages.AuthTokenNotFound })
      return
    }
    let bearerToken = bearer_token.split(" ")[1];
    
    const tokenInvalid = await invalidAuthToken.findOne({token:bearerToken})
    if(tokenInvalid){
      return res.status(HttpCodes.Unauthorized).json({ message: Messages.AuthTokenExpired });
    }

    let decodedToken;
    let user;

    try {
      decodedToken = jwt.verify(bearerToken, 'yourSecretKey');
    } catch (error) {
      return res.status(HttpCodes.Unauthorized).json({ message: Messages.Unauthorized });
    }

    const method = decodedToken.method;

    if (method === 'email') {
      const email = decodedToken.data.email;
      console.log(email, "email")
      user = await newUser2.findOne({ email });
    } else if (method === 'phoneNumber') {
      const phoneNumber = decodedToken.data.phoneNumber;
      console.log(phoneNumber, "phoneNumber")

      user = await newUser2.findOne({ mobile: phoneNumber });
    } else {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.InvalidTokenFormat });
    }

    if (!user) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });
    }

    // Hash the new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password with the hashed password
    user.password = hashedPassword;

    // Save the updated user document
    await user.save();

    const invalidTokenData = {
      token: bearerToken
    }
    const invalidTokenInstance = new invalidAuthToken(invalidTokenData);
    await invalidTokenInstance.save()

    res.status(HttpCodes.Ok).json({ message: Messages.PasswordChangedSuccess });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

const sendSubscribeEmail = async (mailOption) => {
  try {
    let mail = {};
    mail.from = process.env.EMAIL_TO_SEND_MAILS_FROM;
    mail.subject = mailOption.subject ? mailOption.subject : 'Welcome to shikshaMl';
    mail.to = mailOption.to;
    mail.cc = mailOption.cc;
    // mail.cc = process.env.NODE_ENVIRONMENT == 'PROD'? ['paras.shah@midasfintechsolutions.com', 'darshit.shah@midasfintechsolutions.com'] : [];
    if (mailOption.html) {
      mail.html = mailOption.html
    } else if (mailOption.text) {
      mail.text = mailOption.text;
    } else {
      mail.html =
        `<p>Welcome to learning with shikshaML </p>`
    }
    mail.attachments = mailOption.attachments ? mailOption.attachments : []
    await transporter.sendMail(mail);
  }
  catch (error) {
    console.log(error);
    return error;
  }
}


// helper api
const instituteSuggestion = async (req, res) => {
  const keyword = req.query.keyword;

  try {
    // Use a regular expression to perform a case-insensitive search for institutes
    const institutes = await Inst.find({ name: { $regex: keyword, $options: 'i' } });

    res.json(institutes);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
}


const readUser = async (req, res) => {
  const userId = req.query.userId
  const userDetails = await User.findOne({ _id: userId }).select('-password');; // Use findOne to get a single user by their ID
  res.send(userDetails)
}
const generateOtp = async (req, res, next) => {
  const { email, phoneNumber } = req.body;
  let token;
  let existingClient;
  if (email) {
    existingClient = await newUser2.findOne({ email });
  }

  else if (phoneNumber) {
    existingClient = await newUser2.findOne({ mobile: phoneNumber });

  }
  if (!existingClient) {

    return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });

  }
  // Check for existing OTP records and delete them
  await verifyOtp.deleteMany({
    $or: [
      { email: existingClient.email },
      { mobile: existingClient.mobile },
    ],
  });

  // Generate a reset token
  const resetToken = await generateResetToken();

  // Choose the appropriate method based on user's contact info
  if (email) {
    token = sign({ email: email }, "email", {
      expiresIn: 60 * 60
    });

    const addOtp = await verifyOtp.create({ email, otp: resetToken })
    let template = await ejs.renderFile(path.join(__dirname, '..', "/views/loginotp.ejs"), {
      token: resetToken,
    });

    const result = await sendOtpForLogin({ to: email, subject: "Your login OTP for shikshaML ", html: template });

    res.json({ message: Messages.EmailSentSuccess });
  } else if (phoneNumber) {
    // Send SMS with reset token
    const addOtp = await verifyOtp.create({ mobile: phoneNumber, otp: resetToken })
    const smsClient = twilio(process.env.TWILIO_AUTH_SID, process.env.TWILIO_AUTH_TOKEN);

    const smsBody = `Your login Otp is: ${resetToken}, please dont share it with anyone.`;



    smsClient.messages
      .create({
        body: ` ${smsBody}`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: `91${phoneNumber}`,
      })
      // .create({
      //   body: ` ${smsBody}`,
      //   from: +13376804099,
      //   to: `91${phoneNumber}`,
      // })
      .then(() => {
        res.status(HttpCodes.Ok).json({ message: Messages.SmsSentSuccess });
      })
      .catch((error) => {
        console.log(error);
        res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
      });
  } else {
    res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
  }
};

const loginWithOtp = async (req, res, next) => {
  try {
    const { email, phoneNumber, otp } = req.body;

    if (!otp) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }
    let existingClient;
    if (email) {
      existingClient = await newUser2.findOne({ email });
    }

    else if (phoneNumber) {
      existingClient = await newUser2.findOne({ mobile: phoneNumber.toString() });

    }
    if (!existingClient) {

      return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });

    }

    let query;

    if (email) {
      query = { email };

    } else if (phoneNumber) {
      query = { mobile: phoneNumber };
    } else {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }

    const otpRecord = await verifyOtp.findOne(query);

    if (!otpRecord) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }

    const payload = { clientId: existingClient._id };
    const token = jwt.sign({ data: payload }, process.env.SECRET_KEY);

    // Create a new record for login
    const authenticateToken = new TokenModel({
      userId: existingClient._id,
      token: token,
    });

    const ans = await authenticateToken.save();


    // Check if there's an existing record with the same userId and no logout time
    const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
      userId: existingClient._id,
      logoutTime: null, // Indicates no logout time set
    });

    if (existingHoursSpentRecord) {
      console.log("do nothing")
    } else {
      // Create a new record for login
      const hoursSpentRecord = new weeklyHoursSpent({
        userId: existingClient._id,
        loginTime: new Date(),
        logoutTime: null,
      });

      const hoursAns = await hoursSpentRecord.save();

      console.log(hoursAns, "hoursAns")
    }
    const profile = await prof.findOne({ id: existingClient._id });



    if (otpRecord.otp === otp) {
      // Check for existing OTP records and delete them
      await verifyOtp.deleteMany({
        $or: [
          { email: existingClient.email },
          { mobile: existingClient.mobile },
        ],
      });
      return res.status(HttpCodes.Ok).json({
        userToken: token,
        success: true,
        message: Messages.DataRetrievedSuccess,
        completed: profile?.completed || false,
      });

    } else {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.WrongOtp });
    }
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

const validateRegisterOtp = async (req, res, next) => {
  try {
    const { email, phoneNumber, otp } = req.body;

    if (!otp) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }
    let existingClient;


    let query;

    if (email) {
      query = { email };

    } else if (phoneNumber) {
      query = { mobile: phoneNumber };
    } else {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }

    const otpRecord = await verifyOtp.findOne(query);

    if (!otpRecord) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }

    if (otpRecord.otp === otp) {
      return res.status(HttpCodes.Ok).json({
        success: true,
        message: Messages.ValidOtp
      });
    } else {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.WrongOtp });
    }

  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};








const generateRegisterOtp = async (req, res, next) => {
  const { email, phoneNumber } = req.body;
  let token;
  let existingClient;



  // Generate a reset token
  const resetToken = await generateResetToken();

  // Choose the appropriate method based on user's contact info
  if (email) {
    token = sign({ email: email }, "email", {
      expiresIn: 60 * 60
    });

    const addOtp = await verifyOtp.create({ email, otp: resetToken })
    let template = await ejs.renderFile(path.join(__dirname, '..', "/views/loginotp.ejs"), {
      token: resetToken,
    });

    const result = await sendOtpForLogin({ to: email, subject: "Complete Your Registration with this OTP", html: template });

    res.send({ message: Messages.EmailSentSuccess });
  } else if (phoneNumber) {
    // Send SMS with reset token
    const addOtp = await verifyOtp.create({ mobile: phoneNumber, otp: resetToken })
    const smsClient = twilio(process.env.TWILIO_AUTH_SID, process.env.TWILIO_AUTH_TOKEN);

    const smsBody = `Your login Otp is: ${resetToken}, please dont share it with anyone.`;



    smsClient.messages
      .create({
        body: ` ${smsBody}`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: `91${phoneNumber}`,
      })
      // .create({
      //   body: ` ${smsBody}`,
      //   from: +13376804099,
      //   to: `91${phoneNumber}`,
      // })
      .then(() => {
        res.status(HttpCodes.Ok).json({ message: Messages.SmsSentSuccess });
      })
      .catch((error) => {
        console.log(error);
        res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
      });
  } else {
    res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
  }
};

const sendOtpForLogin = async (mailOption) => {
  try {
    console.log(mailOption);
    let mail = {};
    mail.from = process.env.EMAIL_TO_SEND_MAILS_FROM;
    mail.subject = mailOption.subject ? mailOption.subject : 'Password Reset Link';
    mail.to = mailOption.to;
    mail.cc = mailOption.cc;
    // mail.cc = process.env.NODE_ENVIRONMENT == 'PROD'? ['paras.shah@midasfintechsolutions.com', 'darshit.shah@midasfintechsolutions.com'] : [];
    if (mailOption.html) {
      mail.html = mailOption.html
    } else if (mailOption.text) {
      mail.text = mailOption.text;
    } else {
      mail.html =
        `<p>Please click on <a href=https://midasfintechsolutions.com/client-mis/forgot-password?token=${mailOption.token}>link</a>.
     You will be redirected to change password link</p>`
    }
    mail.attachments = mailOption.attachments ? mailOption.attachments : []
    await transporter.sendMail(mail);
  }
  catch (error) {
    console.log(error);
    return error;
  }
}


const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Assuming you have the user ID available in the request or decoded from the token
    const userId = req.decoded_token.clientId;

    // Find the user by ID
    const user = await newUser2.findById(userId);

    if (!user) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });
    }

    // Check if the current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(HttpCodes.Unauthorized).json({ message: Messages.IncorrectPassword });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.PasswordNotMatched });
    }

    // Hash the new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password with the hashed password
    user.password = hashedPassword;

    // Save the updated user document
    await user.save();

    res.status(HttpCodes.Ok).json({ message: Messages.DataUpdateSuccess });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};




const institute = async (req, res, next) => {
  try {
    const { state, city } = req.query;

    // Validate that both state and pincode are provided
    if (!state || !city) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.BadRequest });
    }

    // Use the find method to search for institutes with the specified state and pincode
    const matchingInstitutes = await InstituteModel.find({ state, city });

    res.json({ institutes: matchingInstitutes });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};
const notificationStatusToggle = async (req, res, next) => {
  try {
    const { isActive, notificationType } = req.body;
    const userId = req.decoded_token.clientId;

    // Check if the user exists
    const userExists = await newUser2.findById(userId);
    if (!userExists) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.UserNotFound });
    }

    // Update the notification status for the user and notification type
    const result = await Notification.findOneAndUpdate(
      {
        user: userId,
        'notifications.type': notificationType,
        'notifications.isActive': !isActive, // Toggle the isActive field
      },
      {
        $set: {
          'notifications.$.isActive': isActive,
        },
      },
      {
        new: true, // Return the modified document
      }
    );

    if (!result) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoRecordFound });
    }

    return res.status(HttpCodes.Ok).json({ message: Messages.DataUpdateSuccess, data: result });
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};



//notifiaction status toggle

// const notificationStatus = async (req, res, next) => {
//   try {
//     const userId = req.decoded_token.clientId;
//     const { type, isActive } = req.body;

//     // Validate input
//     if (!type) {
//       return res.status(HttpCodes.BadRequest).json({ message: 'Type is a required field' });
//     }

//     // Create a new notification record
//     const newNotification = new Notification({
//       user: userId,
//       notifications: [{ type, isActive }],
//     });

//     // Save the new notification record
//     await newNotification.save();

//     return res.status(HttpCodes.Created).json({ message: 'Notification added successfully', data: newNotification });
//   } catch (error) {
//     console.error(error);
//     res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
//   }
// };




// const browserclose = async (req, res, next) => {
//   try {

//     const userId = req.decoded_token.clientId;

//     const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
//       userId: userId,
//       logoutTime: null, // Indicates no logout time set
//     });

//     if (existingHoursSpentRecord) {
//       // Update the existing record with current logout time
//       //check if login date and current date both are falling on same date then no change, 
//       // otherwise insert logoutTime as 23 hr, 59 min of same date as login
//       //  date and immediately create a new doc with login time as 00,01 and logout time new Date()           //existingHoursSpentRecord


//       existingHoursSpentRecord.logoutTime = new Date();
//       await existingHoursSpentRecord.save();
//     }
//     res.json({ message: "user logged out" })
//   } catch (error) {

//   }

// }


const browserclose = async (req, res, next) => {
  try {
    const userId = req.decoded_token.clientId;
    const currentDate = new Date();

    const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
      userId: userId,
      logoutTime: null, // Indicates no logout time set
    });

    if (existingHoursSpentRecord) {
      // Update the existing record with current logout time
      const loginTime = existingHoursSpentRecord.loginTime;

      // Check if login date and current date both are falling on the same date
      if (loginTime.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {

        existingHoursSpentRecord.logoutTime = new Date()
      } else {
        // Set logout time to 23:59:59:999 of the same date as login
        const logoutTime = new Date(loginTime);
        logoutTime.setHours(23, 58, 59, 999);

        existingHoursSpentRecord.logoutTime = logoutTime;
        await existingHoursSpentRecord.save();

        // Create a new record for the next day with login time as 00:00:00:000 and logout time as current time
        const newRecord = new weeklyHoursSpent({
          userId: userId,
          loginTime: new Date(currentDate.toISOString().split('T')[0] + 'T00:00:00.000Z'),
          logoutTime: currentDate,
        });

        await newRecord.save();


      }
    }

    res.json({ message: Messages.SignedOutSuccess });
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

const migrate = async (req, res, next) => {
  try {
    const migrationData = req.body.data;
    const contentDetails = migrationData.contentDetails;
    const { contentTitle, assignedCode } = migrationData;
    const { contentType, subject, grade, publisher } = contentDetails;
    const categories = [
      {
        category: 'subject',
        subcategories: subject,
      },
      { category: 'grades', subcategories: grade },
      {
        category: 'publisher',
        subcategories: publisher,
      },
    ];

    const aiServerResponse = await axios.post(process.env.FETCHBOOKURL, {assigned_code: assignedCode})
    const contentUrl = `${aiServerResponse?.data?.url}.pdf`

    const newContent = new Content({
      title: contentTitle,
      type: contentType,
      assigned_code: assignedCode,
      contentUrl,
      categories,
    });

    const savedContent = await newContent.save();

    if (savedContent) {
      res.status(HttpCodes.Ok).json({
        success: true,
        message: `${Messages.DataSavedSuccess} for ${contentTitle}`,
      });
    } else {
      return res.status(HttpCodes.InternalServerError).json({
        success: false,
        message: Messages.DataSaveFailed,
      });
    }
  } catch (error) {
    return res.status(HttpCodes.InternalServerError).json({
      success: false,
      message: Messages.InternalServerError,
      error: error.message,
    });
  }
};



module.exports = {
  login,
  register,
  search,
  advsearch,
  menuSubMenu,
  greetings,
  forgotPassword,
  instituteSuggestion,
  readProfile,
  resetPassoword,
  subscribeEmail,
  stickyNotes,
  readStickyNotes,
  updateStickyNotes,
  readUser,
  recentlyViewed,
  logout,
  hoursSpent,
  addTodo,
  readTodo,
  updateTodo,
  deleteTodo,
  addReminder,
  readReminder,
  updateReminder,
  deleteReminder,
  readEvents,
  deleteEvents,
  loginWithOtp,
  generateOtp,
  generateRegisterOtp,
  validateRegisterOtp,
  overallPerformance,
  credits,
  notificationStatus,
  changePassword,
  readSubscription,
  institute,
  browserclose,
  readNotificationStatus,
  notificationStatusToggle,
  migrate
};
