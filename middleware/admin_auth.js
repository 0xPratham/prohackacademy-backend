const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });

const auth = (req, res, next) => {
    // authenticate the user with static username and password inside config.env file
    if (req.body.username && req.body.username === process.env.USERNAME && req.body.password && req.body.password === process.env.PASSWORD) {
        next();
    } else {
        return res.status(401).send("Are you trying to hack us again because you are not an admin try again after some time :)");
    }
}

module.exports = auth;