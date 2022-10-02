const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const client = require('../db/redis');

router.delete('/', auth, async (req, res) => {
    try {
        // sanitize the user id
        let userId = req.userId;
        userId = userId.toString();
        client.del(userId).then(() => {
	    res.clearCookie('server_session');
            res.clearCookie('user_session');
            return res.status(204).send({
                Success : "Logout SuccessFully"
            });
        }).catch((error) => {
            console.log(error);
            return res.status(500).send({
                Errors: "Failed To Logout"
            });
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            Errors: "Failed To Logout"
        });
    }
});

module.exports = router;
