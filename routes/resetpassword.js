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
const axios = require('axios');
const GoogleSecretKey = process.env.GOOGLE_SECRET_KEY;
const client = require('../db/redis');

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

        let userId = sanitize(req.body.userId);
        userId = userId.toString();
        let resetString = sanitize(req.body.resetString);
        resetString = resetString.toString();
        let newPassword = sanitize(req.body.newPassword);
        newPassword = newPassword.toString();

        if (userId.length === 0 || resetString.length === 0 || newPassword === 0) {
            return res.status(500).send({
                Errors: "Some fields are empty"
            });
        }

        // checking the strong password
        if (!validator.isStrongPassword(newPassword)) {
            return res.status(500).send({
                Errors: "Password Is Not Strong"
            });
        }
        // find the userId in PasswordReset collection
        PasswordReset.find({ userId }).then((result) => {
            if (result.length > 0) {
                const { expiresAt } = result[0];
                const hashedResetString = result[0].resetString;
                // checking for expired reset string
                if (expiresAt < Date.now()) {
                    PasswordReset.deleteOne({ userId }).then(() => {
                        // deleting result
                        return res.status(500).send({
                            Errors: "PasswordReset link is expired"
                        });
                    }).catch((error) => {
                        // failed in deleting result
                        console.log(error);
                        return res.status(500).send({
                            Errors: "The PasswordReset code is not valid"
                        });
                    });
                } else {
                    // validate reset string is valid one or not
                    bcrypt.compare(resetString, hashedResetString).then((result) => {
                        if (result) {
                            res.status(200).send({
                                Success: "Password changed successfully"
                            });
                            // strings match now we hash the new password and store them into user collection
                            // first adding pepper into new password
                            const strongPass = newPassword + process.env.PEPPER.toString();
                            // after that generating the salt
                            bcrypt.genSalt(10).then((salt) => {
                                // now hash the password with bcrypt
                                bcrypt.hash(strongPass, salt).then((hashedPassword) => {
                                    // now update user password inside user collection
                                    Joinmodel.findByIdAndUpdate({ _id: userId }, { password: hashedPassword }).then(() => {
                                        // password update complete
                                        // now delete the entry in PasswordReset collection
                                        PasswordReset.deleteOne({ userId }).then(() => {
                                            // delete refresh token in redis of that userId
                                            client.del(userId).then(() => {
                                                // both user and passwordReset collection updated with deleted refresh token
                                                console.log(`Successfully Reset the password and refresh token of this userid = ${userId}`);
                                            }).catch(() => {
                                                console.log("Something wents wrong while removing refresh token in redis server");
                                            })
                                        }).catch((error) => {
                                            console.log(error);
                                        });
                                    }).catch((error) => {
                                        console.log(error);
                                    });
                                }).catch((error) => {
                                    console.log(error);
                                    return res.status(500).send({
                                        Errors: "The PasswordReset code is not valid"
                                    });
                                });
                            }).catch((error) => {
                                console.log(error);
                            });
                        } else {
                            // record is exist but reset string is not valid
                            return res.status(500).send({
                                Errors: "The PasswordReset code is not valid"
                            });
                        }
                    }).catch((error) => {
                        console.log(error);
                        return res.status(500).send({
                            Errors: "The PasswordReset code is not valid"
                        });
                    })
                }
            } else {
                // password reset code is not valid
                return res.status(500).send({
                    Errors: "The PasswordReset code is not valid"
                });
            }
        }).catch((error) => {
            console.log(error);
            return res.status(500).send({
                Errors: "The PasswordReset code is not valid"
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong"
        });
    }
});

module.exports = router;