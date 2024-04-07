const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const path = require('path');
var ejs = require("ejs");
const axios = require('axios');
const { restart } = require('nodemon');
const { EventListInstance } = require('twilio/lib/rest/taskrouter/v1/workspace/event');
var smtpTransport = require('nodemailer-smtp-transport');
const http = require('http');
const ResetPass = require('../models/resetpassword');
const { HttpCodes, Messages } = require('../helpers/static');

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

// helper api
const citySuggestion = async (req, res) => {
    const keyword = req.query.keyword;

    try {
        // Use a regular expression to perform a case-insensitive search for institutes
        const cityName = await city.find({ name: { $regex: keyword, $options: 'i' } });

        res.json(cityName);
    } catch (error) {
        res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
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

module.exports = {
    instituteSuggestion,
    citySuggestion,
    generateResetToken,
}