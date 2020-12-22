require('dotenv').config();
const express = require('express');
const passport = require('passport');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();
//models
const db = require('../models');

// DELETE /api/company/:name
router.delete(
    '/:name',
    function (req, res, next) {
        passport.authenticate('jwt', { session: false });
        isAdmin(req, res, next);
    },
    (req, res) => {}
);
