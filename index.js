
// console.log(process.env.TWILIO_FROM_NUMBER);
require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const passport = require('passport')
const PopularContent = require('./models/popular');
const Content = require('./models/content');
const jwt = require('jsonwebtoken');

const History = require('./models/history');

// Routes
const path = require('path');
const authRoutes = require('./routes/auth');
const DashboarRoutes = require('./routes/dashBoardRoutes');
const settingRoutes = require('./routes/settingRoutes');
const referralRoutes = require('./routes/referralRoutes');
const eventUpload = require('./routes/eventsUpload');
const profileupload = require('./routes/profileUpload');
const userRoutes = require('./routes/userRoutes');
// const aiRoutes = require('./routes/aiRoutes');
const tokenRoutes = require('./routes/tokenRoutes')
const applicationRoutes = require('./routes/applicationRoutes')
const orderRoutes = require('./routes/orderRoutes')

//express-session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
)

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // JSON Middleware
app.use(express.static('eventsImages')); // JSON Middleware gives access to a single folder at a time from where frontend can fetch images 
app.use(express.static('profile'));
//passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/api/application/maintenance', (req, res, next) => {
  console.log('call to maintenance api new for testing')
  res.status(200).json({ success: true })
})

// Configurations
require('dotenv').config(); //.ENVConfig
const port = process.env.PORT || 3001; //PORT
const connectDB = require('./config/db'); //DBConfig
const InstituteModel = require('./models/institute');
const newUser2 = require('./models/newUser2');
const HoursSpent = require('./models/hoursSpent');
const weeklyHoursSpent = require('./models/weeklyHoursSpent');
connectDB(); // Connect to MongoDB
require('./config/passport')(passport) //passport config
const Notification = require('./models/notifications');
const NewestProf = require('./models/prof');

