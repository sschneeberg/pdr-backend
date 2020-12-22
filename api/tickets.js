require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isDev = require('../middleware/isDev');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
//models
const db = require('../models');

//PUBLIC ROUTES FOR BUG SUBMIT

// GET /api/tickets/companies (Public)
router.get('/companies', (req, res) => {
    //find all the companies in db and their products
    db.Company.find({}, { name: 1, products: 1, _id: 0 }).then((companies) => {
        const companyMap = {};
        //create map for company: product
        for (company of companies) {
            companyMap[company.name] = company.products;
        }
        //send up array of companies and map of company name to products
        res.status(200).json({
            companies: companies,
            company_products: companyMap
        });
    });
});

//PRIVATE ROUTES FOR VIEWING BUG DETAILS

// GET /api/tickets/:id/comments  (Private) -- where id is a ticket id
router.get(
    '/:id/comments',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isDev(req, res, next);
    },
    (req, res) => {
        db.Comment.find({ ticket: req.params.id }).then((comments) => {
            res.status(200).json({ comments: comments });
        });
    }
);

// POST /api/tickets/:id/comments (Private) -- where id is the ticket id
router.post('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.Comment.create({
        ticket: req.params.id,
        comment: req.body.comment,
        commentBy: req.user.id,
    })
})


// GET /api/tickets/:id (Private)  -- where id is user id
router.get(
    '/:id',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isDev(req, res, next);
    },
    (req, res) => {
        //will find tickets for both users and devs
        db.Ticket.find({ $or: [{ createdBy: req.params.id }, { assignedTo: req.params.id }] }).then((tickets) => {
            res.status(200).json({ tickets: tickets });
        });
    }
);

// POST /api/tickets/:id (Private) --- where consumer creates a ticket
router.post('/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    db.Ticket.create({
        title: req.body.title,
        company: req.body.company,
        product: req.body.product,
        picture: req.body.picture,
        description: req.body.description,
        createdBy: req.user.id
    })
})


module.exports = router;
