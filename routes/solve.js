const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Challenges = require('../models/Challenges');
const Joinmodel = require('../models/Joinmodel');
const Solves = require('../models/Solves');
var sanitize = require('mongo-sanitize');
const { checkApproved } = require('../helpers/approved');

router.post('/', auth, async (req, res) => {
    try {
        if (!req.body.challenge_name || !req.body.challenge_flag) {
            return res.status(400).send({
                Wrong: "Some Fields Are Empty"
            });
        }
        // sanitize the req
        let userId = sanitize(req.userId);
        userId = userId.toString();
        let username = sanitize(req.username);
        username = username.toString();
        let challenge_name = sanitize(req.body.challenge_name);
        challenge_name = challenge_name.toString().toLowerCase().trim();
        let challenge_flag = sanitize(req.body.challenge_flag);
        challenge_flag = challenge_flag.toString();
        let current_user_points = req.points;

        // checking the user approved by admin or not
        const approved_result = await checkApproved(userId);
        if (approved_result === "Not Approved") {
            return res.status(401).send({
                Errors: "Not Approved"
            });
        }

        // first check if the user already completed that challenge
        Solves.findOne({ userId, challenge_name, flag: challenge_flag }).then((data) => {
            // if we find record it's mean user already completed it
            if (data) {
                return res.status(409).send({
                    Wrong: "You Already Completed That Challenge"
                });
            }
            // checking if challenge name is exist in collection or not
            Challenges.findOne({ challenge_name }).then((result) => {
                // no data found 
                if (!result) {
                    return res.status(400).send({
                        Wrong: "Invalid Flag!"
                    });
                }

                // data found
                let flag = result.flag;
                flag = flag.toString();
                let points = result.points;
                let user_points = result.points + current_user_points;
                let real_challenge_name = result.challenge_name;
                real_challenge_name = real_challenge_name.toString();
                let real_challenge_category = result.challenge_category;
                real_challenge_category = real_challenge_category.toString();
                let first_solve = result.first_solve;

                // comparing the user flag with collection flag
                if (flag === challenge_flag && flag.localeCompare(challenge_flag) === 0) {
                    // now everything is good let's add entry in solves collection
                    const newSolve = new Solves({
                        userId,
                        username,
                        challenge_name: real_challenge_name,
                        challenge_category: real_challenge_category,
                        points,
                        flag: challenge_flag
                    });
                    newSolve.save().then(() => {
                        if (first_solve === null) {
                            Challenges.findOneAndUpdate({ challenge_name: real_challenge_name }, { first_solve: username }).then(() => {
                                Joinmodel.findByIdAndUpdate({ _id: userId }, { points: user_points, last_solve_date: Date.now() }).then(() => {
                                    res.status(200).send({
                                        Success: true
                                    });
                                }).catch((error) => {
                                    console.log(error);
                                    return res.status(400).send({
                                        Wrong: "Invalid Flag!"
                                    });
                                })
                            }).catch((error) => {
                                console.log(error);
                                return res.status(400).send({
                                    Wrong: "Invalid Flag!"
                                });
                            })
                        } else {
                            Joinmodel.findByIdAndUpdate({ _id: userId }, { points: user_points, last_solve_date: Date.now() }).then(() => {
                                res.status(200).send({
                                    Success: true
                                });
                            }).catch((error) => {
                                console.log(error);
                                return res.status(400).send({
                                    Wrong: "Invalid Flag!"
                                });
                            })
                        }
                    }).catch((error) => {
                        console.log(error);
                        return res.status(400).send({
                            Wrong: "Invalid Flag!"
                        });
                    })
                } else {
                    return res.status(400).send({
                        Wrong: "Invalid Flag!"
                    });
                }
            }).catch((e) => {
                console.log(e);
                return res.status(400).send({
                    Wrong: "Invalid Flag!"
                });
            })
        }).catch((error) => {
            console.log(error);
            return res.status(400).send({
                Wrong: "Invalid Flag!"
            });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong :("
        });
    }
});

module.exports = router;