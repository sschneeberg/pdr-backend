require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
//models
const db = require('../models');

//GET api/users/test (Public)
router.get('/test', (req, res) => {
    res.status(200).json({ msg: 'User endpoint connection' });
});

//POST api/users/register (Public)
router.post('/register', (req, res) => {
    db.User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            //already have this user, they cannot register again
            res.status(400).json({ msg: 'Email already exsists' });
        } else {
            const newUser = new db.User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            //salt and hash
            bcrypt.genSalt(10, (error1, salt) => {
                if (error1) throw Error;
                bcrypt.hash(newUser.password, salt, (error2, hash) => {
                    if (error2) throw Error;
                    //change password to hash before saving new user
                    newUser.password = hash;
                    newUser
                        .save()
                        .then((createdUser) =>
                            res.status(201).json({ user: createdUser })
                        )
                        .catch((err) => console.log(err));
                });
            });
        }
    });
});

//POST api/users/login (Public)
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.User.findOne({ email }).then((user) => {
        console.log(user);
        if (!user) {
            res.status(400).json({ msg: 'user not found' });
        } else {
            //if user found, check password match
            bcrypt.compare(password, user.password).then((isMatch) => {
                console.log(isMatch);
                if (isMatch) {
                    //send webtoken (create token payload)
                    //send up user information and token
                    const payload = {
                        email: user.email,
                        id: user._id,
                        username: user.username
                        //add any other info you need on the front end here
                    };
                    //sign token and send
                    jwt.sign(
                        payload,
                        JWT_SECRET,
                        { expiresIn: '1h' },
                        (error, token) => {
                            if (error) throw Error;
                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            });
                        }
                    );
                } else {
                    res.status(400).json({
                        msg: 'Login information incorrect'
                    });
                }
            });
        }
    });
});

//GET api/users/current (Private)
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        //passport will check for jwt token for us, if avialable we can access the route
        res.json({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
            //other info if needed
        });
    }
);

module.exports = router;
