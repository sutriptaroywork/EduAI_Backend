const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');
const events = require('../models/events');
const { HttpCodes, Messages } = require('../helpers/static');



const imageCode=Date.now()

const storage = multer.diskStorage({



    destination(req, file, cb) {
        cb(null, './eventsImages/images')
    },
    filename(req, file, cb) {
        cb(
            null,
            `image-${imageCode}${path.extname(file.originalname)}`
        )
    },
})

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Images only!')
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    },
})

router.post('/', authMiddleware, loginCheck, upload.single('image'), async (req, res) => {
    const { title, subtitle } = req.body;
    console.log("event images", title, subtitle);
    
    const userId = req.decoded_token.clientId;
   
    const filter = { id: userId };
    const update = {
        id: userId,
        title,
        subtitle,
        image: `image-${imageCode}${path.extname(req.file.path)}`,
    };

    // Use findOneAndUpdate to insert or update the record based on the filter
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const savedEvent = await events.findOneAndUpdate(filter, update, options);

    const ans = await events.find({});
    console.log(ans, "anss");

    res.send({
        success: true,
        message: Messages.DataUpdateSuccess,
        event: savedEvent,
    });
})

module.exports = router;
