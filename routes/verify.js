const express = require('express');
const router = express.Router();
const UserVerification = require('../models/UserVerification');
const Joinmodel = require('../models/Joinmodel');
var sanitize = require('mongo-sanitize');
const bcrypt = require('bcryptjs');

router.post('/', (req, res) => {
    try {
        // getting the unique id and sanitize the input
        let userId = sanitize(req.body.userId);
        userId = userId.toString();
        let user_uniqueString = req.body.uniqueString;
        // searching the unique id it's valid or not;
        UserVerification.find({ userId }).then((result) => {
            if (result.length > 0) {
                // user is existed if this block executed
                const { expiresAt } = result[0];
                const { uniqueString } = result[0];
                // checking the code is expired or not
                if (expiresAt < Date.now()) {
                    UserVerification.findByIdAndDelete({ userId }).then(() => {
                        Joinmodel.findByIdAndDelete({ _id: userId }).then(() => {
                            return res.status(500).send({
                                Errors: "Verification code is expired please sign up again",
                            });
                        }).catch((error) => {
                            console.log(error);
                            return res.status(500).send({
                                Errors: "Invalid verification code",
                            });
                        });
                    }).catch((error) => {
                        console.log(error);
                        return res.status(500).send({
                            Errors: "Invalid verification code",
                        });
                    })
                } else {
                    // valid record exist so we can proceed
                    // now comparing the string which user passed
                    bcrypt.compare(user_uniqueString, uniqueString).then((result) => {
                        if (result) {
                            Joinmodel.findByIdAndUpdate({ _id: userId }, { verified: true }).then(() => {
                                UserVerification.deleteOne({ userId }).then(() => {
                                    return res.status(200).send({
                                        Success: "Email successfully verified you can now login with your account",
                                    });
                                }).catch((error) => {
                                    console.log(error);
                                    return res.status(500).send({
                                        Errors: "Invalid verification code",
                                    });
                                });
                            }).catch((error) => {
                                console.log(error);
                                return res.status(500).send({
                                    Errors: "Invalid verification code",
                                });
                            });
                        } else {
                            return res.status(500).send({
                                Errors: "Invalid verification code",
                            });
                        }

                    }).catch((error) => {
                        console.log(error);
                        return res.status(500).send({
                            Errors: "Invalid verification code",
                        });
                    });
                }
            } else {
                return res.status(500).send({
                    Errors: "Invalid verification code",
                });
            }
        }).catch((error) => {
            console.log(error);
            return res.status(500).send({
                Errors: "Invalid verification code",
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            Errors: "Something wents wrong",
        });
    }
});

module.exports = router;