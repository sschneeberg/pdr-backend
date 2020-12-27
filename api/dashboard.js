require('dotenv').config();
const { json } = require('express');
const express = require('express');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
//models
const db = require('../models');

router.get('/test', (req, res) => {
    res.json({ msg: 'OK ON TEST DASHBOARD' });
});

//GET api/dashboard (private)
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions !== 'admin') {
        db.Ticket.find({
            $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }]
        })
            .then((tickets) => {
                res.status(200).json({ tickets });
            })
            .catch((err) => res.json({ msg: err }));
    }
});

//GET api/dashboard/admin-dashboard (private admin)
router.get(
    '/admin-dashboard',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false }), isAdmin(req, res, next);
    },
    (req, res) => {
        db.Company.findOne({
            name: req.body.company
        })
            .then((company) => {
                db.Ticket.find({
                    company: company.name
                })
                    .then((tickets) => {
                        db.User.find({ company: company.name })
                            .then((users) => {
                                res.json({
                                    company: company,
                                    tickets: tickets,
                                    users: users
                                });
                            })
                            .catch((err) => res.json({ err }));
                    })
                    .catch((err) => res.json({ msg: err }));
            })
            .catch((err) => res.json({ msg: err }));
    }
);

module.exports = router;
