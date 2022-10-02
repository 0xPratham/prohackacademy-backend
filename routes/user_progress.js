const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Solves = require('../models/Solves');
const { checkApproved } = require('../helpers/approved');
const Joinmodel = require('../models/Joinmodel');

router.post('/', auth, async (req, res) => {
    try {
        // sanitize the user details
        let userId = req.userId;
        userId = userId.toString();
        let username = req.username;
        username = username.toString();
        let points = req.points;

        // checking the user approved by admin or not
        const approved_result = await checkApproved(userId);
        if(approved_result === "Not Approved"){
            return res.status(401).send({
                Errors: "Not Approved"
            });
        }
        
        Solves.find({ userId }).sort({ date: 1 }).select("-_id -userId -points -flag -__v").then((result) => {
	    Joinmodel.find().sort({ points: -1, last_solve_date: 1 }).limit(parseInt(100)).select("username points last_solve_date -_id").then((place) => {
                const rank = place.findIndex(item => item.username === username);
                return res.status(200).send({
                    points,
                    challenge_solve_list: result,
                    username,
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
