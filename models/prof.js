const mongoose = require('mongoose');
const { Schema } = mongoose;

// const educationBoardEnum = [
//   "CBSE", "ICSE", "IGCSE", "IB", "CIE", "ISC", "NIOS", "CISCE",
//   "BSEAP", "APSBSE", "AHSEC", "BSEB", "CGBSE", "GBSHSE", "GSEB",
//   "HBSE", "HPBOSE", "JAC", "JKBOSE", "KSEB", "MPBSE", "MSBSHSE",
//   "COHSEM", "MBOSE", "MBSE", "NBSE", "BSE Odisha", "PSEB", "RBSE",
//   "SBSE", "TNBSE", "BSE Telangana", "TBSE", "UPMSP Or UPMSEB", "UBSE",
//   "WBBSE", "Others"
// ];

const orderHistorySchema = new Schema(
  {
    orderDate: {
      type: Date,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    orderedQuantity: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
);

const tokenUsageSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    tokensUsed: {
      type: Number,
      required: true,
    },
    tokensRemaining: {
      type: Number,
      required: true,
    },
    uploadedMaterial: {
      type: String,
      required: true,
    },
  },
);

const codeDetailsSchema = new Schema(
  {
    code: {
      type: Schema.Types.String
    }
  }, { _id: false }
);

const codeUsedSchema = new Schema(
  {
    publisher: {
      type: codeDetailsSchema,
      default: undefined
    },
    school: {
      type: codeDetailsSchema,
      default: undefined
    },
    coachings: {
      type: [codeDetailsSchema],
      default: undefined
    }
  }, { _id: false }
);

const prof = new Schema(
  {
    id: { type: String, required: true, unique: true },
    fullname: { type: String },
    dob: { type: Date },
    gender: { type: String },
    grade: { type: String },
    otherGrade: { type: String, default: "" },
    school: { type: String },
    educationBoard: { type: String, default: "Others" },
    otherBoard: { type: String, default: "" },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    referralCode: { type: String },
    areaOfInterest: { type: [String] }, // Array to store multiple interests
    completed: { type: Boolean, default: false },
    image: {
      type: String,
    },
    parentName: { type: String },
    parentEmail: { type: String },
    parentNo: { type: String },
    orderHistory: {
      type: [orderHistorySchema],
      default: [],
    },
    tokenUsage: {
      type: [tokenUsageSchema],
      default: [],
    },
    codeUsed: {
      type: codeUsedSchema,
      default: {}
    },
    tokenBalance: { type: Number, default: 0 }
  },

  {
    timestamps: true,
    minimize: false
  }
);

const newestProf = mongoose.model('newProf', prof);

module.exports = newestProf;
