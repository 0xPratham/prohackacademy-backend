const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkApproved } = require('../helpers/approved');
const Feedback = require('../models/Feedback');
var sanitize = require('mongo-sanitize');

const validate_fields = (difficulty, experience, play_more, overall_experience, suggestion) => {
    if (difficulty === "easy" || difficulty === "medium" || difficulty === "hard") {
        if (experience === "good" || experience === "smooth" || experience === "excellent") {
            if (play_more === "nope" || play_more === "yup" || play_more === "definitely") {
                if (overall_experience === "nice" || overall_experience === "great" || overall_experience === "super") {
                    if (suggestion.replace(/\s/g, '').toString().length > 5) {
                        if (suggestion.replace(/\s/g, '').toString().length < 200) {
                            return true;
                        } else {
                            return "Suggestion Must Be Under 200 characters";
                        }
                    } else {
                        return "Plz Add Some Little Bit suggestion";
                    }
                } else {
                    return "Don't try something stupid :)";
                }
            } else {
                return "Don't try something stupid :)";
            }
        } else {
            return "Don't try something stupid :)";
        }
    } else {
        return "Don't try something stupid :)";
    }
}

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
        // check if that user feedback is already exist in database
        Feedback.findOne({ userId }).then((result) => {
            if (result) {
                return res.status(409).send({
                    Errors: "You Already Submit The Feedback"
                });
            }
            // sanitize the data
            let difficulty = req.body.difficulty;
            difficulty = difficulty.toString();
            let experience = req.body.experience;
            experience = experience.toString();
            let play_more = req.body.play_more;
            play_more = play_more.toString();
            let overall_experience = req.body.overall_experience;
            overall_experience = overall_experience.toString();
            let suggestion = req.body.suggestion;
            suggestion = suggestion.toString();

            // validating all of the fields with help of validate_fields function
            const vaidate_responce = validate_fields(difficulty, experience, play_more, overall_experience, suggestion);

            // if vaidate_responce is not true
            if (vaidate_responce !== true) {
                return res.status(204).send({
                    Errors: vaidate_responce
                });
            }

            // if true save the feedback in database
            const newFeedback = new Feedback(sanitize({
                userId,
                difficulty,
                experience,
                play_more,
                overall_experience,
                suggestion
            }));
            newFeedback.save().then(() => {
                return res.status(200).send({
                    Success: "Thank you for the feedback"
                });
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
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong :("
        });
    }
});

module.exports = router;