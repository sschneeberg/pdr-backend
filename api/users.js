require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
//models
const db = require('../models');

// GET api/users/test (Public)
router.get('/test', (req, res) => {
    res.status(200).json({ msg: 'User endpoint connection' });
});

// POST api/users/register (Public)
router.post('/register', (req, res) => {
    //modify to check for permissions so user can be both company and customer
    db.User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            //already have this user, they cannot register again
            res.json({ msg: 'Email already exsists' });
        } else {
            const newUser = new db.User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            //salt and hash
            bcrypt.genSalt(10, (error1, salt) => {
                if (error1) res.json({ msg: error1 });
                bcrypt.hash(newUser.password, salt, (error2, hash) => {
                    if (error2) res.json({ msg: error2 });
                    //change password to hash before saving new user
                    newUser.password = hash;
                    newUser
                        .save()
                        .then((createdUser) => res.status(201).json({ user: createdUser }))
                        .catch((err) => res.json({ msg: err }));
                });
            });
        }
    });
});

// POST api/users/register-company (Public)
router.post('/register-company', (req, res) => {
    //modify to check for permissions so user can be both company and customer
    db.User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            //already have this user, they cannot register again
            res.json({ msg: 'Email already exsists' });
        } else {
            db.Company.findOne({
                name: req.body.company
            }).then((company) => {
                if (company) {
                    if (req.body.companyKey === company.companyKey) {
                        const newUser = new db.User({
                            username: req.body.username,
                            email: req.body.email,
                            password: req.body.password,
                            permissions: req.body.permissions,
                            company: company.name
                        });
                        //salt and hash
                        bcrypt.genSalt(10, (error1, salt) => {
                            if (error1) res.json({ msg: error1 });
                            bcrypt.hash(newUser.password, salt, (error2, hash) => {
                                if (error2) res.json({ msg: error2 });
                                //change password to hash before saving new user
                                newUser.password = hash;
                                newUser.save().then((createdUser) => {
                                    if (createdUser.permissions === 'dev') {
                                        db.Company.updateOne(
                                            {
                                                name: createdUser.company
                                            },
                                            {
                                                $push: {
                                                    'roles.dev': createdUser._id
                                                }
                                            }
                                        )
                                            .then(() => {
                                                res.status(201).json({ user: createdUser });
                                            })
                                            .catch((err) => res.json({ msg: err }));
                                    } else {
                                        db.Company.findOneAndUpdate(
                                            {
                                                _id: company._id
                                            },
                                            {
                                                $push: {
                                                    'roles.admin': createdUser._id
                                                }
                                            }
                                        )
                                            .then(() => {
                                                res.status(201).json({ user: createdUser });
                                            })
                                            .catch((err) => res.json({ msg: err }));
                                    }
                                });
                            });
                        });
                    } else {
                        res.json({ msg: 'Keys do not match our records' });
                    }
                } else {
                    const newUser = new db.User({
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        permissions: req.body.permissions,
                        company: req.body.company
                    });
                    bcrypt.genSalt(10, (error1, salt) => {
                        if (error1) res.json({ msg: error1 });
                        bcrypt.hash(newUser.password, salt, (error2, hash) => {
                            if (error2) res.json({ msg: error2 });
                            //change password to hash before saving new user
                            newUser.password = hash;
                            newUser
                                .save()
                                .then((createdUser) =>
                                    db.Company.create({
                                        name: req.body.company,
                                        products: req.body.products.split(','),
                                        roles: { admin: [createdUser._id] }
                                    }).then(() => {
                                        res.status(201).json({ user: createdUser });
                                    })
                                )
                                .catch((err) => res.json({ msg: err }));
                        });
                    });
                }
            });
        }
    });
});

// POST api/users/login (Public)
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.json({ msg: 'user not found' });
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
                            company: user.company,
                            permissions: user.permissions
                        };
                        //sign token and send
                        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (error, token) => {
                            if (error) console.log(error);
                            res.json({
                                success: true,
                                token: `Bearer ${token}`
                            });
                        });
                    } else {
                        res.json({
                            msg: 'Login information incorrect'
                        });
                    }
                });
            }
        })
        .catch((err) => res.json({ msg: err }));
});

// POST api/users/reset (Public)
router.post('/reset', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.json({ msg: 'user not found' });
            } else {
                //if user found, reset password
                bcrypt.genSalt(10, (error1, salt) => {
                    if (error1) res.json({ msg: error1 });
                    bcrypt.hash(password, salt, (error2, hash) => {
                        if (error2) res.json({ msg: error2 });
                        //update user
                        db.User.updateOne({ email }, { $set: { password: hash } })
                            .then(() => res.status(201).json({ msg: 'Reset' }))
                            .catch((err) => res.json({ msg: err }));
                    });
                });
            }
        })
        .catch((err) => res.json({ msg: err }));
});

