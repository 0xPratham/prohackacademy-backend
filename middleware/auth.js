const dotenv = require('dotenv');
const path = require('path')
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const jwt = require('jsonwebtoken');
const Joinmodel = require('../models/Joinmodel');
const { signAccessToken, signRefreshToken } = require('../helpers/jwt_helper');
const client = require('../db/redis');
let verified_userId = '';

// creating a middleware for check the jwt token
const auth = (req, res, next) => {
    // first checking refresh token is in req or not 
    if (!req.cookies["server_session"]) {
        return res.status(401).send({
            Errors: "Invalid Auth Token"
        });
    }
    try {
        const refresh_token_data = jwt.verify(req.cookies["server_session"], process.env.REFRESH_TOKEN_SECRET, {algorithms: 'HS256'});
        if(!refresh_token_data){
            return res.status(401).send({
                Errors: "Invalid Auth Token"
            });
        }
        if (!refresh_token_data.aud) {
            return res.status(401).send({
                Errors: "Invalid Auth Token"
            });
        }
        verified_userId = refresh_token_data.aud;
        client.GET(refresh_token_data.aud).then((redis_result) => {
            if(req.cookies["server_session"] !== redis_result){
                return res.status(401).send({
                    Errors: "Invalid Auth Token"
                });
            }
            if(!req.cookies["user_session"]){
                Joinmodel.findById({ _id: verified_userId }).then((data) => {
                    if (!data) {
                        return res.status(401).send({
                            Errors: "Invalid Auth Token"
                        });
                    }
                    // if everything is correct we can generate the new user_session token and server_session (refresh token) token
                    const token = signAccessToken(data._id);
                    signRefreshToken(data._id).then((Refreshtoken) => {
                        if(!token || !Refreshtoken){
                            return res.status(500).send({
                                Errors: "Something Wents Wrong While Generating Token"
                            });
                        }
                        res.cookie("user_session", token, {
                            expires: new Date(Date.now() + 120000),
                            httpOnly: true,
                            secure: true   // add this when using https
                        });
                        // set the server_session token in cookies
                        res.cookie("server_session", Refreshtoken, {
                            expires: new Date(Date.now() + 864000000),
                            httpOnly: true,
                            secure: true   // add this when using https
                        });
                        req.userId = data._id;
                        req.username = data.username;
                        req.points = data.points;
                        next();
                    }).catch((error) => {
                        console.log(error);
                        return res.status(500).send({
                            Errors: "Something Wents Wrong While Generating Token"
                        });
                    })
                }).catch((error) => {
                    console.log(error);
                    return res.status(401).send({
                        Errors: "Invalid Auth Token"
                    });
                });
            }else{
                // get the token from req
                const cookie_token = req.cookies["user_session"];
                // checking the token is valid or not
                const data = jwt.verify(cookie_token, process.env.JWT_SECRET_KEY, {algorithms: 'HS256'});
                if (!data) {
                    return res.status(401).send({
                        Errors: "Invalid Auth Token"
                    });
                }
                if (!data.aud) {
                    return res.status(401).send({
                        Errors: "Invalid Auth Token"
                    });
                }
                Joinmodel.findById({ _id: data.aud }).then((data) => {
                    if (!data) {
                        return res.status(401).send({
                            Errors: "Invalid Auth Token"
                        });
                    }
                    // if userId is there we add that in req with username
                    req.userId = data._id;
                    req.username = data.username;
                    req.points = data.points;
                    // send the userId in further use
                    next();
                }).catch((error) => {
                    console.log(error);
                    return res.status(401).send({
                        Errors: "Invalid Auth Token"
                    });
                });
            }
        }).catch((error) => {
            console.log(error);
            return res.status(401).send({
                Errors: "Invalid Auth Token"
            });
        })
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            Errors: "Invalid Auth Token"
        });
    }
}

module.exports = auth;
