const express = require('express');
const router = express.Router();
const Joinmodel = require('../models/Joinmodel');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    try {
        // sanitize the user id
        let userId = req.userId;
        userId = userId.toString();
        // checking the user is approved by admin
        Joinmodel.findById({ _id: userId }).then((data) => {
            const username = data.username;
            if (!data) {
                return res.status(401).send({
                    Errors: "Invalid Auth Token"
                });
            }
            if (!data.approved) {
                return res.status(200).send({
                    Errors: "Not Approved",
                    username
                });
            }
            return res.status(200).send({
                Success: true
            });
        }).catch((error) => {
            console.log(error);
            return res.status(401).send({
                Errors: "Invalid Auth Token"
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            Errors: "Invalid Auth Token"
        });
    }
});

module.exports = router;