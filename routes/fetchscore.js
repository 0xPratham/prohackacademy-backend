const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joinmodel = require('../models/Joinmodel');
const { checkApproved } = require('../helpers/approved');

router.post('/', auth, async (req, res) => {
    try {
        // sanitize the user id
        let userId = req.userId;
        userId = userId.toString();
        // checking the user approved by admin or not
        const approved_result = await checkApproved(userId);
        if(approved_result === "Not Approved"){
            return res.status(401).send({
                Errors: "Not Approved"
            });
        }

        // fetch score of each user in users collection
        Joinmodel.find().sort({ points: -1, last_solve_date: 1 }).limit(parseInt(100)).select("username points last_solve_date -_id").then((result) => {
            res.status(200).send(result);
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