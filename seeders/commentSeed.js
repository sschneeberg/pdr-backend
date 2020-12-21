const db = require('../models');

db.Comment.insertMany([
    {
        ticket: '5fe0cfcd18afda00a9eed010',
        comment: 'This is a seed comment for testing purposes',
        commentBy: 'jsmith@company2.com'
    },
    {
        ticket: '5fe0cfcd18afda00a9eed010',
        comment: 'This is a seed user response for testing purposes',
        commentBy: 'customer@email.com'
    }
]);
