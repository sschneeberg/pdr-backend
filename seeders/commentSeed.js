const db = require('../models');

//Run this seed file after grabbing a ticket id from a created ticket

db.Comment.insertMany([
    {
        ticket: '',
        comment: 'This is a seed comment for testing purposes',
        commentBy: ''
    },
    {
        ticket: '',
        comment: 'This is a seed user response for testing purposes',
        commentBy: ''
    }
]);