// Routes
app.use('/api', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/dashboard', DashboarRoutes);
// app.use('/api/ai',aiRoutes);
app.use('/api/eventupload', eventUpload);
app.use('/api/profileupload', profileupload);
// app.use('/api/ai',aiRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/token',tokenRoutes)
app.use('/api/application',applicationRoutes)
app.use('/api/order',orderRoutes)





// async function searchRecordForDates() {
//   try {
//     const searchDate = new Date('2023-11-20'); // Convert the string value to a Date object

//     const records = await HoursSpent.find({
//       loginTime: {
//         $gte: new Date(searchDate), // Greater than or equal to the start of the day
//         $lt: new Date(searchDate.setDate(searchDate.getDate() + 1)), // Less than the start of the next day
//       },
//     });

//     console.log(records); // Log the documents returned by the query
//   } catch (err) {
//     console.error('Inst Dummy_contentData :', err);
//   }
// }

// searchRecordForDates();
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app




// async function deleteOneUser() {
//   try {
//     decodedToken = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Ijk5MzA2Mjk0NzEiLCJpYXQiOjE3MDA1NTUxNDYsImV4cCI6MTcwMDU1ODc0Nn0.QiVgeY8lsJjKBEo4RctoSShOI1LOd1MMletK0r_Rtn4', 'phoneNumber');
//     const phoneNumber = decodedToken.data.phoneNumber;
//     console.log(phoneNumber,"andssssssssssssss")
//   } catch (err) {
//     console.error('AnotherSchool Dummy_contentData :', err);
//   }
// }
// deleteOneUser()





async function insertManychool() {
  try {
    const mostPopularContent = await PopularContent.aggregate([
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
    ]);

    console.log(mostPopularContent);

  } catch (err) {
    console.error('new school Dummy_contentData :', err);
  }
}

// insertManychool();


const dummyRecords = [
  {
    "userId": "123",
    "loginTime": "2023-11-21T10:00:00.000Z",
  }
]
const deleteReminder = async () => {
  try {

    // Use the `findByIdAndDelete` method to find and delete the reminder by its ID
    const deletedReminder = await weeklyHoursSpent.insertMany(dummyRecords);

    console.log(deletedReminder, "deletedReminder")
  } catch (error) {
    console.error(error);
  }
};

// deleteReminder()

// const hours = () => {
//   const givenDate = new Date("2023-11-23T07:00:56.938Z");

//   // Calculate the difference in days between the given date and the nearest Monday
//   const daysUntilMonday = (givenDate.getUTCDay() + 6) % 7; // Corrected calculation

//   // Calculate the date of the most recent Monday
//   const recentMonday = new Date(givenDate);
//   recentMonday.setUTCDate(givenDate.getUTCDate() - daysUntilMonday);

//   console.log(recentMonday, "recentMondaysssss");

//   // Generate an array of day names and dates from the recent Monday to the given date
//   const daysInRange = [];
//   let currentDate = new Date(recentMonday);

//   while (currentDate <= givenDate) {
//     const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getUTCDay()];
//     const formattedDate = currentDate.toISOString().split('T')[0];
//     daysInRange.push({ day: dayName, date: formattedDate });
//     currentDate.setUTCDate(currentDate.getUTCDate() + 1);
//   }

//   console.log(daysInRange, "daysInRange");

//   searchRecords(daysInRange)

// }


async function searchRecords(userId, daysInRange) {
  try {
    for (const dayInfo of daysInRange) {
      const searchDate = new Date(dayInfo.date); // Convert the string value to a Date object

      const records = await weeklyHoursSpent.find({
        userId: userId,
        loginTime: {
          $gte: new Date(searchDate), // Greater than or equal to the start of the day
          $lt: new Date(searchDate.setDate(searchDate.getDate() + 1)), // Less than the start of the next day
        },
      });

      console.log(`Records for ${dayInfo.day}:`, records);
    }
  } catch (err) {
    console.error('Error searching records:', err);
  }
}

// const hours = async () => {
//   try {

//     const userId = '6559f3194acde4a26d44e438'; // Replace 'yourUserId' with the actual userId



//     const today = new Date()
//     console.log(today, "today")
//     // return
//     const givenDate = new Date(`${today}`);

//     // Calculate the difference in days between the given date and the nearest Monday
//     const daysUntilMonday = (givenDate.getUTCDay() + 6) % 7; // Corrected calculation

//     // Calculate the date of the most recent Monday
//     const recentMonday = new Date(givenDate);
//     recentMonday.setUTCDate(givenDate.getUTCDate() - daysUntilMonday);

//     console.log(recentMonday, "recentMondaysssss");

//     // Generate an array of day names and dates from the recent Monday to the given date
//     const daysInRange = [];
//     let currentDate = new Date(recentMonday);

//     while (currentDate <= givenDate) {
//       const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getUTCDay()];
//       const formattedDate = currentDate.toISOString().split('T')[0];
//       daysInRange.push({ day: dayName, date: formattedDate });
//       currentDate.setUTCDate(currentDate.getUTCDate() + 1);
//     }

//     // Append empty records for the remaining days until Sunday
//     const remainingDays = 7 - daysInRange.length;
//     const currentDayIndex = givenDate.getUTCDay();
//     for (let i = 0; i < remainingDays; i++) {
//       const nextDayIndex = (currentDayIndex + i + 1) % 7;
//       const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDayIndex];
//       daysInRange.push({ day: dayName, date: null });
//     }

//     console.log(daysInRange, "daysInRange");
//     await searchRecords(userId,daysInRange);
//   } catch (err) {
//     console.error('Error:', err);
//   }
// }

// hours();

const moment = require('moment');
const Api = require('twilio/lib/rest/Api');

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
      const totalLoggedInTime = records.reduce((sum, record) => {
        if (record.logoutTime) {
          const loginMoment = moment(record.loginTime);
          const logoutMoment = moment(record.logoutTime);
          const duration = moment.duration(logoutMoment.diff(loginMoment));
          return sum + duration.asHours(); // add the logged-in hours to the sum
        } else {
          return sum;
        }
      }, 0);

      // Set the result for the day
      result[dayInfo.day] = totalLoggedInTime;

      console.log(`Records for ${dayInfo.day}:`, records);
    }

    console.log('Total Logged-in Time:', result);
  } catch (err) {
    console.error('Error searching records:', err);
  }
}

const hours = async () => {
  try {
    const userId = '6559f3194acde4a26d84e408';

    const today = new Date();

    const givenDate = new Date(`${today}`);

    const daysInRange = [];
    let currentDate = new Date(givenDate);

    while (currentDate <= givenDate) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getUTCDay()];
      const formattedDate = currentDate.toISOString().split('T')[0];
      daysInRange.push({ day: dayName, date: formattedDate });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const remainingDays = 7 - daysInRange.length;
    const currentDayIndex = givenDate.getUTCDay();
    for (let i = 0; i < remainingDays; i++) {
      const nextDayIndex = (currentDayIndex + i + 1) % 7;
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][nextDayIndex];
      daysInRange.push({ day: dayName, date: null });
    }

    console.log(daysInRange, "daysInRange");
    await searchRecords(userId, daysInRange);
  } catch (err) {
    console.error('Error:', err);
  }
};

// hours();