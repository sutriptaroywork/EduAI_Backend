const HoursSpent = require('../models/hoursSpent'); // Import your HoursSpent model
const jwt = require('jsonwebtoken');
const weeklyHoursSpent = require('../models/weeklyHoursSpent');
const { HttpCodes, Messages } = require('../helpers/static');

module.exports = async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization'];
        if (!bearerToken) {
            return res.status(HttpCodes.Forbidden).json({ error: Messages.AuthTokenNotFound });
        }

        const token = bearerToken.split(' ')[1]; // Extract the token from the header


        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        // const userId = decodedToken.data.clientId
        const userId = decodedToken.data.clientId;

        // Find the last record for the same user and token, sorted by loginTime in descending order
        const lastRecord = await weeklyHoursSpent.findOne({ userId }).sort({ loginTime: -1 });
        // console.log(lastRecord, "lastrecord")
        console.log(lastRecord, "lastRecord")
        const lastRecordss = await weeklyHoursSpent.find({});

        // console.log(lastRecord,"user logged in")
        // console.log(lastRecordss,"lastRecordss")


        if (!lastRecord || lastRecord.logoutTime) {
            // If there's no record or the last record has a logoutTime, create a new record for login
            const loginRecord = new weeklyHoursSpent({
                userId,
                loginTime: new Date(),
                logoutTime: null, // Indicates no logout time set
            });
            console.log(loginRecord, "user was logged out hence created new record")

            await loginRecord.save();
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(HttpCodes.Forbidden).json({ error: Messages.InternalServerError });
    }
};