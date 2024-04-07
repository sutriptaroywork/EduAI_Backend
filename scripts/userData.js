const mongoose = require('mongoose');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const connectDB = require('../config/db');
connectDB();

const newUser2 = require('../models/newUser2');
const prof = require('../models/prof');

const fetchDataAndExport = async () => {
  try {

    const usersData = await newUser2.find();

    const combinedDataPromises = usersData.map(async (user) => {
      if (user._id) {
        const additionalUserData = await prof.findOne({ id: user._id });
        return { ...user._doc, ...additionalUserData._doc };
      }
    });

    const combinedData = await Promise.all(combinedDataPromises);

    const csvWriter = createCsvWriter({
      path: 'B2C user data.csv',
      header: [
        { id: 'fullname', title: 'Full Name' },
        { id: 'email', title: 'Email' },
        { id: 'mobile', title: 'Mobile' },
        { id: 'dob', title: 'Date of birth' },
        { id: 'gender', title: 'Gender' },
        { id: 'grade', title: 'Grade' },
        { id: 'otherGrade', title: 'Other Grade' },
        { id: 'school', title: 'School' },
        { id: 'educationBoard', title: 'Education Board' },
        { id: 'otherBoard', title: 'Other Board' },
        { id: 'city', title: 'City' },
        { id: 'state', title: 'State' },
        { id: 'pincode', title: 'Pincode' },
        { id: 'referralCode', title: 'Referral Code' },
        { id: 'parentName', title: 'Parent\'s name' },
        { id: 'parentEmail', title: 'Parent\'s email' },
        { id: 'parentNo', title: 'Parent\'s number' },
        { id: 'areaOfInterest', title: 'Area of interests' }
      ],
    });

    await csvWriter.writeRecords(combinedData); // Write combined data to CSV file
  } catch (error) {
    console.error('Error fetching data or exporting to CSV:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

fetchDataAndExport();
