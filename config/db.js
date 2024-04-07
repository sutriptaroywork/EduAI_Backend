const mongoose = require('mongoose');
require('dotenv').config();

const host = process.env.DB_HOST
const passwd = process.env.DB_PASSWD
const name = process.env.CLUSTER_NAME
const dbname = process.env.DB_NAME
const MONGODB_URI =`mongodb+srv://${host}:${passwd}@${name}/${dbname}`

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;