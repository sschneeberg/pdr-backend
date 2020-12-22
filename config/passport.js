require('dotenv').config();

//authentication strategy with a json webtoken
//authenticate endpoints using a token
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const db = require('../models');

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken;
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(options, (jwt_payload, done) => {
            //note: jwt_payload is an object that contains the decoded JWT payload
            //note: done is a callback that takes an error as a first argument then information to pass up
            //find user from id in payload, check if in db
            db.User.findById(jwt_payload.id)
                .then((user) => {
                    if (user) {
                        //if user, return null for error and return user
                        return done(null, user);
                    } else {
                        //no user found in database
                        return done(null, false);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        })
    );
};
