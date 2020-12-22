require('dotenv').config();
const express = require('express');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
//models
const db = require('../models');

// DELETE /api/company/:id (private) -- where id is admin user id who is deleting company
router.delete(
    '/:id',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isAdmin(req, res, next);
    },
    (req, res) => {
        //find the user's company
        let user = req.user;
        //delete that company
        db.Company.remove({ name: user.company }, { justOne: true })
            .then(() => {
                //delete all it's users
                db.User.deleteMany({ company: user.company })
                    .then(() => {
                        res.json({ msg: 'Company and users deleted' });
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }
);
