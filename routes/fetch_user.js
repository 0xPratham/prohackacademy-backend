const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Solves = require('../models/Solves');
const { checkApproved } = require('../helpers/approved');
var xss = require('xss');
var sanitize = require('mongo-sanitize');
const Joinmodel = require('../models/Joinmodel');

router.post('/', auth, async (req, res) => {
    try {
        if(!req.body.fetch_username){
            return res.status(404).send({
                Errors: "User Not Found"
            });
        }
        // sanitize the user details
        let userId = req.userId;
        userId = userId?.toString();

        // checking the user approved by admin or not
        const approved_result = await checkApproved(userId);
        if(approved_result === "Not Approved"){
            return res.status(401).send({
                Errors: "Not Approved"
            });
        }

        let clean_username = xss(sanitize(req.body.fetch_username));

        Joinmodel.findOne({ username: clean_username?.toString().trim() }).then((data) => {
            if (!data) {
                return res.status(404).send({
                    Errors: "User Not Found"
                });
            }
            let fetch_userId = data._id.toString().trim();
            let real_fetch_username = data.username.toString().trim();
            let real_fetch_user_points = data.points.toString().trim();
            Solves.find({ userId: fetch_userId }).sort({ date: 1 }).select("-_id -userId -points -flag -__v").then((result) => {
	        Joinmodel.find().sort({ points: -1, last_solve_date: 1 }).limit(parseInt(100)).select("username points last_solve_date -_id").then((place) => {
                    const rank = place.findIndex(item => item.username === real_fetch_username);
                    return res.status(200).send({
                        Success: true,
                        points: real_fetch_user_points,
                        challenge_solve_list: result,
                        username: real_fetch_username,
                        place: parseInt(rank) + 1
                    });
                }).catch((error) => {
                    console.log(error);
                    return res.status(500).send({
                        Errors: "Something Wents Wrong :("
                    });
                });
            }).catch((error) => {
                console.log(error);
                return res.status(404).send({
                    Errors: "User Not Found"
                });
            })
        }).catch((error) => {
            console.log(error);
            return res.status(404).send({
                Errors: "User Not Found"
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong :("
        });
    }
});

module.exports = router;
