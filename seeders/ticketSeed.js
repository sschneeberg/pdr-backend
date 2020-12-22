const db = require('../models');

//Run this file after grabbing ids from created users

db.Ticket.insertMany([
    {
        title: 'Test Bug',
        company: 'Test Company 1',
        product: 'website 1',
        description: 'This is a seed ticket created for testing purposes',
        createdBy: ''
    },
    {
        title: 'Another Bug',
        company: 'Test Company 2',
        product: 'Desktop App',
        description: 'This is a seed bug created for testing purposes',
        createdBy: '',
        assignedTo: '',
        priority: '3',
        status: 'In Review'
    }
]);
