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

// POST /api/tickets/ (Public)
router.post('/', (req, res) => {
    db.Ticket.create({
        title: req.body.title,
        company: req.body.company,
        product: req.body.product,
        picture: req.body.picture,
        description: req.body.description,
        createdBy: req.body.id
    })
        .then(() => {
            res.json({ msg: 'Ticket Created' });
        })
        .catch((err) => console.log(err));
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
        db.Comment.find({ ticket: req.params.id })
            .then((comments) => {
                res.status(200).json({ comments: comments });
            })
            .catch((err) => console.log(err));
    }
);

// POST /api/tickets/:id/comments (Private) -- where id is the ticket id
router.post('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.Comment.create({
        ticket: req.params.id,
        comment: req.body.comment,
        commentBy: req.user.id
    })
        .then(() => res.json({ msg: 'Comment created' }))
        .catch((err) => console.log(err));
});

// DELETE /api/tickets/:id/comments (Private) -- where id is comment id
router.delete('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.Comment.remove({ _id: req.params.id }, { justOne: true })
        .then(() => {
            res.json({ msg: 'comment deleted' });
        })
        .catch((err) => console.log(err));
});

// GET /api/ticket/:id (Private) -- where id is ticekt id
router.get(
    '/:id',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isDev(req, res, next);
    },
    (req, res) => {
        //will find tickets for both users and devs
        db.Ticket.findOne({ _id: req.params.id })
            .then((ticket) => {
                //find the assocaited usernames
                db.User.findOne({ _id: ticket.createdBy })
                    .then((creator) => {
                        db.User.findOne({ _id: ticket.assignedTo })
                            .then((dev) => {
                                res.status(200).json({ ticket: ticket, createdBy: creator, assignedTo: dev });
                            })
                            .catch((err) => console.log(err));
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }
);

// PUT /api/tickets/:id (Private) -- where id is ticket id
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'admin') {
        //if admin allow assignTo and proirity edits
        db.Ticket.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    priority: req.body.priority,
                    asignedTo: req.body.assignedTo
                }
            }
        )
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => console.log(err));
    } else if (req.body.permissions === 'dev' || req.body.permissions === 'admin') {
        //if dev or admin allow status change -- add closeAt when closed
        let closedAt = '';
        if (req.body.status === 'Closed') {
            closedAt = new Date();
        }
        db.Ticket.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    status: req.body.status,
                    closedAt: closedAt
                }
            }
        )
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => console.log(err));
    } else {
        //if not dev or admin give message not allowed here
        res.json({ msg: 'You do not have the permissions to access this route' });
    }
});

module.exports = router;
