const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkApproved } = require('../helpers/approved');

router.get('/', auth, async (req, res) => {
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
        return res.status(200).send({
            Success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Something Wents Wrong :("
        });
    }
});

module.exports = router;