require('dotenv').config();
const { response } = require('express');
const express = require('express');
const passport = require('passport');
const router = express.Router();
//models
const db = require('../models');

//PUBLIC ROUTES FOR BUG SUBMIT

// GET /api/tickets/companies (Public)
router.get('/companies', (req, res) => {
    //find all the companies in db and their products
    db.Company.find({}, { name: 1, products: 1, _id: 0 })
        .then((companies) => {
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
        })
        .catch((err) => res.json({ msg: err }));
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
        .catch((err) => res.json({ msg: err }));
});

//PRIVATE ROUTES FOR VIEWING BUG DETAILS

// GET /api/tickets/:id/comments  (Private) -- where id is a ticket id
router.get('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.Comment.find({ ticket: req.params.id })
        .then((comments) => {
            res.status(200).json({ comments: comments });
        })
        .catch((err) => res.json({ msg: err }));
});

// POST /api/tickets/:id/comments (Private) -- where id is the ticket id
router.post('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    db.Comment.create({
        ticket: req.params.id,
        comment: req.body.comment,
        commentBy: req.user.id
    })
        .then(() => res.json({ msg: 'Comment created' }))
        .catch((err) => res.json({ msg: err }));
});

// DELETE /api/tickets/:id/comments (Private) -- where id is comment id
router.delete('/:id/comments', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions == 'admin') {
        db.Comment.remove({ _id: req.params.id }, { justOne: true })
            .then(() => {
                res.json({ msg: 'comment deleted' });
            })
            .catch((err) => res.json({ msg: err }));
    } else {
        res.json({ msg: 'You do not have the permissions to access this route' });
    }
});

// GET /api/tickets/search (Private)
router.get('/search', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'dev' || req.user.permissions === 'admin') {
        console.log('here');
        db.Ticket.find({ company: req.user.company })
            .then((tickets) => {
                res.status(200).json({ tickets });
            })
            .catch((err) => res.json({ msg: err }));
    } else {
        res.json({ msg: 'You do not have the permissions to access this page' });
    }
});

// GET /api/tickets/:id (Private) -- where id is ticekt id
router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'dev' || req.user.permissions === 'admin') {
        db.Ticket.findOne({ _id: req.params.id })
            .then((ticket) => {
                //find the assocaited usernames
                db.User.findOne({ _id: ticket.createdBy })
                    .then((creator) => {
                        db.User.findOne({ _id: ticket.assignedTo })
                            .then((dev) => {
                                res.status(200).json({ ticket: ticket, createdBy: creator, assignedTo: dev });
                            })
                            .catch((err) => res.json({ msg: err }));
                    })
                    .catch((err) => res.json({ msg: err }));
            })
            .catch((err) => res.json({ msg: err }));
    } else {
        res.json({ msg: 'You do not have the permissions to access this page' });
    }
});

// PUT /api/tickets/:id (Private) -- where id is ticket id
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.permissions === 'admin' && req.body.priority) {
        //if admin allow assignTo and proirity edits
        db.Ticket.updateOne(
            { _id: req.params.id },
            {
                $set: { priority: parseInt(req.body.priority) },
                $push: { assignedTo: req.body.assignedTo }
            }
        )
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => res.json({ msg: err }));
    } else if (req.user.permissions === 'dev' || req.user.permissions === 'admin') {
        //if dev or admin allow status change -- add closeAt when closed
        let closedDate = '';
        if (req.body.status === 3) {
            closedDate = new Date();
        }
        db.Ticket.updateOne(
            { _id: req.params.id },
            {
                $set: {
                    status: parseInt(req.body.status),
                    closedAt: closedDate
                }
            }
        )
            .then(() => res.json({ msg: 'updated' }))
            .catch((err) => res.json({ msg: err }));
    } else {
        //if not dev or admin give message not allowed here
        res.json({ msg: 'You do not have the permissions to access this route' });
    }
});

module.exports = router;
