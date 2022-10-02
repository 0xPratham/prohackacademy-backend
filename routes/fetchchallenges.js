const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Category = require('../models/Category');
const Challenges = require('../models/Challenges');
const Joinmodel = require('../models/Joinmodel');
const Solves = require('../models/Solves');
const { checkApproved } = require('../helpers/approved');

router.post('/', auth, async (req, res) => {
    try {
        // sanitize the user id
        let userId = req.userId;
        userId = userId.toString();

        // checking the user approved by admin or not
        const approved_result = await checkApproved(userId);
        if (approved_result === "Not Approved") {
            return res.status(401).send({
                Errors: "Not Approved"
            });
        }

        // fetch the challenges category except _id date and __v
        Category.find().select("-_id -date -__v").then((result) => {
            const challenges_category = result;
            // now fetching the Challenges except _id __v and flag
            Challenges.find().select("-_id -__v -flag").then((challenges_list) => {
                Joinmodel.countDocuments().then((user_count) => {
                    Solves.find({ userId }).select("-_id -userId -username -points -flag -date -__v").then((user_solve_list) => {
                        Solves.countDocuments().then((total_solves) => {
                            return res.status(200).send({ challenges_category, challenges_list, user_count, user_solve_list, total_solves });
                        }).catch((error) => {
                            console.log(error);
                            return res.status(500).send({
                                Errors: "Something Wents Wrong :("
                            });
                        })
                    }).catch((error) => {
                        console.log(error);
                        return res.status(500).send({
                            Errors: "Something Wents Wrong :("
                        });
                    })
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).send({
                        Errors: "Something Wents Wrong :("
                    });
                });
            }).catch((error) => {
                console.log(error);
                return res.status(500).send({
                    Errors: "Something Wents Wrong :("
                });
            });
        }).catch((error) => {
            console.log(error);
            return res.status(500).send({
                Errors: "Something Wents Wrong :("
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