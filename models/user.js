
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('User', UserSchema)












// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({

//     email: {
//         type: String,
//         unique: true,
//         sparse: true
//     },
//     mobile: String,
//     password: {
//         type: String,
//     },
//     otp: {
//         type: String,
//     },
//     oauth: {
//         google: {
//             id: String,
//             displayName: String,
//             firstName: String,
//             lastName: String,
//             image: String
//         }
//         // Add other OAuth providers if needed
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });
// userSchema.index(
//     { email: 1 }, // Remove the reference to "email" in the compound index
//     { unique: true }
// );


// const user = mongoose.model('User', userSchema);

// module.exports = user;




























// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //     email: {
// //         type: String,
// //         required: true,
// //         unique: true
// //     },
// //     password: {
// //         type: String,
// //         required: true
// //     },
// //     mobile: {
// //         type: String,
// //         required: true,
// //         unique: true
// //     },
// //     googleId: {
// //         type: String,
// //         // required: true,
// //     },
// //     displayName: {
// //         type: String,
// //         // required: true,
// //     },
// //     firstName: {
// //         type: String,
// //         // required: true,
// //     },
// //     lastName: {
// //         type: String,
// //         // required: true,
// //     },
// //     image: {
// //         type: String,
// //     },
// //     createdAt: {
// //         type: Date,
// //         default: Date.now,
// //     },
// // });


// // module.exports = mongoose.model('User', userSchema);



