const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Challenges = require('../models/Challenges');
const admin_auth = require('../middleware/admin_auth');

router.post('/', admin_auth, async (req, res) => {
    try {
        // checking all fields are available
        if (req.body.challenge_name && req.body.challenge_category && req.body.points && req.body.description && req.body.flag && req.body.difficulty) {
            // first check if challenge_category name is available on collection or not
            let challenge_category = req.body.challenge_category;
            challenge_category = challenge_category.toString();
            Category.findOne({ name: challenge_category }).then((result) => {
                // if not added that first
                if (!result) {
                    const newCategory = new Category({ name: challenge_category });
                    newCategory.save().then(() => {
                        console.log("New Challenge Added");
                    }).catch((error) => {
                        console.log(error);
                        return res.status(400).send({
                            Errors: "Error in adding challenge_category name"
                        });
                    });
                }
                // if already available adding the challenge
                const newChallenge = new Challenges({
		    challenge_name: req.body.challenge_name.toString(),
                    challenge_category,
                    points: req.body.points,
                    difficulty: req.body.difficulty.toString(),
                    description: req.body.description.toString(),
                    download_link: req.body.download_link.toString(),
                    flag: req.body.flag.toString()
                });
                newChallenge.save().then(() => {
                    return res.status(200).send({
                        Success: "Added SuccessFully"
                    });
                }).catch((error) => {
                    console.log(error);
                    return res.status(400).send({
                        Errors: "Error in adding challenges"
                    });
                });
            }).catch((error) => {
                console.log(error);
                return res.status(400).send({
                    Errors: "Error in finding challenge_category name"
                });
            })
        } else {
            return res.status(500).send({
                Errors: "Some Fields Are Empty :("
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Some Fields Are Empty :("
        });
    }
});

module.exports = router;
