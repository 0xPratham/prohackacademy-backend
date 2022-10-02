const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const express = require('express');
const router = express.Router();
var sanitize = require('mongo-sanitize');
const Joinmodel = require('../models/Joinmodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const GoogleSecretKey = process.env.GOOGLE_SECRET_KEY;
const { signAccessToken, signRefreshToken } = require('../helpers/jwt_helper')

// verify the capcha
async function validateHumanOrNot(token) {
    const captcha_response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${GoogleSecretKey}&response=${token.toString()}`);
    const check_captcha_data = await captcha_response.data.success;
    return check_captcha_data;
}

router.post('/', async (req, res) => {
    try {
        // checking recaptcha field is not empty
        if (!req.body.recaptcha || req.body.recaptcha.length === 0) {
            return res.status(500).send({
                Errors: "Captcha Required"
            });
        }
        // verifying the recaptcha
        const human_or_not = await validateHumanOrNot(req.body.recaptcha);
        if (!human_or_not) {
            return res.status(400).send({
                Errors: "Captcha Is Invalid",
            });
        }
        // checking all fields are there and not empty
        if (!req.body.username || req.body.username.length === 0 || !req.body.password || req.body.password.length === 0) {
            return res.status(400).send({
                Errors: "Some Fields Are Empty"
            });
        }
        // geeting the username and password and sanitize the input
        let username = sanitize(req.body.username);
        username = username.toString().trim().toLowerCase();
        let password = sanitize(req.body.password);
        password = password.toString();
        // checking user exist on collection or not
        Joinmodel.findOne({ username }).then((result) => {
            // if not give the error
            if (!result) {
                return res.status(400).send({
                    Errors: "Invalid Username And Password"
                });
            }
            const userId = result._id;
            // adding pepper
            const strong_password = password + process.env.PEPPER.toString();
            // compare the password with collection password
            bcrypt.compare(strong_password, result.password).then((isMatch) => {
                // if not maching give the error
                if (!isMatch) {
                    return res.status(400).send({
                        Errors: "Invalid Username And Password"
                    });
                }
                if (!result.verified) {
                    return res.status(400).send({
                        Errors: "Email Is Not Verified Check Your Inbox To Verify That"
                    });
                }
                // if match. creating the auth token
                const token = signAccessToken(userId);
                signRefreshToken(userId).then((Refreshtoken) => {
                    if(!token || !Refreshtoken){
                        return res.status(500).send({
                            Errors: "Something Wents Wrong While Generating Token"
                        });
                    }
                    // set the user_session token in cookies
                    res.cookie("user_session", token, {
                        expires: new Date(Date.now() + 120000),
                        httpOnly: true,
                        secure: true   // add this when using https
                    });
                    // set the server_session token in cookies
                    res.cookie("server_session", Refreshtoken, {
                        expires: new Date(Date.now() + 864000000),
                        httpOnly: true,
                        secure: true   // add this when using https
                    });
                    // after that sending the responce
                    res.status(200).send({
                        Success: "success"
                    });
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).send({
                        Errors: "Something Wents Wrong While Generating Token"
                    });
                })
            }).catch((error) => {
                console.log(error);
                return res.status(400).send({
                    Errors: "Invalid Username And Password"
                });
            });
        }).catch((error) => {
            console.log(error);
            return res.status(400).send({
                Errors: "Invalid Username And Password"
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong :("
        });
    };
});

module.exports = router;
