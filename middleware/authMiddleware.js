const { verify, JsonWebTokenError, decode } = require('jsonwebtoken');
const TokenModel = require('../models/authenticationToken');
const googleToken = require('../models/googleAuthToken');
const HoursSpent = require('../models/hoursSpent');
const weeklyHoursSpent = require('../models/weeklyHoursSpent');
// const { fetchConstant, errorFormatter } = require('../utils');
const { HttpCodes, Messages } = require('../helpers/static');



module.exports = async (req, res, next) => {
    try {
        let bearer_token = req.headers['authorization'];
        // console.log(bearer_token);
        if (!bearer_token) {
            console.log("I was in bearer token here");
            return res.status(HttpCodes.Unauthorized).json({ status: 401, message: Messages.AuthTokenNotFound })
        }
        let token = bearer_token.split(" ")[1];

        if (!token || token === null || token === 'null') {
            return res.status(HttpCodes.Unauthorized).json({ status: 401, message: Messages.AuthTokenNotFound })
        }

        const checkAuthToken = await TokenModel.findOne({
            token: token,
        });

        const checkGoogleAuthToken = await googleToken.findOne({
            googleToken: token,
        });
        console.log(token, "tokenn", checkGoogleAuthToken)
        if (!checkAuthToken && !checkGoogleAuthToken) {
            return res.status(HttpCodes.Unauthorized).json({ status: 401, message: Messages.AuthTokenNotFound })
        }
        if (!token) {
            return res.status(HttpCodes.Unauthorized).json({ status: 401, message: Messages.AuthTokenNotFound })
        }
        let secret = process.env.SECRET_KEY;
        // console.log("secret",secret);
        try {
            await verify(token, secret);
        } catch (e) {
            return res.status(HttpCodes.Unauthorized).json({ status: 401, message: Messages.AuthTokenNotFound })
        }

        const decoded = decode(token)
        console.log(decoded,"decoded")
        req.decoded_token = decode(token).data;
        const existingClient = req.decoded_token.clientId

        console.log(existingClient, 'existingClient', req.decoded_token)

        // Check if there's an existing record with the same userId and no logout time
        const existingHoursSpentRecord = await weeklyHoursSpent.findOne({
            userId: existingClient,
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

            console.log(hoursAns, "hoursSpentRecord")
        }
        next();
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            console.log(err);
            next((401, Messages.Unauthorized))
        } else {
            console.log(err);
            next({ status: 403, message: Messages.AuthTokenNotFound });
        }
    }
}