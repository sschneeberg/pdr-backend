require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin')

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
//models
const db = require('../models');

router.get('/test', (req,res) => {
    res.json({msg: "OK ON TEST DASHBOARD"})
})

//GET api/dashboard (private)
router.get('/',
    (req,res) => {
    
    if (req.user.permissions !== "admin") {
        db.Ticket.find({
            $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] 
        })
        .then((tickets) => {
            res.status(200).json({ tickets });
        }); 
    }
})


//GET api/dashboard/admin-dashboard (private admin)
router.get('/admin-dashboard', function(req, res, next) {passport.authenticate('jwt', { session: false }), isAdmin(req,res,next);},
    (req, res) => {
        db.Company.findOne({
            name: req.user.company
        }).then(company => {
            let companyInfo = [];
            companyInfo.push(company)
        db.Ticket.find({
            company: company.name
        }).then(tickets => {
            let ticketInfo = [];
            ticketInfo.push(tickets)
            res.json({
                companyInfo,
                ticketInfo
            })
        })
    })
})

    module.exports = router;