// GET api/users/:id (Private)
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.User.findOne({ _id: req.params.id }).then((user) => {
        res.status(200).json({
            user: {
                username: user.username,
                email: user.email,
                company: user.company,
                id: user._id,
                permissions: user.permissions
            }
        });
    });
});

// PUT /api/users/:id (Private) -- where id is user id
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    //let any logged in user change their password, email or username
    if (req.body.username) {
        db.User.updateOne({ _id: req.params.id }, { $set: { username: req.body.username } })
            .then(() => res.json({ msg: 'username updated' }))
            .catch((err) => res.json({ msg: err }));
    }
    if (req.body.password) {
        bcrypt.genSalt(10, (error1, salt) => {
            if (error1) res.json({ msg: error1 });
            bcrypt.hash(req.body.password, salt, (error2, hash) => {
                if (error2) res.json({ msg: error2 });
                //change password to hash before saving updated password
                db.User.updateOne({ _id: req.params.id }, { $set: { password: hash } })
                    .then(() => res.json({ msg: 'password updated' }))
                    .catch((err) => res.json({ msg: err }));
            });
        });
    }
    if (req.body.email) {
        //make sure no one else has this email
        db.User.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    res.json({ msg: 'Email in use by another account' });
                } else {
                    db.User.updateOne({ _id: req.params.id }, { $set: { email: req.body.email } })
                        .then(() => res.json({ msg: 'email updated' }))
                        .catch((err) => res.json({ msg: err }));
                }
            })
            .catch((err) => res.json({ msg: err }));
    }
});

// PUT /api/users/permissions/:id -- where id is user id
router.put('/permissions/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'admin') {
        if (req.body.permissions === 'admin') {
            db.User.updateOne({ _id: req.params.id }, { $set: { permissions: req.body.permissions } })
                .then(() => {
                    //update company as well
                    db.Company.updateOne(
                        { name: req.user.company },
                        { $pull: { 'roles.dev': req.params.id }, $push: { 'roles.admin': req.params.id } }
                    )
                        .then(() => res.json({ msg: 'updated' }))
                        .catch((err) => res.json({ msg: err }));
                })
                .catch((err) => res.json({ msg: err }));
        } else if (req.body.permissions === 'dev') {
            db.User.updateOne({ _id: req.params.id }, { $set: { permissions: req.body.permissions } })
                .then(() => {
                    //update company as well
                    db.Company.updateOne(
                        { name: req.user.company },
                        { $push: { 'roles.dev': req.params.id }, $pull: { 'roles.admin': req.params.id } }
                    )
                        .then(() => res.json({ msg: 'updated' }))
                        .catch((err) => res.json({ msg: err }));
                })
                .catch((err) => res.json({ msg: err }));
        }
    } else {
        res.json({ msg: 'You do not have the permissions to access this route' });
    }
});

// DELETE api/users/:id (private) -- where id is user id
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.User.findOne({ _id: req.params.id })
        .then((user) => {
            if (user.company) {
                //company member, remove from roles
                if (user.permissions === 'dev') {
                    db.Company.findOneAndUpdate({ name: user.company }, { $pull: { 'roles.dev': req.params.id } }).then(
                        () => {
                            db.User.deleteOne({ _id: req.params.id }, { justOne: true })
                                .then(() => {
                                    console.log('dev');
                                    res.json({ msg: 'Account deleted' });
                                })
                                .catch((err) => res.json({ msg: err }));
                        }
                    );
                } else if (user.permissions === 'admin') {
                    db.Company.findOneAndUpdate(
                        { name: user.company },
                        { $pull: { 'roles.admin': req.params.id } }
                    ).then(() => {
                        db.User.deleteOne({ _id: req.params.id }, { justOne: true })
                            .then(() => {
                                console.log('admin');
                                res.json({ msg: 'Account deleted' });
                            })
                            .catch((err) => res.json({ msg: err }));
                    });
                }
            } else {
                //just a regular user
                db.User.deleteOne({ _id: req.params.id }, { justOne: true })
                    .then(() => {
                        console.log('regular');
                        res.json({ msg: 'Account deleted' });
                    })
                    .catch((err) => res.json({ msg: err }));
            }
        })
        .catch((err) => res.json({ msg: err }));
});

module.exports = router;
