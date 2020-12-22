require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');

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
    //modify to check for permissions so user can be both company and customer
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
                        .then((createdUser) => res.status(201).json({ user: createdUser }))
                        .catch((err) => console.log(err));
                });
            });
        }
    });
});

//POST api/users/register-company (Public) (create a company)
router.post('/register-company', (req, res) => {
    //modify to check for permissions so user can be both company and customer
    db.User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            //already have this user, they cannot register again
            res.status(400).json({ msg: 'Email already exsists' });
        } else {
            const newUser = new db.User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                permissions: req.body.permissions,
                company: req.body.company
            });
            //check for company
            db.Company.findOne({name: req.body.company}).then((company) => { 
                if (company) {
                    //if company found, compare keys
                    if (req.body.key === company.key) {
                        //update companies for roles of dev or admin
                        if (newUser.permissions === 'dev') {
                            db.Company.updateOne({
                            name: company.name
                        }, {
                            $push: {
                                "roles.dev": newUser.id
                            }
                        })
                        } else {
                            db.Company.updateOne({
                                name: company.name
                            }, {
                                $push: {
                                    "roles.admin": newUser.id
                                }
                            })
                        }
                    } else {
                        res.status(400).json({msg: "Key doesn't match our records"})
                    }
                } else {
                    // if company doesnt exist, make a new one
                    const newCompany = new db.Company({
                        name: req.body.company,
                        products: req.body.products.split(","),
                        roles: {admin: [newUser.id] },
                    })
                }
            })
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
        if (!user) {
            res.status(400).json({ msg: 'user not found' });
        } else {
            //if user found, check password match
            bcrypt.compare(password, user.password).then((isMatch) => {
                if (isMatch) {
                    //send webtoken (create token payload)
                    //send up user information and token
                    const payload = {
                        email: user.email,
                        id: user._id,
                        username: user.username,
                        permissions: user.permissions
                    };
                    //sign token and send
                    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
                        if (error) throw Error;
                        res.json({
                            success: true,
                            token: `Bearer ${token}`
                        });
                    });
                } else {
                    res.status(400).json({
                        msg: 'Login information incorrect'
                    });
                }
            });
        }
    });
});

// PUT /api/users/:id (Private) -- where id is user id
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    //let any logged in user change their password, email or username
    if (req.body.username) {
        db.User.updateOne({ _id: req.body.id }, { $set: { username: req.body.username } })
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => console.log(err));
    }
    if (req.body.password) {
        bcrypt.genSalt(10, (error1, salt) => {
            if (error1) throw Error;
            bcrypt.hash(req.body.password, salt, (error2, hash) => {
                if (error2) throw Error;
                //change password to hash before saving updated password
                db.User.updateOne({ _id: req.body.id }, { $set: { username: hash } })
                    .then(() => res.json({ msg: 'updated' }))
                    .catch((err) => console.log(err));
            });
        });
    }
    if (req.body.email) {
        db.User.updateOne({ _id: req.body.id }, { $set: { username: req.body.username } })
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => console.log(err));
    }
});

// PUT /api/users/permissions/:id -- where id is user id
router.put(
    '/permissions/:id',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isAdmin(req, res, next);
    },
    (req, res) => {
        if (req.body.permissions === 'admin') {
            db.User.updateOne({ _id: req.params.id }, { $set: { permissions: req.body.permissions } })
                .then(() => {
                    //update company as well
                    db.Company.updateOne(
                        { name: req.user.company },
                        { $push: { 'roles.dev': newUser.id } },
                        { $pull: { 'roles.admin': req.params.id } }
                    );
                })
                .then(() => res.json({ msg: 'updated' }))
                .catch((err) => console.log(err));
        } else if (req.body.permissions === 'dev') {
            db.User.updateOne({ _id: req.params.id }, { $set: { permissions: req.body.permissions } })
                .then(() => {
                    //update company as well
                    db.Company.updateOne(
                        { name: req.user.company },
                        { $pull: { 'roles.dev': newUser.id } },
                        { $push: { 'roles.admin': req.params.id } }
                    );
                })
                .then(() => res.json({ msg: 'updated' }))
                .catch((err) => console.log(err));
        }
    }
);

//GET api/users/current (Private)
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    //passport will check for jwt token for us, if avialable we can access the route
    res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        permissions: req.user.permissions
    });
});

module.exports = router;
