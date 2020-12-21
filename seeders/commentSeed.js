const db = require('../models');

db.Comment.insertMany([
    {
        ticket: '',
        comment: 'This is a seed comment for testing purposes',
        commentBy: 'jsmith@company2.com'
    },
    {
        ticket: '',
        comment: 'This is a seed user response for testing purposes',
        commentBy: 'customer@email.com'
    }
]);
