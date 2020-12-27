require('dotenv').config();
const express = require('express');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
//models
const db = require('../models');

// GET /api/company (Private)
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'admin') {
        //find the user's company
        let user = req.user;
        //delete that company
        db.Company.findOne({ name: user.company })
            .then((company) => {
                res.status(200).json({ key: company.companyKey });
            })
            .catch((err) => res.json({ msg: err }));
    } else {
        res.json({ msg: 'You do not have the permissions to access this route.' });
    }
});

// DELETE /api/company (private)
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permission === 'admin') {
        //find the user's company
        let user = req.user;
        //delete that company
        db.Company.deleteOne({ name: user.company })
            .then(() => {
                //delete all it's users
                db.User.deleteMany({ company: user.company })
                    .then(() => {
                        res.json({ msg: 'Company and users deleted' });
                    })
                    .catch((err) => res.json({ msg: err }));
            })
            .catch((err) => res.json({ msg: err }));
    } else {
        res.json({ msg: 'You do not have the permissions to access this route.' });
    }
});

module.exports = router;
