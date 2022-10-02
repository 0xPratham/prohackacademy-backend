const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const express = require('express');
const Joinmodel = require('../models/Joinmodel');
const UserVerification = require('../models/UserVerification');
const router = express.Router();
var sanitize = require('mongo-sanitize');
const axios = require('axios');
const nodemailer = require('nodemailer');
const GoogleSecretKey = process.env.GOOGLE_SECRET_KEY;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
var validator = require('validator');
var xss = require('xss');
const {verify_your_account} = require('../views/registration');

// config the email creads
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAILID, // generated ethereal user
        pass: process.env.EMAILPASSWORD, // generated ethereal password
    },
});

// verifying it's working or not
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("📧 Everything Ready For Sending Email");
        // console.log(success);
    }
});

// creating a function for sending error in good format
const errorFormat = (e) => {
    let obj = {}
    let allerrors = e.substring(e.indexOf(':') + 1).trim();
    allerrors = allerrors.split(',').map(e => e.trim());
    allerrors.forEach(error => {
        let [key, value] = error.split(':').map(er => er.trim())
        obj[key] = value
    });
    return obj
};

// return the obj of email
async function create_object_of_email(to, subject, userId, username) {
    // testing purpose
    console.log(userId);
    // url where user verify the email
    const currentUrl = `${process.env.SITE_URL}verify_email/`;
    // create unique id with userId
    const uniqueString = uuidv4() + userId;
    const link = currentUrl + userId + "___" + uniqueString;
    const html_template_output = verify_your_account(username, process.env.SUPPORT_EMAIL, link);
    let obj = {
        from: process.env.EMAILID, // sender address
        to, // list of receivers
        subject, // Subject line
        html: html_template_output // html body
    }
    // hash the uniqueString
    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds).then((hashedUniqueString) => {
        // adding inside userverification collection
        const newVerification = new UserVerification({
            userId,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 7200000,
        })
        newVerification.save().then(() => {
            console.log("Successfully Added in UserVerification Collection")
        }).catch((error) => {
            console.log(error);
        })
    }).catch(() => {
        console.log("Error in hashing the value");
    })
    // sending mail
    let info = await transporter.sendMail(obj);
    return info;
}

// verify the capcha
async function validateHumanOrNot(token) {
    const captcha_response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${GoogleSecretKey}&response=${token.toString()}`);
    const check_captcha_data = await captcha_response.data.success;
    return check_captcha_data;
}

// create a user using POST method on "/api/join" which doesn't required jwt token
router.post('/', async (req, res) => {
    try {
        if (!req.body.joinrecaptcha || req.body.joinrecaptcha.length === "") {
            return res.status(400).send({
                Errors: "Captcha Required",
            });
        }
        const human_or_not = await validateHumanOrNot(req.body.joinrecaptcha);
        if (!human_or_not) {
            return res.status(400).send({
                Errors: "Captcha Is Invalid",
            });
        }
        var clean_username = xss(sanitize(req.body.username));
	if(clean_username?.toString()?.trim()?.length < 3){
            return res.status(400).send({
                Errors: "Username can't be shorter than 3 charaters",
            });
        }
        if(clean_username?.toString()?.trim()?.length > 20){
            return res.status(400).send({
                Errors: "Username can't be longer than 20 charaters",
            });
        }
        const user = new Joinmodel(sanitize({
            username: validator.escape(clean_username.toString().trim()),
            email: req.body.email.toString().trim(),
            password: req.body.password.toString()
        }));
        // joinresult has all the values which we need to send verify email.
        const joinresult = await user.save();
        if (!joinresult) {
            return res.status(500).send({
                Errors: "Something Wents Wrong",
            });
        }
        res.status(200).send({
            message: "Success",
        });
        const info = await create_object_of_email(user.email.toString(), "Verify Your Email", joinresult._id, user.username.toString());
        console.log(info.messageId);
    } catch (e) {
        // handling errors
        if (e.code === 11000 && Object.keys(e.keyPattern).toString() === "username") {
            return res.status(422).send({
                Errors: "Username Is Already Registered"
            });
        }
        else if (e.code === 11000 && Object.keys(e.keyPattern).toString() === "email") {
            return res.status(422).send({
                Errors: "Email Is Already Registered"
            });
        } else {
            return res.status(400).send({
                Errors: errorFormat(e.message)
            });
        }
    }
});

module.exports = router;
