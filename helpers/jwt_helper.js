const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const jwt = require('jsonwebtoken');
const client = require('../db/redis');

module.exports = {
    signAccessToken: (userId) => {
        const payload = {
            aud : userId,
            iss: "ctf.fix-assist.com"
        }
        const secret = process.env.JWT_SECRET_KEY;
        const options = {
            expiresIn: '2m',
	    algorithm: 'HS256'
        }
        const token = jwt.sign(payload, secret, options);
        if(token){
            return token;
        }
    },
    signRefreshToken: async (userId) => {
        const payload = {
            aud : userId,
            iss: "ctf.fix-assist.com"
        }
        const secret = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: '10d',
	    algorithm: 'HS256'
        }
        const token = jwt.sign(payload, secret, options);
        if(token){
            const result = await client.SET(userId, token, {
                EX : 10 * 24 * 60 * 60
            });
            if(result === 'OK'){
                return token
            }
        }
    }
}
