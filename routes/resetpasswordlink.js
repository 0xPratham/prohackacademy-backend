const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const express = require('express');
const router = express.Router();
const PasswordReset = require('../models/PasswordReset');
const Joinmodel = require('../models/Joinmodel');
var sanitize = require('mongo-sanitize');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const GoogleSecretKey = process.env.GOOGLE_SECRET_KEY;
const axios = require('axios');
const {reset_password} = require('../views/resetpassword');

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

async function sendEmail({ _id, email, username }) {
    const currentUrl = `${process.env.SITE_URL}reset_password/`;
    const resetString = uuidv4() + _id;
    const reset_url = currentUrl + _id + "___" + resetString;
    const html_template_output = reset_password(username.toString(), process.env.SUPPORT_EMAIL, reset_url);
    // clearing all previous reset password link
    PasswordReset.deleteMany({ userId: _id }).then(() => {
        // creating the email options obj
        let reset_obj = {
            from: process.env.EMAILID, // sender address
            to: email, // list of receivers
            subject: "Password Reset", // Subject line
            html: html_template_output // html body
        }
        // hash the reset string
        bcrypt.hash(resetString, 10).then((hashedResetString) => {
            // adding all info for reset password in PasswordReset Collection
            const newPasswordReset = new PasswordReset({
                userId: _id,
                resetString: hashedResetString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1200000
            });
            newPasswordReset.save().then(() => {
                // now sending the email to user
                transporter.sendMail(reset_obj).then((info) => {
                    return info.messageId;
                }).catch((error) => {
                    return error;
                })
            }).catch((error) => {
                return error;
            })
        }).catch((error) => {
            return error;
        });
    }).catch((error) => {
        return error;
    })
}

// verify the capcha
async function validateHumanOrNot(token) {
    const captcha_response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${GoogleSecretKey}&response=${token.toString()}`);
    const check_captcha_data = await captcha_response.data.success;
    return check_captcha_data;
}

router.post('/', async (req, res) => {
    try {
        // first verify token is in req or not
        if (!req.body.resetrecaptcha || req.body.resetrecaptcha.length === "") {
            return res.status(500).send({
                error: "Captcha Required",
            });
        }
        // then check the token is valid or not
        const human_or_not = await validateHumanOrNot(req.body.resetrecaptcha);
        if (!human_or_not) {
            return res.status(500).send({
                error: "Captcha Is Invalid",
            });
        }
        // sanitize the input first
        let email = sanitize(req.body.email);
        email = email.toString();
        if (email.length === 0 || !validator.isEmail(email)) {
            return res.status(500).send({
                error: "Email is not valid",
            });
        }
        // checking the email is exist on database or not
        Joinmodel.find({ email }).then((data) => {
            if (data.length) {
                // if user exist this block of code executed
                if (!data[0].verified) {
                    // user don't been verified so we can't proceed further
                    return res.status(500).send({
                        error: "Email has not been verified yet check your inbox",
                    });
                }
                // if email is verified we can send email
                res.status(200).send({
                    msg: "If the user exists then you will receive an email with a password reset link",
                });
                // sending the email after sending the message to user
                sendEmail(data[0]);
            } else {
                return res.status(200).send({
                    msg: "If the user exists then you will receive an email with a password reset link",
                });
            }
        }).catch((error) => {
            console.log(error);
            return res.status(200).send({
                msg: "If the user exists then you will receive an email with a password reset link",
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Something wents wrong",
        });
    }
});

module.exports = router;